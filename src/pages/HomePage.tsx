// src/pages/HomePage.tsx
import Navigation from '../components/Navigation';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { saveShippingInfoForWallet, getShippingInfoForWallet } from '../utils/firestoreUser';
import { checkDropEligibility, getEligibilityMessage, getEligibilityStatus, getEligibilityColor } from '../utils/dropUtils';
import merchLogo from '../assets/merch-icon.png';
import { TOKEN_CONFIG, isTokenConfigured } from '../config/token';
import type { UserInfo } from '../types/global';

export default function HomePage() {
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
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [name, setName] = useState('');

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
        shippingInfo.username, 
        shippingInfo.email
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
    <div className="main-container" style={{ minHeight: 'calc(100vh - 0px)', display: 'flex', flexDirection: 'column' }}>
      <Navigation currentPage="home" />
      <main className="page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div className="content-wrapper">
          <img src={merchLogo} alt="MERCH Logo" style={{ height: 64, width: 'auto', margin: '0 auto 1.5rem auto', display: 'block' }} />
          <h1 className="hero-title">Welcome to Memecoin</h1>
          <p className="hero-subtitle">
            The future of decentralized finance starts here
          </p>
          { !connected && (
            <div className="connect-wallet-info">
              Connect Wallet to participate
            </div>
          )}
          <div className="nav-buttons">
            <WalletMultiButton className="btn btn-primary" />
            <a href="/gallery" className="btn btn-secondary">
              View Gallery
            </a>
          </div>
          {/* Info box for minimum token balance and token info, with vertical overflow protection */}
          <div style={{ width: '100%', maxWidth: 500, margin: '32px auto', padding: 16, background: 'rgba(26,26,26,0.7)', borderRadius: 8, fontSize: '0.95rem', color: '#a1a1aa', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', wordBreak: 'break-word', boxSizing: 'border-box', maxHeight: 180, overflowY: 'auto' }}>
            <div style={{ marginBottom: 8, fontWeight: 600, color: '#fff' }}>Drop Participation Requirements</div>
            <div><strong>Token:</strong> {TOKEN_CONFIG.SYMBOL}</div>
            <div><strong>Minimum Balance:</strong> {TOKEN_CONFIG.MINIMUM_BALANCE_FOR_DROPS.toLocaleString()} {TOKEN_CONFIG.SYMBOL}</div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to format wallet address
const formatWalletAddress = (address: string): string => {
  if (!address || address.length < 8) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}; 