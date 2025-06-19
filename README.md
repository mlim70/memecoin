# Memecoin Project

A decentralized memecoin project with token-gated drops, built on Solana blockchain with Firebase backend.

## Features

- **Token-Gated Drops**: Secure random selection based on real-time on-chain token balances
- **Wallet Integration**: Phantom wallet support with message signing verification
- **Admin Panel**: Manage drops and view results
- **Real-time Balance Checking**: Live token balance verification on Solana
- **Firebase Backend**: Secure Cloud Functions for drop management
- **Responsive UI**: Modern, mobile-friendly interface

## Quick Start

### 1. Environment Setup

Copy the example environment files and configure your settings:

```bash
# Frontend environment
cp env.example .env

# Backend environment (Firebase Functions)
cd functions
cp env.example .env
```

### 2. Configure Environment Variables

#### Frontend (.env)
```env
# Token Configuration
VITE_TOKEN_MINT_ADDRESS=your_actual_token_mint_address_here
VITE_MINIMUM_BALANCE=1000
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com

# Token Details
VITE_TOKEN_SYMBOL=MEME
VITE_TOKEN_NAME=Memecoin
VITE_TOKEN_DECIMALS=9

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Backend (functions/.env)
```env
# Token Configuration
TOKEN_MINT_ADDRESS=your_actual_token_mint_address_here
MINIMUM_TOKEN_BALANCE=1000
SOLANA_RPC_URL=https://api.devnet.solana.com

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
```

### 3. Install Dependencies

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd functions
npm install
```

### 4. Start Development

```bash
# Start frontend (from root directory)
npm run dev

# Start backend functions (from functions directory)
npm run serve
```

## Configuration

### Token Configuration

All token-related settings are centralized in `src/config/token.ts` and use environment variables:

- **MINT_ADDRESS**: Your token's mint address on Solana
- **MINIMUM_BALANCE**: Minimum tokens required for drop eligibility
- **SOLANA_RPC_URL**: Solana network endpoint (devnet/mainnet)
- **TOKEN_SYMBOL**: Token symbol for display
- **TOKEN_NAME**: Token name for display
- **DECIMALS**: Token decimal places (usually 9 for SPL tokens)

### Network Configuration

- **Devnet**: Use for testing with `https://api.devnet.solana.com`
- **Mainnet**: Use for production with `https://api.mainnet-beta.solana.com`

## Architecture

### Frontend (React + TypeScript)
- **Wallet Integration**: Solana wallet adapter for Phantom
- **Token Balance Display**: Real-time balance checking
- **Admin Interface**: Drop management and results viewing
- **Responsive Design**: Mobile-first approach

### Backend (Firebase Cloud Functions)
- **Drop System**: Secure random selection with on-chain verification
- **Token Balance Checking**: Real-time Solana blockchain queries
- **Admin Authentication**: Secure admin-only operations
- **Firestore Integration**: Drop logging and user data storage

### Security Features
- **Message Signing**: Wallet ownership verification
- **Admin-Only Operations**: Firebase Auth integration
- **On-Chain Verification**: Real-time token balance checks
- **Secure Random Selection**: Cryptographically secure winner selection

## Usage

### For Users
1. Connect Phantom wallet
2. Verify wallet ownership by signing a message
3. View real-time token balances
4. Submit shipping information if eligible
5. Participate in token-gated drops

### For Admins
1. Access admin panel at `/admin`
2. Verify admin wallet address
3. Run drops with specified number of winners
4. View drop results and user eligibility

### Drop System
- **Eligibility**: Based on minimum token balance
- **Selection**: Cryptographically secure random selection
- **Logging**: All drops logged to Firestore
- **Verification**: Real-time on-chain balance checks

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Firebase)
```bash
cd functions
npm run deploy
```

### Environment Variables
Ensure all environment variables are set in your deployment platform:
- **Vercel**: Set in project settings
- **Firebase**: Set using `firebase functions:config:set`

## Troubleshooting

### Common Issues

1. **Token Balance Not Loading**
   - Check RPC URL configuration
   - Verify token mint address
   - Ensure wallet is connected

2. **Drop System Errors**
   - Verify Firebase Functions are deployed
   - Check admin authentication
   - Ensure minimum balance is configured

3. **Wallet Connection Issues**
   - Install Phantom wallet extension
   - Check network configuration
   - Verify wallet permissions

### Development Tips

- Use devnet for testing
- Test with small token amounts
- Monitor Firebase Functions logs
- Use browser dev tools for debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
