import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';

export const useWalletWithLoading = () => {
  const wallet = useWallet();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Wait for wallet to finish connecting or determine it's not connected
    if (!wallet.connecting) {
      // Add a small delay to ensure wallet state is stable
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [wallet.connecting, wallet.connected]);

  return {
    ...wallet,
    isInitializing,
    // Only show connected state when not initializing and actually connected
    isConnected: !isInitializing && wallet.connected,
    // Only show disconnected state when not initializing and actually disconnected
    isDisconnected: !isInitializing && !wallet.connected
  };
}; 