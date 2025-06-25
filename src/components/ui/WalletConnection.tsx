import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface WalletConnectionProps {
  showDescription?: boolean;
  title?: string;
  className?: string;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  showDescription = false,
  title = 'Connect Your Wallet',
  className = ''
}) => {
  const { connected, publicKey } = useWallet();

  if (connected && publicKey) {
    return (
      <div className={className}>
        <WalletMultiButton className="btn btn-primary" />
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <WalletMultiButton className="btn btn-primary" />
      </div>
      {showDescription && (
        <p style={{ color: '#52525b', fontSize: '0.98rem', marginTop: 8 }}>
          Connect your Phantom wallet for the best experience and real-time balance updates.
        </p>
      )}
    </div>
  );
};

export default WalletConnection; 