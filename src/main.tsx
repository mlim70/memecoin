// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';
import heroBg from './assets/home-hero.jpg';

const endpoint = 'https://api.devnet.solana.com';
const wallets = [new PhantomWalletAdapter()];

// Apply background image to body
document.body.style.backgroundImage = `linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(10, 10, 10, 0.8) 50%, rgba(0, 0, 0, 0.6) 100%), radial-gradient(circle at top, rgba(99, 102, 241, 0.1) 0%, transparent 50%), url(${heroBg})`;
document.body.style.backgroundSize = 'cover';
document.body.style.backgroundPosition = 'center center';
document.body.style.backgroundAttachment = 'fixed';
document.body.style.backgroundRepeat = 'no-repeat';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </StrictMode>,
)
