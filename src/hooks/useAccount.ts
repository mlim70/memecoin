import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { checkDropEligibility } from '../utils/dropUtils';
import { saveShippingInfoForWallet, getShippingInfoForWallet, updateUserBalance } from '../utils/firestoreUser';
import { isTokenConfigured } from '../config/token';
import type { UserInfo } from '../types/global';

export const useAccount = () => {
  const { publicKey, connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingInfo, setShippingInfo] = useState<Partial<UserInfo>>({});

  const isValidWalletAddress = (address: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  const loadShippingInfo = async () => {
    if (!publicKey || !isValidWalletAddress(publicKey.toBase58())) return;
    
    try {
      const info = await getShippingInfoForWallet(publicKey.toBase58());
      if (info) {
        setShippingInfo(info as UserInfo);
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

    if (!publicKey || !isValidWalletAddress(publicKey.toBase58())) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await checkDropEligibility(publicKey.toBase58());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to check eligibility.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserInfo = async (formData: {
    username: string;
    email: string;
    confirmEmail: string;
    shippingName: string;
    shippingAddressLine1: string;
    shippingAddressLine2: string;
    shippingCity: string;
    shippingState: string;
    shippingZipCode: string;
    shippingCountry: string;
  }) => {
    if (!publicKey || !isValidWalletAddress(publicKey.toBase58())) {
      setError('Please enter a valid wallet address first.');
      return;
    }
    
    if (!formData.username || !formData.email || !formData.confirmEmail || !formData.shippingName || !formData.shippingAddressLine1 || !formData.shippingCity || !formData.shippingState || !formData.shippingZipCode || !formData.shippingCountry) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (formData.email !== formData.confirmEmail) {
      setError('Email and Confirm Email must match.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await saveShippingInfoForWallet(
        publicKey.toBase58(),
        {
          name: formData.shippingName,
          addressLine1: formData.shippingAddressLine1,
          addressLine2: formData.shippingAddressLine2,
          city: formData.shippingCity,
          state: formData.shippingState,
          zipCode: formData.shippingZipCode,
          country: formData.shippingCountry,
        },
        formData.username,
        formData.email
      );
      
      // Reload shipping info to update the state
      await loadShippingInfo();
    } catch (err: unknown) {
      setError('Failed to save shipping info.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-check eligibility when wallet connects
  useEffect(() => {
    if (publicKey && isValidWalletAddress(publicKey.toBase58())) {
      loadShippingInfo();
      checkEligibility();
    }
  }, [publicKey]);

  // Update user balance when wallet connects
  useEffect(() => {
    if (publicKey && connected) {
      updateUserBalance(publicKey.toBase58());
    }
  }, [publicKey, connected]);

  return {
    shippingInfo,
    isLoading,
    error,
    setError,
    saveUserInfo,
    checkEligibility,
    isValidWalletAddress,
    connected,
    publicKey
  };
}; 