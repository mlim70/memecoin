# Setup Guide - Memecoin Project

This guide will walk you through setting up the memecoin project with proper environment configuration.

## Prerequisites

- Node.js 18+ installed
- Phantom wallet browser extension
- Firebase project created
- Solana token mint address

## Step 1: Environment Configuration

### Frontend Environment Variables

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Edit `.env` and configure the following variables:

```env
# Token Configuration - REQUIRED
VITE_TOKEN_MINT_ADDRESS=your_actual_token_mint_address_here
VITE_MINIMUM_BALANCE=1000
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Token Details - REQUIRED
VITE_TOKEN_SYMBOL=MEME
VITE_TOKEN_NAME=Memecoin
VITE_TOKEN_DECIMALS=9

# Firebase Configuration - REQUIRED
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend Environment Variables

1. Navigate to the functions directory:
```bash
cd functions
cp env.example .env
```

2. Edit `functions/.env` and configure:

```env
# Token Configuration - REQUIRED
TOKEN_MINT_ADDRESS=your_actual_token_mint_address_here
MINIMUM_TOKEN_BALANCE=1000
SOLANA_RPC_URL=https://api.devnet.solana.com

# Firebase Configuration - REQUIRED
FIREBASE_PROJECT_ID=your_project_id
```

## Step 2: Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Enable Authentication (optional, for admin features)

### 2. Get Firebase Configuration

1. Go to Project Settings > General
2. Scroll down to "Your apps"
3. Add a web app if not already added
4. Copy the configuration values to your `.env` file

### 3. Deploy Firebase Functions

```bash
cd functions
npm install
npm run deploy
```

## Step 3: Token Configuration

### 1. Get Your Token Mint Address

- **Devnet**: Use Solana CLI or a token creation tool
- **Mainnet**: Your deployed token's mint address

### 2. Configure Token Settings

Update the token configuration in your `.env` files:

- **MINT_ADDRESS**: Your token's unique identifier
- **MINIMUM_BALANCE**: Minimum tokens required for drop eligibility
- **SYMBOL**: Token symbol (e.g., "MEME")
- **NAME**: Token name (e.g., "Memecoin")
- **DECIMALS**: Usually 9 for SPL tokens

## Step 4: Network Configuration

### Devnet (Testing)
```env
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_RPC_URL=https://api.devnet.solana.com
```

### Mainnet (Production)
```env
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Step 5: Install Dependencies

### Frontend
```bash
npm install
```

### Backend
```bash
cd functions
npm install
```

## Step 6: Start Development

### Frontend
```bash
npm run dev
```

### Backend (in separate terminal)
```bash
cd functions
npm run serve
```

## Configuration Validation

### Check Token Configuration

The app will show a warning if token configuration is missing:

1. Open the app in your browser
2. Check the console for configuration warnings
3. Verify token balance loading works
4. Test wallet connection

### Test Drop System

1. Connect a wallet with tokens
2. Access the admin panel at `/admin`
3. Verify admin wallet address
4. Test running a drop

## Environment Variable Reference

### Frontend Variables (VITE_*)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_TOKEN_MINT_ADDRESS` | Token mint address | Yes | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `VITE_MINIMUM_BALANCE` | Minimum tokens for drops | Yes | `1000` |
| `VITE_SOLANA_RPC_URL` | Solana network endpoint | Yes | `https://api.devnet.solana.com` |
| `VITE_TOKEN_SYMBOL` | Token symbol | Yes | `MEME` |
| `VITE_TOKEN_NAME` | Token name | Yes | `Memecoin` |
| `VITE_TOKEN_DECIMALS` | Token decimal places | Yes | `9` |

### Backend Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `TOKEN_MINT_ADDRESS` | Token mint address | Yes | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| `MINIMUM_TOKEN_BALANCE` | Minimum tokens for drops | Yes | `1000` |
| `SOLANA_RPC_URL` | Solana network endpoint | Yes | `https://api.devnet.solana.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes | `my-project-123` |

## Troubleshooting

### Common Issues

1. **"Token not configured" warning**
   - Check `VITE_TOKEN_MINT_ADDRESS` is set
   - Verify the address is valid

2. **"Firebase not configured" error**
   - Check all Firebase environment variables
   - Verify Firebase project exists

3. **"Functions not deployed" error**
   - Run `npm run deploy` in functions directory
   - Check Firebase project permissions

4. **Token balance not loading**
   - Verify RPC URL is correct
   - Check network connectivity
   - Ensure wallet is connected

### Validation Commands

```bash
# Check if environment files exist
ls -la .env
ls -la functions/.env

# Validate token configuration
npm run build

# Test Firebase Functions
cd functions
npm run serve
```

## Security Notes

- Never commit `.env` files to version control
- Use different configurations for dev/prod
- Regularly rotate API keys
- Monitor Firebase usage and costs

## Next Steps

After setup:

1. Test the complete flow
2. Configure admin wallet addresses
3. Set up monitoring and alerts
4. Plan production deployment
5. Document custom configurations 