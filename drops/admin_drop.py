import os
import sys
import json
import random
import argparse
from datetime import datetime
from solana.rpc.api import Client
from solana.publickey import PublicKey
from firebase_admin import credentials, firestore, initialize_app
from dotenv import load_dotenv
import numpy as np

# Load environment variables from .env in the parent directory (root)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Config
SOLANA_RPC_URL = os.getenv('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com')
TOKEN_MINT_ADDRESS = os.getenv('TOKEN_MINT_ADDRESS')
MINIMUM_BALANCE = int(os.getenv('MINIMUM_BALANCE_FOR_DROPS', '1000'))
FIREBASE_SERVICE_ACCOUNT = os.getenv('FIREBASE_SERVICE_ACCOUNT')

if not TOKEN_MINT_ADDRESS:
    print('Error: TOKEN_MINT_ADDRESS is not set in environment.')
    sys.exit(1)
if not FIREBASE_SERVICE_ACCOUNT:
    print('Error: FIREBASE_SERVICE_ACCOUNT is not set in environment.')
    sys.exit(1)

# Parse arguments
def parse_args():
    parser = argparse.ArgumentParser(description='Run a drop and select winners with advanced options.')
    parser.add_argument('--num-winners', type=int, required=True, help='Total number of winners to select')
    parser.add_argument('--num-winners-guaranteed', type=int, default=0, help='Number of top-balance winners to guarantee')
    parser.add_argument('--winner-selection-mode', type=str, choices=['random', 'weighted'], default='random', help='How to select remaining winners: random or weighted by balance')
    parser.add_argument('--source', type=str, choices=['firebase', 'file'], default='firebase', 
                       help='Source for wallet addresses: firebase (from users collection) or file (from text file)')
    parser.add_argument('--wallets-file', type=str, help='Path to file with wallet addresses (one per line) - only needed if source is "file"')
    return parser.parse_args()

# Initialize Firebase
cred = credentials.Certificate(json.loads(FIREBASE_SERVICE_ACCOUNT))
initialize_app(cred)
db = firestore.client()

# Initialize Solana connection
solana_client = Client(SOLANA_RPC_URL)
token_mint = PublicKey(TOKEN_MINT_ADDRESS)

def get_token_balance(wallet_address):
    try:
        resp = solana_client.get_token_accounts_by_owner(PublicKey(wallet_address), {'mint': str(token_mint)})
        value = resp['result']['value']
        if value:
            # Only check the first account
            amount = value[0]['account']['data']['parsed']['info']['tokenAmount']['uiAmount']
            return amount or 0
        return 0
    except Exception as e:
        print(f'Error checking balance for {wallet_address}: {e}')
        return 0

def get_wallets_from_firebase():
    """Get wallet addresses from Firebase users collection"""
    try:
        users_ref = db.collection('users')
        query = users_ref.where('balance', '>=', MINIMUM_BALANCE)
        docs = query.stream()
        wallet_addresses = []
        for doc in docs:
            data = doc.to_dict()
            if 'walletAddress' in data:
                wallet_addresses.append(data['walletAddress'])
        print(f'Found {len(wallet_addresses)} eligible users in Firebase')
        return wallet_addresses
    except Exception as e:
        print(f'Error reading from Firebase: {e}')
        return []

def get_wallets_from_file(file_path):
    """Get wallet addresses from text file"""
    try:
        with open(file_path, 'r') as f:
            wallet_addresses = [line.strip() for line in f if line.strip()]
        print(f'Found {len(wallet_addresses)} wallet addresses in file')
        return wallet_addresses
    except Exception as e:
        print(f'Error reading file {file_path}: {e}')
        return []

def main():
    args = parse_args()
    num_winners = args.num_winners
    num_winners_guaranteed = args.num_winners_guaranteed
    winner_selection_mode = args.winner_selection_mode
    source = args.source

    # Get wallet addresses based on source
    if source == 'firebase':
        wallet_addresses = get_wallets_from_firebase()
    elif source == 'file':
        if not args.wallets_file:
            print('Error: --wallets-file is required when source is "file"')
            sys.exit(1)
        wallet_addresses = get_wallets_from_file(args.wallets_file)
    else:
        print(f'Error: Unknown source "{source}"')
        sys.exit(1)

    if not wallet_addresses:
        print('No wallet addresses found.')
        sys.exit(1)

    # Check eligibility
    eligible_users = []
    for wallet in wallet_addresses:
        balance = get_token_balance(wallet)
        if balance >= MINIMUM_BALANCE:
            eligible_users.append({
                'walletAddress': wallet,
                'tokenBalance': balance
            })

    if len(eligible_users) < num_winners:
        print(f'Not enough eligible users. Found {len(eligible_users)} with {MINIMUM_BALANCE}+ tokens, need {num_winners}.')
        sys.exit(1)

    # Sort eligible users by balance (descending)
    eligible_users_sorted = sorted(eligible_users, key=lambda x: x['tokenBalance'], reverse=True)

    # Select guaranteed winners
    guaranteed_winners = eligible_users_sorted[:num_winners_guaranteed] if num_winners_guaranteed > 0 else []
    guaranteed_wallets = set(w['walletAddress'] for w in guaranteed_winners)

    # Remaining eligible users (not already guaranteed)
    remaining_eligible = [u for u in eligible_users_sorted if u['walletAddress'] not in guaranteed_wallets]
    num_remaining_winners = num_winners - len(guaranteed_winners)

    # Select remaining winners
    if num_remaining_winners > 0:
        if winner_selection_mode == 'random':
            if len(remaining_eligible) < num_remaining_winners:
                print(f'Not enough remaining eligible users for random selection. Needed {num_remaining_winners}, found {len(remaining_eligible)}.')
                sys.exit(1)
            random_winners = random.sample(remaining_eligible, num_remaining_winners)
        elif winner_selection_mode == 'weighted':
            # Weighted random selection by balance
            weights = np.array([u['tokenBalance'] for u in remaining_eligible], dtype=float)
            weights_sum = weights.sum()
            if weights_sum == 0:
                print('All remaining eligible users have zero balance, cannot do weighted selection.')
                sys.exit(1)
            weights = weights / weights_sum
            if len(remaining_eligible) < num_remaining_winners:
                print(f'Not enough remaining eligible users for weighted selection. Needed {num_remaining_winners}, found {len(remaining_eligible)}.')
                sys.exit(1)
            idxs = np.random.choice(len(remaining_eligible), size=num_remaining_winners, replace=False, p=weights)
            random_winners = [remaining_eligible[i] for i in idxs]
        else:
            print(f'Unknown winner selection mode: {winner_selection_mode}')
            sys.exit(1)
    else:
        random_winners = []

    # Combine winners
    winners = guaranteed_winners + random_winners

    # Mark how each winner was selected
    for w in winners:
        if w in guaranteed_winners:
            w['selectionType'] = 'guaranteed'
        else:
            w['selectionType'] = winner_selection_mode

    # Create drop record
    drop_id = f'drop_{int(datetime.utcnow().timestamp() * 1000)}'
    timestamp = datetime.utcnow().isoformat() + 'Z'
    drop_record = {
        'dropId': drop_id,
        'winners': winners,
        'timestamp': timestamp,
        'numWinners': num_winners,
        'numWinnersGuaranteed': num_winners_guaranteed,
        'winnerSelectionMode': winner_selection_mode,
        'minimumTokenBalance': MINIMUM_BALANCE,
        'totalEligibleUsers': len(eligible_users),
        'tokenMintAddress': TOKEN_MINT_ADDRESS,
        'createdAt': timestamp
    }

    # Write to Firestore
    db.collection('drops').document(drop_id).set(drop_record)

    print('Drop completed!')
    print(json.dumps({
        'dropId': drop_id,
        'winners': winners,
        'totalEligibleUsers': len(eligible_users),
        'minimumTokenBalance': MINIMUM_BALANCE,
        'numWinnersGuaranteed': num_winners_guaranteed,
        'winnerSelectionMode': winner_selection_mode,
        'timestamp': timestamp
    }, indent=2))

if __name__ == '__main__':
    main() 