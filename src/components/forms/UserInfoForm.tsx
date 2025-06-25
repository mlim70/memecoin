import React, { useState, useEffect } from 'react';
import type { UserInfo } from '../../types/global';

interface UserInfoFormProps {
  initialData?: Partial<UserInfo>;
  onSubmit: (data: {
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
  }) => void;
  isLoading?: boolean;
  error?: string | null;
  submitButtonText?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
  cancelButtonText?: string;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  error = null,
  submitButtonText = 'Save',
  showCancelButton = false,
  onCancel,
  cancelButtonText = 'Cancel'
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [shippingName, setShippingName] = useState('');
  const [shippingAddressLine1, setShippingAddressLine1] = useState('');
  const [shippingAddressLine2, setShippingAddressLine2] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZipCode, setShippingZipCode] = useState('');
  const [shippingCountry, setShippingCountry] = useState('');

  // Initialize form fields when initial data is provided
  useEffect(() => {
    if (initialData) {
      if (initialData.username && !username) setUsername(initialData.username);
      if (initialData.email && !email) setEmail(initialData.email);
      if (initialData.email && !confirmEmail) setConfirmEmail(initialData.email);
      
      // Handle nested shipping object
      if (initialData.shipping) {
        if (initialData.shipping.name && !shippingName) setShippingName(initialData.shipping.name);
        if (initialData.shipping.addressLine1 && !shippingAddressLine1) setShippingAddressLine1(initialData.shipping.addressLine1);
        if (initialData.shipping.addressLine2 && !shippingAddressLine2) setShippingAddressLine2(initialData.shipping.addressLine2);
        if (initialData.shipping.city && !shippingCity) setShippingCity(initialData.shipping.city);
        if (initialData.shipping.state && !shippingState) setShippingState(initialData.shipping.state);
        if (initialData.shipping.zipCode && !shippingZipCode) setShippingZipCode(initialData.shipping.zipCode);
        if (initialData.shipping.country && !shippingCountry) setShippingCountry(initialData.shipping.country);
      }
    }
  }, [initialData, username, email, confirmEmail, shippingName, shippingAddressLine1, shippingAddressLine2, shippingCity, shippingState, shippingZipCode, shippingCountry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      username,
      email,
      confirmEmail,
      shippingName,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingState,
      shippingZipCode,
      shippingCountry,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      background: '#f9fafb', 
      borderRadius: 12, 
      padding: 24, 
      maxWidth: 700, 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 18, 
      boxShadow: '0 2px 12px rgba(24,24,27,0.06)' 
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label htmlFor="username" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Username *</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
          placeholder="Enter a username"
          required
        />
      </div>
      
      <div style={{ display: 'flex', gap: 18 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="email" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Email *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
            placeholder="Enter your email address"
            required
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="confirmEmail" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Verify Email *</label>
          <input
            type="email"
            id="confirmEmail"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
            placeholder="Re-enter your email address"
            required
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#27272a', marginBottom: 8, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>Shipping Information</h3>
        <label htmlFor="shippingName" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Full Name *</label>
        <input
          type="text"
          id="shippingName"
          value={shippingName}
          onChange={(e) => setShippingName(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
          placeholder="Enter your full name"
          required
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label htmlFor="shippingAddressLine1" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Address Line 1 *</label>
        <input
          type="text"
          id="shippingAddressLine1"
          value={shippingAddressLine1}
          onChange={(e) => setShippingAddressLine1(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
          placeholder="Street address"
          required
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label htmlFor="shippingAddressLine2" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Address Line 2 (Optional)</label>
        <input
          type="text"
          id="shippingAddressLine2"
          value={shippingAddressLine2}
          onChange={(e) => setShippingAddressLine2(e.target.value)}
          style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
          placeholder="Apartment, suite, etc."
        />
      </div>
      
      <div style={{ display: 'flex', gap: 18 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="shippingCity" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>City *</label>
          <input
            type="text"
            id="shippingCity"
            value={shippingCity}
            onChange={(e) => setShippingCity(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
            placeholder="City"
            required
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="shippingState" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>State *</label>
          <input
            type="text"
            id="shippingState"
            value={shippingState}
            onChange={(e) => setShippingState(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
            placeholder="State"
            required
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 18 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="shippingZipCode" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>ZIP Code *</label>
          <input
            type="text"
            id="shippingZipCode"
            value={shippingZipCode}
            onChange={(e) => setShippingZipCode(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
            placeholder="ZIP code"
            required
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="shippingCountry" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Country *</label>
          <input
            type="text"
            id="shippingCountry"
            value={shippingCountry}
            onChange={(e) => setShippingCountry(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
            placeholder="Country"
            required
          />
        </div>
      </div>
      
      {error && (
        <div style={{ color: '#ef4444', marginTop: 8, fontWeight: 500 }}>{error}</div>
      )}
      
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{ minWidth: 100 }}
        >
          {isLoading ? 'Saving...' : submitButtonText}
        </button>
        {showCancelButton && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ minWidth: 100 }}
          >
            {cancelButtonText}
          </button>
        )}
      </div>
    </form>
  );
};

export default UserInfoForm; 