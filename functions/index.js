const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Connection, PublicKey } = require('@solana/web3.js');

admin.initializeApp();

exports.updateAllBalances = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    try {
      console.log('Starting balance update for all users...');
      
      const db = admin.firestore();
      const usersRef = db.collection('users');
      const querySnapshot = await usersRef.get();
      
      if (querySnapshot.empty) {
        console.log('No users found in database');
        return null;
      }
      
      // Get configuration from environment variables
      const solanaRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const tokenMintAddress = process.env.TOKEN_MINT_ADDRESS;
      
      if (!tokenMintAddress) {
        throw new Error('TOKEN_MINT_ADDRESS environment variable is not set');
      }
      
      const connection = new Connection(solanaRpcUrl);
      const mint = new PublicKey(tokenMintAddress);
      
      console.log(`Updating balances for ${querySnapshot.size} users...`);
      
      const updatePromises = querySnapshot.docs.map(async (docSnap) => {
        const user = docSnap.data();
        const walletAddress = user.walletAddress;
        
        if (!walletAddress) {
          console.log('Skipping user without wallet address:', docSnap.id);
          return;
        }
        
        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            new PublicKey(walletAddress), 
            { mint }
          );
          
          let balance = 0;
          if (tokenAccounts.value.length > 0) {
            balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
          }
          
          await docSnap.ref.update({ 
            balance, 
            updatedAt: new Date().toISOString() 
          });
          
          console.log(`Updated balance for ${walletAddress}: ${balance}`);
        } catch (e) {
          console.error(`Error updating balance for ${walletAddress}:`, e);
        }
      });
      
      await Promise.all(updatePromises);
      console.log('All user balances updated successfully');
      return null;
    } catch (error) {
      console.error('Error in updateAllBalances:', error);
      throw error;
    }
  });

// Manual trigger function for testing
exports.updateAllBalancesManual = functions.https.onRequest(async (req, res) => {
  try {
    console.log('Manual balance update triggered');
    
    const db = admin.firestore();
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.get();
    
    if (querySnapshot.empty) {
      res.json({ message: 'No users found in database' });
      return;
    }
    
    const solanaRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const tokenMintAddress = process.env.TOKEN_MINT_ADDRESS;
    
    if (!tokenMintAddress) {
      res.status(500).json({ error: 'TOKEN_MINT_ADDRESS environment variable is not set' });
      return;
    }
    
    const connection = new Connection(solanaRpcUrl);
    const mint = new PublicKey(tokenMintAddress);
    
    const updatePromises = querySnapshot.docs.map(async (docSnap) => {
      const user = docSnap.data();
      const walletAddress = user.walletAddress;
      
      if (!walletAddress) return;
      
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          new PublicKey(walletAddress), 
          { mint }
        );
        
        let balance = 0;
        if (tokenAccounts.value.length > 0) {
          balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
        }
        
        await docSnap.ref.update({ 
          balance, 
          updatedAt: new Date().toISOString() 
        });
      } catch (e) {
        console.error(`Error updating balance for ${walletAddress}:`, e);
      }
    });
    
    await Promise.all(updatePromises);
    res.json({ message: 'All user balances updated successfully', userCount: querySnapshot.size });
  } catch (error) {
    console.error('Error in manual balance update:', error);
    res.status(500).json({ error: error.message });
  }
}); 