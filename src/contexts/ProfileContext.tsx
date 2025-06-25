import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getShippingInfoForWallet } from '../utils/firestoreUser';
import type { UserInfo } from '../types/global';

interface ProfileContextType {
  isProfileComplete: boolean;
  showMandatoryForm: boolean;
  setShowMandatoryForm: (show: boolean) => void;
  checkProfileCompletion: () => Promise<void>;
  profileData: Partial<UserInfo> | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [showMandatoryForm, setShowMandatoryForm] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserInfo> | null>(null);

  const checkProfileCompletion = async () => {
    if (!publicKey || !connected) {
      setIsProfileComplete(false);
      setShowMandatoryForm(false);
      return;
    }

    try {
      const info = await getShippingInfoForWallet(publicKey.toBase58());
      setProfileData(info);
      
      if (info) {
        // Check if profile is complete (has all required fields)
        const hasCompleteProfile = info.username && 
          info.email && 
          info.shipping && 
          info.shipping.name && 
          info.shipping.addressLine1 && 
          info.shipping.city && 
          info.shipping.state && 
          info.shipping.zipCode && 
          info.shipping.country;
        setIsProfileComplete(!!hasCompleteProfile);
        
        // If profile is not complete, show mandatory form
        if (!hasCompleteProfile) {
          setShowMandatoryForm(true);
        } else {
          // Profile is complete, hide the form
          setShowMandatoryForm(false);
        }
      } else {
        // No existing info found - this is a first-time user
        setIsProfileComplete(false);
        setShowMandatoryForm(true);
      }
    } catch (err) {
      console.error('Error checking profile completion:', err);
      setIsProfileComplete(false);
      setShowMandatoryForm(true);
    }
  };

  useEffect(() => {
    checkProfileCompletion();
  }, [publicKey, connected]);

  const value: ProfileContextType = {
    isProfileComplete,
    showMandatoryForm,
    setShowMandatoryForm,
    checkProfileCompletion,
    profileData,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}; 