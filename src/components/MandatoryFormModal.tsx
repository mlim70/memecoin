import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { saveShippingInfoForWallet } from '../utils/firestoreUser';
import { useProfile } from '../contexts/ProfileContext';

const MandatoryFormModal: React.FC = () => {
  const { publicKey } = useWallet();
  const { showMandatoryForm, setShowMandatoryForm, profileData, checkProfileCompletion } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  // Initialize form fields when profile data is loaded
  useEffect(() => {
    if (profileData) {
      if (profileData.username && !username) setUsername(profileData.username);
      if (profileData.email && !email) setEmail(profileData.email);
      if (profileData.email && !confirmEmail) setConfirmEmail(profileData.email);
      if (profileData.shippingAddress && !shippingAddress) setShippingAddress(profileData.shippingAddress);
    }
  }, [profileData, username, email, confirmEmail, shippingAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setError('Please connect your wallet first.');
      return;
    }
    if (!username || !email || !confirmEmail || !shippingAddress) {
      setError('Please fill in all fields.');
      return;
    }
    if (email !== confirmEmail) {
      setError('Email and Confirm Email must match.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await saveShippingInfoForWallet(
        publicKey.toBase58(),
        profileData?.name || '',
        shippingAddress,
        username,
        email
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
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="modal-username" style={{ fontWeight: 500, color: '#27272a' }}>Username *</label>
            <input
              type="text"
              id="modal-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
              placeholder="Enter a username"
              required
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="modal-email" style={{ fontWeight: 500, color: '#27272a' }}>Email *</label>
              <input
                type="email"
                id="modal-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
                placeholder="Enter your email address"
                required
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="modal-confirmEmail" style={{ fontWeight: 500, color: '#27272a' }}>Verify Email *</label>
              <input
                type="email"
                id="modal-confirmEmail"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem' }}
                placeholder="Re-enter your email address"
                required
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="modal-shippingAddress" style={{ fontWeight: 500, color: '#27272a' }}>Shipping Address *</label>
            <textarea
              id="modal-shippingAddress"
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              required
              placeholder="Enter your complete shipping address..."
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '1rem', resize: 'vertical' }}
            />
          </div>
          
          {error && (
            <div style={{ color: '#ef4444', fontWeight: 500, textAlign: 'center' }}>{error}</div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ minWidth: 150, padding: '12px 24px', fontSize: '1rem' }}
            >
              {isLoading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MandatoryFormModal; 