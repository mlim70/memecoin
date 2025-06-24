# Cloud Functions Deployment Guide

## Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Google Cloud account with billing enabled
3. Firebase project set up

## Step 1: Install Dependencies
```bash
cd functions
npm install
```

## Step 2: Set Environment Variables
In the Firebase Console:
1. Go to Functions > Configuration
2. Add these environment variables:
   - `TOKEN_MINT_ADDRESS`: Your token's mint address
   - `SOLANA_RPC_URL`: Your Solana RPC endpoint (optional, defaults to mainnet)

## Step 3: Deploy Functions
```bash
# From project root
firebase login
firebase use your-project-id
firebase deploy --only functions
```

## Step 4: Verify Deployment
1. Check Firebase Console > Functions
2. You should see two functions:
   - `updateAllBalances` (scheduled every 5 minutes)
   - `updateAllBalancesManual` (HTTP trigger for testing)

## Step 5: Test Manual Function
Visit: `https://your-region-your-project-id.cloudfunctions.net/updateAllBalancesManual`

## Monitoring
- View logs: `firebase functions:log`
- Monitor in Firebase Console > Functions > Logs
- Set up alerts for function failures

## Cost Optimization
- Functions run every 5 minutes automatically
- Manual function available for testing
- Monitor usage in Google Cloud Console
- Adjust schedule frequency as needed

## Troubleshooting
- Check function logs for errors
- Verify environment variables are set
- Ensure Firestore security rules allow function writes
- Check Solana RPC endpoint availability 