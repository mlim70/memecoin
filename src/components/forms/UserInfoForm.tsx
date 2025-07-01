import React, { useState, useEffect } from 'react';
import type { UserInfo } from '../../types/global';
import { isUsernameAvailable } from '../../utils/firestoreUser';
import AddressAutocomplete, { type AddressParts } from './AddressAutocomplete';
import { countries, usStates, caProvinces, validateZip, validateCountry, validateState } from '../../utils/addressValidation';

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
  currentWalletAddress?: string;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({
  initialData = {},
  onSubmit,
  isLoading = false,
  error = null,
  submitButtonText = 'Save',
  showCancelButton = false,
  onCancel,
  cancelButtonText = 'Cancel',
  currentWalletAddress
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
  const [usernameValidation, setUsernameValidation] = useState<{
    isValid: boolean;
    isChecking: boolean;
    message: string;
  }>({ isValid: true, isChecking: false, message: '' });
  const [zipValid, setZipValid] = useState(true);
  const [countryValid, setCountryValid] = useState(true);
  const [stateValid, setStateValid] = useState(true);

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
    // Only run on mount or when initialData changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Validate zip, country, state on change
  useEffect(() => {
    setZipValid(validateZip(shippingCountry, shippingZipCode));
    setCountryValid(validateCountry(shippingCountry));
    setStateValid(validateState(shippingCountry, shippingState));
  }, [shippingCountry, shippingZipCode, shippingState]);

  // Username validation with debouncing
  useEffect(() => {
    const validateUsername = async () => {
      if (!username.trim()) {
        setUsernameValidation({ isValid: true, isChecking: false, message: '' });
        return;
      }

      // Basic validation
      if (username.length < 2) {
        setUsernameValidation({ 
          isValid: false, 
          isChecking: false, 
          message: 'Username must be at least 2 characters long' 
        });
        return;
      }

      if (username.length > 20) {
        setUsernameValidation({ 
          isValid: false, 
          isChecking: false, 
          message: 'Username must be 20 characters or less' 
        });
        return;
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        setUsernameValidation({ 
          isValid: false, 
          isChecking: false, 
          message: 'Username can only contain letters, numbers, underscores, and hyphens' 
        });
        return;
      }

      setUsernameValidation({ isValid: true, isChecking: true, message: 'Checking availability...' });

      try {
        const isAvailable = await isUsernameAvailable(username, currentWalletAddress);
        if (isAvailable) {
          setUsernameValidation({ isValid: true, isChecking: false, message: 'Username is available' });
        } else {
          setUsernameValidation({ isValid: false, isChecking: false, message: 'Username is already taken' });
        }
      } catch (error) {
        setUsernameValidation({ isValid: false, isChecking: false, message: 'Error checking username availability' });
      }
    };

    const timeoutId = setTimeout(validateUsername, 500); // Debounce for 500ms
    return () => clearTimeout(timeoutId);
  }, [username, currentWalletAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if username is invalid or being checked
    if (!usernameValidation.isValid || usernameValidation.isChecking) {
      return;
    }
    
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

  const handleAddressSelect = (parts: AddressParts) => {
    setShippingAddressLine1(parts.addressLine1);
    setShippingCity(parts.city);
    setShippingState(parts.state);
    setShippingZipCode(parts.zipCode);
    // Robust country mapping: try code, then name (case-insensitive, partial match)
    let countryCode = '';
    // Try exact code match
    if (countries.some(c => c.code === parts.country)) {
      countryCode = parts.country;
    } else {
      // Try exact name match (case-insensitive)
      const byName = countries.find(c => c.name.toLowerCase() === parts.country.toLowerCase());
      if (byName) {
        countryCode = byName.code;
      } else {
        // Try partial name match (case-insensitive)
        const byPartial = countries.find(c => parts.country.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(parts.country.toLowerCase()));
        if (byPartial) {
          countryCode = byPartial.code;
        }
      }
    }
    setShippingCountry(countryCode || '');
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
          style={{ 
            width: '100%', 
            padding: 10, 
            borderRadius: 8, 
            border: usernameValidation.isValid && username.trim() ? '1px solid #10b981' : usernameValidation.isValid ? '1px solid #e5e7eb' : '1px solid #ef4444', 
            fontSize: '1rem',
            backgroundColor: usernameValidation.isChecking ? '#f9fafb' : 'white'
          }}
          placeholder="Enter a username"
          required
        />
        {username.trim() && (
          <div style={{ 
            fontSize: '0.875rem', 
            color: usernameValidation.isValid ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            {usernameValidation.isChecking && (
              <div style={{ 
                width: 12, 
                height: 12, 
                border: '2px solid #e5e7eb', 
                borderTop: '2px solid #3b82f6', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }} />
            )}
            {usernameValidation.message}
          </div>
        )}
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
        <AddressAutocomplete
          value={shippingAddressLine1}
          onChange={setShippingAddressLine1}
          onAddressSelect={handleAddressSelect}
          placeholder="Street address"
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
          <label htmlFor="shippingState" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>State/Province *</label>
          {shippingCountry === 'United States' || shippingCountry === 'US' ? (
            <select
              id="shippingState"
              value={shippingState}
              onChange={e => setShippingState(e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
              required
            >
              <option value="">Select state</option>
              {usStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          ) : shippingCountry === 'Canada' || shippingCountry === 'CA' ? (
            <select
              id="shippingState"
              value={shippingState}
              onChange={e => setShippingState(e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
              required
            >
              <option value="">Select province</option>
              {caProvinces.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id="shippingState"
              value={shippingState}
              onChange={e => setShippingState(e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
              placeholder="State/Province"
              required
            />
          )}
          {!stateValid && <span style={{ color: '#ef4444', fontSize: '0.9em' }}>Invalid state/province</span>}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 18 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="shippingZipCode" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>ZIP/Postal Code *</label>
          <input
            type="text"
            id="shippingZipCode"
            value={shippingZipCode}
            onChange={e => setShippingZipCode(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: zipValid ? '1px solid #e5e7eb' : '1px solid #ef4444', fontSize: '1rem' }}
            placeholder="ZIP/Postal code"
            required
          />
          {!zipValid && <span style={{ color: '#ef4444', fontSize: '0.9em' }}>Invalid ZIP/postal code</span>}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="shippingCountry" style={{ fontWeight: 500, color: '#27272a', marginBottom: 4 }}>Country *</label>
          <select
            id="shippingCountry"
            value={shippingCountry}
            onChange={e => setShippingCountry(e.target.value)}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: countryValid ? '1px solid #e5e7eb' : '1px solid #ef4444', fontSize: '1rem' }}
            required
          >
            <option value="">Select country</option>
            {countries.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          {!countryValid && <span style={{ color: '#ef4444', fontSize: '0.9em' }}>Invalid country</span>}
        </div>
      </div>
      
      {error && (
        <div style={{ color: '#ef4444', marginTop: 8, fontWeight: 500 }}>{error}</div>
      )}
      
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          type="submit"
          disabled={isLoading || !usernameValidation.isValid || usernameValidation.isChecking}
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