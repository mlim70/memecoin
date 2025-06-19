import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { randomInt } from "crypto"; // Node.js 16+ for secure randomness
import { Connection, PublicKey } from "@solana/web3.js";

admin.initializeApp();
const db = admin.firestore();

// Configuration from environment variables
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const TOKEN_MINT_ADDRESS = process.env.TOKEN_MINT_ADDRESS || "YOUR_TOKEN_MINT_ADDRESS_HERE";
const MINIMUM_TOKEN_BALANCE = parseInt(process.env.MINIMUM_TOKEN_BALANCE || "1000");

// Initialize Solana connection
const connection = new Connection(SOLANA_RPC_URL);

// Helper function to get token balance for a wallet
async function getTokenBalance(walletAddress: string): Promise<number> {
  try {
    const walletPubkey = new PublicKey(walletAddress);
    const tokenMint = new PublicKey(TOKEN_MINT_ADDRESS);
    
    // Get all token accounts for this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
      mint: tokenMint,
    });
    
    if (tokenAccounts.value.length === 0) {
      return 0; // No token account found
    }
    
    // Get the balance from the first token account
    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance || 0;
  } catch (error) {
    console.error(`Error getting token balance for ${walletAddress}:`, error);
    return 0;
  }
}

// Type definitions
interface WalletUser {
  id: string;
  walletAddress: string;
  name?: string;
  shippingAddress?: string;
  eligible?: boolean;
  updatedAt?: any;
}

interface EligibleUser extends WalletUser {
  tokenBalance: number;
}

export const runDrop = functions.https.onCall(async (data: any, context: any) => {
  // 1. Security: Only allow admins to run the drop
  if (!context.auth?.token?.admin) {
    throw new functions.https.HttpsError("permission-denied", "Only admins can run drops.");
  }

  // 2. Get number of winners (default 1)
  const numWinners = data.numWinners || 1;
  const dropId = `drop_${Date.now()}`;

  // 3. Fetch all users with wallet addresses
  const snapshot = await db.collection("wallets").get();
  const walletUsers: WalletUser[] = snapshot.docs.map(doc => ({ 
    id: doc.id, 
    walletAddress: doc.id, // The document ID is the wallet address
    ...doc.data() 
  }));

  if (walletUsers.length === 0) {
    throw new functions.https.HttpsError("failed-precondition", "No users with connected wallets found.");
  }

  // 4. Check token balances and filter eligible users
  const eligibleUsers: EligibleUser[] = [];
  for (const user of walletUsers) {
    const tokenBalance = await getTokenBalance(user.walletAddress);
    if (tokenBalance >= MINIMUM_TOKEN_BALANCE) {
      eligibleUsers.push({
        ...user,
        tokenBalance
      });
    }
  }

  if (eligibleUsers.length < numWinners) {
    throw new functions.https.HttpsError(
      "failed-precondition", 
      `Not enough eligible users. Found ${eligibleUsers.length} users with ${MINIMUM_TOKEN_BALANCE}+ tokens, need ${numWinners}.`
    );
  }

  // 5. Securely pick random winners (prevents duplicates within same drop)
  const winners: EligibleUser[] = [];
  const usedIndexes = new Set<number>();
  while (winners.length < numWinners) {
    const idx = randomInt(eligibleUsers.length); // cryptographically secure
    if (!usedIndexes.has(idx)) {
      winners.push(eligibleUsers[idx]);
      usedIndexes.add(idx);
    }
  }

  // 6. Log the drop event with token balance information
  const dropLogRef = db.collection("drops").doc(dropId);
  await dropLogRef.set({
    dropId,
    winners: winners.map(w => ({
      walletAddress: w.walletAddress,
      tokenBalance: w.tokenBalance,
      name: w.name || "Unknown"
    })),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    numWinners,
    minimumTokenBalance: MINIMUM_TOKEN_BALANCE,
    totalEligibleUsers: eligibleUsers.length,
    tokenMintAddress: TOKEN_MINT_ADDRESS
  });

  return { 
    dropId, 
    winners: winners.map(w => ({ 
      walletAddress: w.walletAddress,
      tokenBalance: w.tokenBalance,
      name: w.name || "Unknown"
    })),
    totalEligibleUsers: eligibleUsers.length,
    minimumTokenBalance: MINIMUM_TOKEN_BALANCE
  };
});

// Helper function to check eligibility for a specific wallet
export const checkEligibility = functions.https.onCall(async (data: any, context: any) => {
  const { walletAddress } = data;
  
  if (!walletAddress) {
    throw new functions.https.HttpsError("invalid-argument", "Wallet address is required.");
  }

  const tokenBalance = await getTokenBalance(walletAddress);
  const isEligible = tokenBalance >= MINIMUM_TOKEN_BALANCE;

  return {
    walletAddress,
    tokenBalance,
    isEligible,
    minimumRequired: MINIMUM_TOKEN_BALANCE,
    tokenMintAddress: TOKEN_MINT_ADDRESS
  };
}); 