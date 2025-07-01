import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { saveShippingInfoForWallet, isUsernameAvailable } from '../utils/firestoreUser';
import { useProfile } from '../contexts/ProfileContext';
import UserInfoForm from './forms/UserInfoForm';

const MandatoryFormModal: React.FC = () => {
  const { publicKey } = useWallet();
  const { showMandatoryForm, setShowMandatoryForm, profileData, checkProfileCompletion } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: {
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
    if (!publicKey) {
      setError('Please connect your wallet first.');
      return;
    }
    
    // Validate username uniqueness
    const isAvailable = await isUsernameAvailable(formData.username, publicKey.toBase58());
    if (!isAvailable) {
      setError('Username is already taken. Please choose a different username.');
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
      setShowMandatoryForm(false);
      // Refresh profile completion status
      await checkProfileCompletion();
    } catch (err: unknown) {
      setError('Failed to save profile information.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showMandatoryForm) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '1.25rem',
        padding: '2.5rem',
        maxWidth: 600,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#18181b', marginBottom: '0.5rem' }}>
            Welcome! Complete Your Profile
          </h2>
          <p style={{ color: '#52525b', fontSize: '1rem' }}>
            Please provide your information to continue using the application.
          </p>
        </div>
        
        <UserInfoForm
          initialData={profileData || undefined}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          submitButtonText="Complete Profile"
          showCancelButton={true}
          onCancel={() => setShowMandatoryForm(false)}
          cancelButtonText="Skip for Now"
          currentWalletAddress={publicKey?.toBase58()}
        />
      </div>
    </div>
  );
};

export default MandatoryFormModal; 