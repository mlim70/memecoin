import React, { useRef, useEffect } from 'react';

// Add type for window.google
declare global {
  interface Window {
    google?: any;
  }
}

export interface AddressParts {
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (parts: AddressParts) => void;
  placeholder?: string;
  disabled?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = 'Street address',
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }
    if (!inputRef.current) return;
    if (autocompleteRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current!, {
      types: ['address']
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (!place || !place.address_components) return;
      let addressLine1 = '';
      let city = '';
      let state = '';
      let zipCode = '';
      let country = '';
      for (const comp of place.address_components) {
        if (comp.types.includes('street_number')) {
          addressLine1 = comp.long_name + ' ' + addressLine1;
        } else if (comp.types.includes('route')) {
          addressLine1 += comp.long_name;
        } else if (comp.types.includes('locality')) {
          city = comp.long_name;
        } else if (comp.types.includes('administrative_area_level_1')) {
          state = comp.short_name;
        } else if (comp.types.includes('postal_code')) {
          zipCode = comp.long_name;
        } else if (comp.types.includes('country')) {
          country = comp.long_name;
        }
      }
      onAddressSelect({ addressLine1: addressLine1.trim(), city, state, zipCode, country });
    });
  }, [onAddressSelect]);

  // Fallback: just a plain input if Google Places is not available
  // (isGooglePlacesAvailable is not used, but could be for further fallback logic)

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="off"
      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontSize: '1rem' }}
    />
  );
};

export default AddressAutocomplete; 