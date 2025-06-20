import React, { useState, useEffect } from 'react';
import { runDrop, checkDropEligibility, testBackendConnection } from '../utils/dropUtils';
import { TOKEN_CONFIG, isTokenConfigured } from '../config/token';
import { formatWalletAddress, isValidWalletAddress } from '../utils/dropUtils';
import { getEligibleUsers as getFirestoreEligibleUsers, getDropHistory as getFirestoreDropHistory } from '../utils/firestoreUser';
import type { DropResult, EligibilityInfo } from '../types/global';

const VercelAdminPage: React.FC = () => {
  const [numWinners, setNumWinners] = useState(1);
  const [walletAddresses, setWalletAddresses] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DropResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [eligibleUsers, setEligibleUsers] = useState<unknown[]>([]);
  const [dropHistory, setDropHistory] = useState<unknown[]>([]);
  const [useFirestoreUsers, setUseFirestoreUsers] = useState(false);

  useEffect(() => {
    // Test connection on component mount
    testConnection();
    // Load drop history from Firebase
    loadDropHistory();
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const status = await testBackendConnection();
      setConnectionStatus(status);
    } catch (err: unknown) {
      setConnectionStatus({ success: false, message: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDropHistory = async () => {
    try {
      const history = await getFirestoreDropHistory();
      setDropHistory(history);
    } catch (err: unknown) {
      console.error('Error loading drop history:', err);
    }
  };

  const handleRunDrop = async () => {
    if (!isTokenConfigured()) {
      setError('Token configuration is not set up.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let addresses: string[] = [];

      if (useFirestoreUsers) {
        // Get eligible users from Firebase
        const firestoreUsers = await getFirestoreEligibleUsers();
        addresses = firestoreUsers.map((user: any) => user.walletAddress);
        
        if (addresses.length === 0) {
          setError('No eligible users found in database.');
          setIsLoading(false);
          return;
        }
      } else {
        // Parse wallet addresses from input
        addresses = walletAddresses
          .split('\n')
          .map(addr => addr.trim())
          .filter(addr => addr && isValidWalletAddress(addr));

        if (addresses.length === 0) {
          setError('Please provide at least one valid wallet address.');
          setIsLoading(false);
          return;
        }
      }

      const dropResult = await runDrop(numWinners, addresses);
      
      // Drop result is now automatically saved to Firebase by Vercel function
      setResult(dropResult as DropResult);
      setDropHistory(await getFirestoreDropHistory());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to run drop.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckEligibility = async () => {
    if (!isTokenConfigured()) {
      setError('Token configuration is not set up.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const addresses = walletAddresses
        .split('\n')
        .map(addr => addr.trim())
        .filter(addr => addr && isValidWalletAddress(addr));

      if (addresses.length === 0) {
        setError('Please provide at least one valid wallet address.');
        setIsLoading(false);
        return;
      }

      const eligible: unknown[] = [];
      
      for (const address of addresses) {
        try {
          const eligibility = await checkDropEligibility(address);
          if ((eligibility as EligibilityInfo).isEligible) {
            eligible.push({
              walletAddress: address,
              tokenBalance: (eligibility as EligibilityInfo).tokenBalance,
              name: `User ${address.slice(0, 8)}...`
            });
          }
        } catch (err: unknown) {
          console.error(`Error checking eligibility for ${address}:`, err);
        }
      }
      
      setEligibleUsers(eligible);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check eligibility.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFirestoreUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const firestoreUsers = await getFirestoreEligibleUsers();
      setEligibleUsers(firestoreUsers);
      setUseFirestoreUsers(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users from database.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenConfigured()) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Vercel Drop Admin</h1>
            
            {/* Connection Status */}
            <div className={`mb-6 p-4 rounded-md ${
              connectionStatus?.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-medium ${
                    connectionStatus?.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Backend Connection Status
                  </h3>
                  <p className={`mt-1 text-sm ${
                    connectionStatus?.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {connectionStatus?.message || 'Testing connection...'}
                  </p>
                </div>
                <button
                  onClick={testConnection}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>
            
            {/* Configuration Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Current Configuration</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Token:</strong> {TOKEN_CONFIG.SYMBOL}</p>
                <p><strong>Mint Address:</strong> {formatWalletAddress(TOKEN_CONFIG.MINT_ADDRESS)}</p>
                <p><strong>Minimum Balance:</strong> {TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()} {TOKEN_CONFIG.SYMBOL}</p>
                <p><strong>RPC URL:</strong> {TOKEN_CONFIG.SOLANA_RPC_URL}</p>
                <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || '/api'}</p>
                <p><strong>Data Storage:</strong> Firebase Firestore</p>
                <p><strong>Drop Management:</strong> Vercel Functions (Secure)</p>
                <p><strong>Drop Integrity:</strong> Server-side writes to Firestore</p>
              </div>
            </div>

            {/* Drop Form */}
            <div className="space-y-6">
              <div>
                <label htmlFor="numWinners" className="block text-sm font-medium text-gray-700">
                  Number of Winners
                </label>
                <input
                  type="number"
                  id="numWinners"
                  min="1"
                  max="100"
                  value={numWinners}
                  onChange={(e) => setNumWinners(parseInt(e.target.value) || 1)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Source
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!useFirestoreUsers}
                      onChange={() => setUseFirestoreUsers(false)}
                      className="mr-2"
                    />
                    Manual Input
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={useFirestoreUsers}
                      onChange={() => setUseFirestoreUsers(true)}
                      className="mr-2"
                    />
                    Firebase Database
                  </label>
                </div>
              </div>

              {!useFirestoreUsers && (
                <div>
                  <label htmlFor="walletAddresses" className="block text-sm font-medium text-gray-700">
                    Wallet Addresses (one per line)
                  </label>
                  <textarea
                    id="walletAddresses"
                    rows={6}
                    value={walletAddresses}
                    onChange={(e) => setWalletAddresses(e.target.value)}
                    placeholder="Enter wallet addresses, one per line..."
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}

              <div className="flex space-x-4">
                {!useFirestoreUsers && (
                  <button
                    onClick={handleCheckEligibility}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Checking...' : 'Check Eligibility'}
                  </button>
                )}

                {useFirestoreUsers && (
                  <button
                    onClick={handleLoadFirestoreUsers}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Load Database Users'}
                  </button>
                )}

                <button
                  onClick={handleRunDrop}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isLoading ? 'Running Drop...' : 'Run Drop'}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
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

            {/* Result Display */}
            {result && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">Drop Results</h3>
                <div className="text-sm text-green-700">
                  <p><strong>Drop ID:</strong> {result.dropId}</p>
                  <p><strong>Total Eligible:</strong> {result.totalEligibleUsers}</p>
                  <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}</p>
                  <p><strong>Winners:</strong></p>
                  <ul className="list-disc list-inside mt-1">
                    {result.winners.map((winner: any, index: number) => (
                      <li key={index}>
                        {formatWalletAddress(winner.walletAddress)} - {winner.tokenBalance.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Eligible Users Display */}
            {eligibleUsers.length > 0 && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Eligible Users ({eligibleUsers.length})</h3>
                <div className="text-sm text-blue-700">
                  <ul className="list-disc list-inside">
                    {eligibleUsers.map((user: any, index) => (
                      <li key={index}>
                        {formatWalletAddress(user.walletAddress)} - {user.tokenBalance.toLocaleString()} {TOKEN_CONFIG.SYMBOL}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Drop History */}
            {dropHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Drop History (Firebase)</h3>
                <div className="space-y-4">
                  {dropHistory.map((drop: any, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{drop.dropId}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(drop.timestamp).toLocaleString()} - {drop.numWinners} winner(s)
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {drop.totalEligibleUsers} eligible
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <strong>Winners:</strong> {drop.winners.map((w: any) => formatWalletAddress(w.walletAddress)).join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VercelAdminPage; 