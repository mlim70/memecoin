// src/pages/AccountPage.tsx
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { checkDropEligibility, getEligibilityMessage, getEligibilityStatus, getEligibilityColor } from '../utils/dropUtils';
import { saveShippingInfoForWallet, getShippingInfoForWallet } from '../utils/firestoreUser';
import { TOKEN_CONFIG, isTokenConfigured } from '../config/token';
import type { UserInfo } from '../types/global';

const AccountPage: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [manualWalletAddress, setManualWalletAddress] = useState('');
  const [useManualInput, setUseManualInput] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState<Partial<UserInfo>>({});
  const [isShippingFormVisible, setIsShippingFormVisible] = useState(false);
  const [isShippingSaved, setIsShippingSaved] = useState(false);

  // Get the active wallet address (connected wallet or manual input)
  const activeWalletAddress = connected ? publicKey?.toBase58() : (useManualInput ? manualWalletAddress : '');

  useEffect(() => {
    // Auto-check eligibility when wallet connects or manual address is entered
    if (activeWalletAddress && isValidWalletAddress(activeWalletAddress)) {
      loadShippingInfo();
      checkEligibility();
    }
  }, [activeWalletAddress]);

  const isValidWalletAddress = (address: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  const loadShippingInfo = async () => {
    if (!activeWalletAddress) return;
    
    try {
      const info = await getShippingInfoForWallet(activeWalletAddress);
      if (info) {
        setShippingInfo(info as UserInfo);
        setIsShippingSaved(true);
      }
    } catch (err: unknown) {
      console.error('Error loading shipping info:', err);
    }
  };

  const checkEligibility = async () => {
    if (!isTokenConfigured()) {
      setError('Token configuration is not set up.');
      return;
    }

    if (!activeWalletAddress || !isValidWalletAddress(activeWalletAddress)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const eligibility = await checkDropEligibility(activeWalletAddress);
      setTokenBalance(eligibility.tokenBalance);
      setIsEligible(eligibility.isEligible);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check eligibility.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualInputSubmit = () => {
    if (!manualWalletAddress || !isValidWalletAddress(manualWalletAddress)) {
      setError('Please enter a valid Solana wallet address.');
      return;
    }
    setUseManualInput(true);
    setError(null);
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeWalletAddress || !isValidWalletAddress(activeWalletAddress)) {
      setError('Please enter a valid wallet address first.');
      return;
    }

    if (!shippingInfo.name || !shippingInfo.shippingAddress) {
      setError('Please fill in all shipping information.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await saveShippingInfoForWallet(
        activeWalletAddress,
        shippingInfo.name,
        shippingInfo.shippingAddress,
        isEligible || false
      );
      setIsShippingSaved(true);
      setIsShippingFormVisible(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save shipping information.');
    } finally {
      setIsLoading(false);
    }
  };

  const eligibilityStatus = getEligibilityStatus(tokenBalance || 0);
  const eligibilityColor = getEligibilityColor(eligibilityStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account & Eligibility</h1>

            {!isTokenConfigured() && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Configuration Required
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Token configuration is not set up. Please configure your environment variables.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Primary: Phantom Wallet Connection */}
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Connect Your Wallet</h2>
              <div className="flex items-center space-x-4">
                <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700 !text-white !px-4 !py-2 !rounded-md !text-sm !font-medium" />
                {connected && (
                  <div className="text-sm text-green-600 font-medium">
                    ✅ Connected: {formatWalletAddress(publicKey?.toBase58() || '')}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Connect your Phantom wallet for the best experience and real-time balance updates.
              </p>
            </div>

            {/* Alternative: Manual Input */}
            <div className="mb-6 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Or Enter Address Manually</h2>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={manualWalletAddress}
                  onChange={(e) => setManualWalletAddress(e.target.value)}
                  placeholder="Enter your Solana wallet address..."
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={connected}
                />
                <button
                  onClick={handleManualInputSubmit}
                  disabled={isLoading || connected || !manualWalletAddress}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Check
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Use this option if you prefer not to connect your wallet or are having connection issues.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Eligibility Results */}
            {activeWalletAddress && tokenBalance !== null && (
              <div className="mb-6">
                <div className={`p-4 rounded-md border-2`} style={{ borderColor: eligibilityColor, backgroundColor: `${eligibilityColor}10` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Token Balance: {tokenBalance.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {getEligibilityMessage(tokenBalance || 0, isEligible || false)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Wallet: {formatWalletAddress(activeWalletAddress)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isEligible ? 'Eligible' : 'Not Eligible'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Information */}
            {isEligible && activeWalletAddress && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                
                {isShippingSaved && shippingInfo.name && shippingInfo.shippingAddress ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <h3 className="text-sm font-medium text-green-800 mb-2">Saved Shipping Information</h3>
                    <div className="text-sm text-green-700">
                      <p><strong>Name:</strong> {shippingInfo.name}</p>
                      <p><strong>Address:</strong> {shippingInfo.shippingAddress}</p>
                    </div>
                    <button
                      onClick={() => setIsShippingFormVisible(true)}
                      className="mt-2 text-sm text-green-600 hover:text-green-500"
                    >
                      Update Information
                    </button>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <p className="text-sm text-blue-700">
                      Please provide your shipping information to receive drops.
                    </p>
                  </div>
                )}

                {(isShippingFormVisible || !isShippingSaved) && (
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={shippingInfo.name || ''}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700">
                        Shipping Address
                      </label>
                      <textarea
                        id="shippingAddress"
                        rows={3}
                        value={shippingInfo.shippingAddress || ''}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, shippingAddress: e.target.value })}
                        required
                        placeholder="Enter your complete shipping address..."
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : 'Save Shipping Information'}
                      </button>
                      {isShippingFormVisible && (
                        <button
                          type="button"
                          onClick={() => setIsShippingFormVisible(false)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Configuration Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Current Configuration</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Token:</strong> {TOKEN_CONFIG.SYMBOL}</p>
                <p><strong>Minimum Balance:</strong> {TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()} {TOKEN_CONFIG.SYMBOL}</p>
                <p><strong>Data Storage:</strong> Firebase Firestore</p>
                <p><strong>Drop Management:</strong> Vercel Functions (Secure)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format wallet address
const formatWalletAddress = (address: string): string => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

export default AccountPage; 