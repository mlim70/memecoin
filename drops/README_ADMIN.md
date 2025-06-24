# Admin Drop Script Documentation

## Overview

The `admin_drop.py` script is a secure, backend-only tool for running token drops and randomly selecting winners from eligible wallet addresses.

## Features

- ✅ **Automatic Eligibility Checking** - Verifies token balances against minimum requirements
- ✅ **Random Winner Selection** - Fair, cryptographically secure random selection
- ✅ **Firebase Integration** - Automatically saves drop results to Firestore
- ✅ **Comprehensive Logging** - Detailed output and error reporting
- ✅ **Input Validation** - Validates wallet addresses and parameters

## Prerequisites

### 1. Python Environment
```bash
# Install Python 3.7+ if not already installed
python --version

# Install required packages
pip install -r requirements.txt
```

## Usage

### Basic Syntax
```bash
# From the project root directory
python drops/admin_drop.py --num-winners <number> [--source <firebase|file>] [--wallets-file <path>]
```

### Parameters
- `--num-winners`: Number of winners to select (1-100)
- `--source`: Source for wallet addresses (`firebase` or `file`, default: `firebase`)
- `--wallets-file`: Path to text file containing wallet addresses (only needed if source is `file`)

### Example Usage

#### 1. Run a Drop from Firebase (Default)
```bash
# From project root - reads eligible users from Firebase
python drops/admin_drop.py --num-winners 3
```

#### 2. Run a Drop from Firebase (Explicit)
```bash
# From project root - explicitly specify Firebase source
python drops/admin_drop.py --num-winners 5 --source firebase
```

#### 3. Run a Drop from Text File
```bash
# From project root - read from text file
python drops/admin_drop.py --num-winners 3 --source file --wallets-file wallets.txt
```

#### 4. Run a Large Drop from Firebase
```bash
# From project root
python drops/admin_drop.py --num-winners 10
```

### Data Sources

#### Firebase Source (Default)
- Reads wallet addresses from the `users` collection in Firebase
- Only considers users with `eligible: true` in their document
- Automatically filters for eligible users based on your Firebase data
- No need to maintain separate wallet lists

#### File Source
- Reads wallet addresses from a text file
- One wallet address per line
- Useful for one-time drops or external lists

### Wallet File Format (for file source)
Create a text file with one wallet address per line:

```txt
ABC1234567890123456789012345678901234567890
DEF1234567890123456789012345678901234567890
GHI1234567890123456789012345678901234567890
```

## Output

### Successful Drop
```
Found 15 eligible users in Firebase
Drop completed!
{
  "dropId": "drop_1703123456789",
  "winners": [
    {
      "walletAddress": "ABC1234567890123456789012345678901234567890",
      "tokenBalance": 1500
    },
    {
      "walletAddress": "DEF1234567890123456789012345678901234567890",
      "tokenBalance": 2200
    }
  ],
  "totalEligibleUsers": 15,
  "minimumTokenBalance": 1000,
  "timestamp": "2023-12-21T10:30:56.789Z"
}
```

### Error Messages
- **Configuration Errors**: Missing environment variables
- **Validation Errors**: Invalid wallet addresses or insufficient eligible users
- **Network Errors**: Solana RPC connection issues
- **Firebase Errors**: Authentication or database read/write failures

## Security Considerations

### 🔒 Environment Variables
- Never commit `.env` files to version control
- Use strong, unique Firebase service account keys
- Rotate service account keys regularly

### 🔒 Access Control
- Limit access to the script to authorized administrators only
- Use secure file permissions: `chmod 600 drops/admin_drop.py`
- Consider using a dedicated admin machine or server

### 🔒 Network Security
- Use HTTPS RPC endpoints for production
- Consider using private RPC endpoints for high-volume operations
- Monitor for unusual activity

### 🔒 Data Protection
- Wallet addresses are processed but not stored permanently
- Drop results are stored in Firebase for audit purposes
- Consider data retention policies for drop history

## Troubleshooting

### Common Issues

#### 1. "TOKEN_MINT_ADDRESS is not set"
**Solution**: Add `TOKEN_MINT_ADDRESS=your_mint_address` to your `.env` file in the project root

#### 2. "FIREBASE_SERVICE_ACCOUNT is not set"
**Solution**: Add your Firebase service account JSON to `.env` in the project root as a single line

#### 3. "Not enough eligible users"
**Solution**: 
- Check that wallet addresses are valid Solana addresses
- Verify the minimum balance requirement
- Ensure wallets have the correct token
- If using Firebase, check that users have `eligible: true` in their documents

#### 4. "Error checking balance for [address]"
**Solution**:
- Verify the wallet address format
- Check Solana RPC endpoint connectivity
- Ensure the token mint address is correct

#### 5. "Firebase authentication error"
**Solution**:
- Verify service account JSON format (must be single line)
- Check Firebase project permissions
- Ensure service account has Firestore read/write access

#### 6. "Found 0 eligible users in Firebase"
**Solution**:
- Check that users exist in the `users` collection
- Verify that users have `eligible: true` field
- Ensure the Firebase service account has read access to the users collection

#### 7. "Module not found" errors
**Solution**:
- Ensure you're running from the project root directory
- Install dependencies: `pip install -r requirements.txt`
- Check that Python can find the required packages

### Debug Mode
For detailed debugging, you can modify the script to add more verbose logging:

```python
# Add to drops/admin_drop.py for debugging
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Best Practices

### 1. Testing
- Always test with devnet first
- Use a small number of test wallets
- Verify results manually before production use

### 2. Backup
- Keep backup copies of wallet lists (if using file source)
- Document drop parameters and results
- Maintain audit trail of all drops

### 3. Monitoring
- Monitor Solana RPC rate limits
- Track Firebase usage and costs
- Log all drop operations

### 4. Validation
- Double-check wallet addresses before running
- Verify minimum balance requirements
- Confirm network (mainnet vs devnet)

### 5. Firebase Data Management
- Regularly update user eligibility status in Firebase
- Clean up old or invalid user records
- Monitor Firebase collection sizes and costs

## Integration with Frontend

The script works independently of the frontend application. Drop results are automatically saved to Firebase and can be displayed in the frontend through:

- **Drop History**: Users can view past drops
- **Eligibility Checking**: Users can check their eligibility status
- **Leaderboards**: Display user balances and eligibility

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify your environment configuration
3. Review Firebase and Solana documentation
4. Check the main project documentation

## Version History

- **v1.0**: Initial release with basic drop functionality
- **v1.1**: Added comprehensive error handling and validation
- **v1.2**: Enhanced security and logging features
- **v1.3**: Moved to dedicated `/drops/` directory for better organization
- **v1.4**: Added Firebase integration for automatic wallet address reading

---

**⚠️ Important**: This script performs real operations on the blockchain. Always test thoroughly and double-check all parameters before running in production. 