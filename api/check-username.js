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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, currentWalletAddress } = req.body;

    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Basic validation
    if (username.length < 2) {
      return res.status(400).json({ 
        available: false, 
        error: 'Username must be at least 2 characters long' 
      });
    }

    if (username.length > 20) {
      return res.status(400).json({ 
        available: false, 
        error: 'Username must be 20 characters or less' 
      });
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ 
        available: false, 
        error: 'Username can only contain letters, numbers, underscores, and hyphens' 
      });
    }

    const { db } = getFirebaseAdmin();
    
    // Check if username exists
    const usersRef = db.collection('users');
    const query = usersRef.where('username', '==', username);
    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return res.status(200).json({ available: true });
    }

    // If username exists, check if it belongs to the current user
    if (currentWalletAddress) {
      const existingUser = querySnapshot.docs[0].data();
      if (existingUser.walletAddress === currentWalletAddress) {
        return res.status(200).json({ available: true });
      }
    }

    return res.status(200).json({ available: false });

  } catch (error) {
    console.error('Error checking username:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 