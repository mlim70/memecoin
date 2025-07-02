import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWalletWithLoading } from '../../hooks/useWallet';

interface WalletConnectionProps {
  showDescription?: boolean;
  showButton?: boolean;
  title?: string;
  className?: string;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  showDescription = false,
  showButton = true,
  title = 'Connect Your Wallet',
  className = ''
}) => {
  const { publicKey } = useWallet();
  const { isInitializing, isConnected } = useWalletWithLoading();

  if (isInitializing) {
    return (
      <div className={className}>
        <div style={{
          height: '48px',
          width: '160px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      </div>
    );
  }

  if (isConnected && publicKey) {
    return (
      <div className={className}>
        {showButton && <WalletMultiButton className="btn btn-primary" />}
      </div>
    );
  }

  return (
    <div className={className}>
      {title && (
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#27272a', marginBottom: 16 }}>
          {title}
        </h2>
      )}
      {showButton && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <WalletMultiButton className="btn btn-primary" />
        </div>
      )}
      {showDescription && (
        <p style={{ color: '#52525b', fontSize: '0.98rem', marginTop: 8 }}>
          Connect your Phantom wallet for the best experience and real-time balance updates.
        </p>
      )}
    </div>
  );
};

export default WalletConnection; 