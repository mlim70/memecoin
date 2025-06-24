# 🚀 Hybrid Setup Guide: Firebase + Vercel Functions

This guide explains how to set up your memecoin project using **Firebase for data storage** and **Vercel Functions for drop management** - the best of both worlds!

## 📋 **Architecture Overview**

### **What We're Using:**
- ✅ **Firebase Firestore** - Store user data, shipping info, drop history
- ✅ **Vercel Functions** - Handle drop logic and eligibility checks (FREE!)
- ✅ **React Frontend** - User interface and wallet integration

### **Why This Approach:**
- 🆓 **Vercel Functions are FREE** (100 GB-hours/month)
- 💰 **Firebase Firestore** has generous free tier
- 🔒 **Secure** - Drop logic runs on serverless functions
- 📊 **Persistent** - All data stored in Firebase
- ⚡ **Fast** - Vercel's global edge network

---

## 🛠️ **Setup Instructions**

### **Step 1: Firebase Setup (Data Storage)**

#### **1.1 Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name your project (e.g., "memecoin-drops")
4. Enable Google Analytics (optional)
5. Click "Create project"

#### **1.2 Enable Firestore Database**
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

#### **1.3 Get Firebase Configuration**
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app
4. Register your app
5. Copy the configuration object

### **Step 2: Environment Configuration**

#### **2.1 Frontend Environment (.env)**
```env
# Token Configuration
VITE_TOKEN_SYMBOL=YOUR_TOKEN
VITE_TOKEN_MINT_ADDRESS=your_token_mint_address_here
VITE_MINIMUM_BALANCE_FOR_DROPS=1000
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Firebase Configuration (Data Storage)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Vercel API Configuration
VITE_API_BASE_URL=/api  # For local development
# VITE_API_BASE_URL=https://your-project.vercel.app/api  # For production
```

#### **2.2 Vercel Environment Variables**
After deploying to Vercel, set these in your Vercel dashboard:
```env
# Token Configuration
TOKEN_SYMBOL=YOUR_TOKEN
TOKEN_MINT_ADDRESS=your_token_mint_address_here
MINIMUM_BALANCE_FOR_DROPS=1000
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### **Step 3: Vercel Deployment**

#### **3.1 Install Vercel CLI**
```bash
npm install -g vercel
```

#### **3.2 Deploy to Vercel**
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### **3.3 Set Environment Variables in Vercel**
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add the variables listed in Step 2.2

---

## 🎯 **How It Works**

### **Data Flow:**

1. **User Registration** → Firebase Firestore
2. **Eligibility Check** → Vercel Function → Solana RPC
3. **Drop Execution** → Vercel Function → Random Selection
4. **Drop History** → Saved to Firebase Firestore
5. **User Data** → Stored in Firebase Firestore

### **File Structure:**
```
src/
├── firebase.ts              # Firebase configuration
├── utils/
│   ├── firestoreUser.ts     # Firebase data operations
│   └── dropUtils.ts         # Vercel function calls
├── pages/
│   ├── AccountPage.tsx      # User profile (Firebase)
│   └── VercelAdminPage.tsx  # Drop management (Vercel)
└── config/
    └── token.ts             # Token configuration

api/                         # Vercel Functions
├── check-eligibility.js     # Eligibility checking
└── run-drop.js             # Drop execution
```

---

## 🔧 **Usage Examples**

### **Storing User Data (Firebase)**
```typescript
import { saveShippingInfoForWallet } from '../utils/firestoreUser';

// Save user shipping info
await saveShippingInfoForWallet(
  walletAddress,
  "John Doe",
  "123 Main St, City, State",
  true // eligible
);
```

### **Running Drops (Vercel Functions)**
```typescript
import { runDrop } from '../utils/dropUtils';

// Run a drop with 3 winners
const result = await runDrop(3, walletAddresses);
```

### **Checking Eligibility (Vercel Functions)**
```typescript
import { checkDropEligibility } from '../utils/dropUtils';

// Check if wallet is eligible
const eligibility = await checkDropEligibility(walletAddress);
```

---

## 📊 **Firebase Collections**

### **Users Collection**
```javascript
{
  "walletAddress": "ABC123...",
  "name": "John Doe",
  "shippingAddress": "123 Main St, City, State",
  "eligible": true,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### **Drops Collection**
```javascript
{
  "dropId": "drop_1234567890",
  "winners": [
    {
      "walletAddress": "ABC123...",
      "tokenBalance": 1500,
      "name": "User ABC123..."
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "numWinners": 3,
  "minimumTokenBalance": 1000,
  "totalEligibleUsers": 5,
  "tokenMintAddress": "your_token_mint_address",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚀 **Admin Panel Features**

### **Available at `/admin`:**
- ✅ **Connection Status** - Test Vercel function connectivity
- ✅ **User Source Selection** - Manual input or Firebase database
- ✅ **Eligibility Checking** - Check token balances
- ✅ **Drop Execution** - Run drops with random selection
- ✅ **Drop History** - View all past drops from Firebase
- ✅ **Configuration Display** - Show current settings

### **User Management:**
- ✅ **Load Database Users** - Get eligible users from Firebase
- ✅ **Manual Input** - Enter wallet addresses manually
- ✅ **Bulk Operations** - Process multiple users at once

---

## 💰 **Cost Analysis**

### **Vercel Functions (FREE Tier)**
- ✅ 100 GB-hours per month
- ✅ 10-second timeout
- ✅ Unlimited invocations
- ✅ Perfect for drop operations

### **Firebase Firestore (FREE Tier)**
- ✅ 1 GB storage
- ✅ 50,000 reads/day
- ✅ 20,000 writes/day
- ✅ 20,000 deletes/day

### **Estimated Monthly Usage:**
- **Drop Operations**: ~10 GB-hours (well within free tier)
- **Data Storage**: ~100 MB (well within free tier)
- **Total Cost**: $0/month

---

## 🔒 **Security Considerations**

### **Firebase Security Rules**
```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{walletAddress} {
      allow read, write: if request.auth != null && 
        request.auth.uid == walletAddress;
    }
    
    // Drops are read-only for users
    match /drops/{dropId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admin can write
    }
  }
}
```

### **Vercel Function Security**
- ✅ Input validation
- ✅ Rate limiting (built-in)
- ✅ CORS protection
- ✅ Environment variable protection

---

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **"Firebase not configured"**
- Check all Firebase environment variables
- Verify Firebase project exists
- Ensure Firestore is enabled

#### **"Vercel functions not working"**
- Check Vercel deployment status
- Verify environment variables in Vercel
- Check function logs: `vercel logs`

#### **"No eligible users found"**
- Check if users have sufficient token balance
- Verify token mint address is correct
- Check Solana RPC connectivity

### **Debug Commands:**
```bash
# Check Vercel deployment
vercel ls

# View function logs
vercel logs

# Redeploy functions
vercel --prod

# Test locally
vercel dev
```

---

## 🎯 **Next Steps**

1. **Set up Firebase project** and enable Firestore
2. **Configure environment variables** for both Firebase and Vercel
3. **Deploy to Vercel** and set production environment variables
4. **Test the system** with real wallet addresses
5. **Monitor usage** in both Firebase and Vercel dashboards

### **Production Checklist:**
- [ ] Firebase project created and configured
- [ ] Firestore database enabled
- [ ] Vercel project deployed
- [ ] Environment variables set in both platforms
- [ ] Connection tests pass
- [ ] Drop functionality tested
- [ ] User data storage working
- [ ] Security rules configured

This hybrid approach gives you the best of both worlds: free drop management with Vercel and reliable data storage with Firebase! 