// api/run-drop.js
// Example Vercel serverless function for running drops

import { Connection, PublicKey } from '@solana/web3.js';
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
function getFirebaseAdmin() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT || '{}'
    );
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return { app: getApp(), db: getFirestore() };
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { numWinners, walletAddresses } = req.body;

    // Validate input
    if (!numWinners || numWinners < 1 || numWinners > 100) {
      return res.status(400).json({ error: 'Number of winners must be between 1 and 100' });
    }

    if (!walletAddresses || !Array.isArray(walletAddresses) || walletAddresses.length === 0) {
      return res.status(400).json({ error: 'Wallet addresses array is required' });
    }

    // Get environment variables
    const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const TOKEN_MINT_ADDRESS = process.env.TOKEN_MINT_ADDRESS;
    const MINIMUM_BALANCE = parseInt(process.env.MINIMUM_BALANCE_FOR_DROPS) || 1000;

    if (!TOKEN_MINT_ADDRESS) {
      return res.status(500).json({ error: 'Token configuration is not set up' });
    }

    // Initialize Solana connection
    const connection = new Connection(SOLANA_RPC_URL);
    const tokenMint = new PublicKey(TOKEN_MINT_ADDRESS);

    // Check eligibility for all wallets
    const eligibleUsers = [];
    
    for (const walletAddress of walletAddresses) {
      try {
        const walletPubkey = new PublicKey(walletAddress);
        
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
          mint: tokenMint,
        });
        
        let tokenBalance = 0;
        if (tokenAccounts.value.length > 0) {
          tokenBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
        }

        if (tokenBalance >= MINIMUM_BALANCE) {
          eligibleUsers.push({
            walletAddress,
            tokenBalance,
            name: `User ${walletAddress.slice(0, 8)}...`
          });
        }
      } catch (error) {
        console.error(`Error checking eligibility for ${walletAddress}:`, error);
        // Continue with other wallets
      }
    }

    // Check if we have enough eligible users
    if (eligibleUsers.length < numWinners) {
      return res.status(400).json({
        error: `Not enough eligible users. Found ${eligibleUsers.length} users with ${MINIMUM_BALANCE}+ tokens, need ${numWinners}.`
      });
    }

    // Select winners (simple random selection)
    const winners = [];
    const usedIndexes = new Set();
    
    while (winners.length < numWinners) {
      const idx = Math.floor(Math.random() * eligibleUsers.length);
      if (!usedIndexes.has(idx)) {
        winners.push(eligibleUsers[idx]);
        usedIndexes.add(idx);
      }
    }

    // Create drop record
    const dropId = `drop_${Date.now()}`;
    const dropRecord = {
      dropId,
      winners,
      timestamp: new Date().toISOString(),
      numWinners,
      minimumTokenBalance: MINIMUM_BALANCE,
      totalEligibleUsers: eligibleUsers.length,
      tokenMintAddress: TOKEN_MINT_ADDRESS
    };

    // Write drop result to Firestore
    const { db } = getFirebaseAdmin();
    await db.collection('drops').doc(dropId).set({
      ...dropRecord,
      createdAt: new Date().toISOString(),
    });

    // Return result
    res.status(200).json({
      dropId,
      winners,
      totalEligibleUsers: eligibleUsers.length,
      minimumTokenBalance: MINIMUM_BALANCE,
      timestamp: dropRecord.timestamp
    });

  } catch (error) {
    console.error('Error running drop:', error);
    
    // Provide specific error messages
    if (error.message.includes('Invalid public key')) {
      return res.status(400).json({ error: 'One or more invalid wallet addresses provided' });
    }
    
    res.status(500).json({ 
      error: 'Failed to run drop. Please try again.' 
    });
  }
} 