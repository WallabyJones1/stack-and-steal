import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Imports the Tailwind base styles

// Solana Wallet Adapter imports
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import the wallet adapter's default CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// This component wraps our entire application to provide wallet functionality.
const WalletAdapterWrapper = () => {
  const network = "devnet"; 
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // We are only including the Phantom wallet for now to ensure stability.
  // More wallets can be added to this array later.
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WalletAdapterWrapper />
  </React.StrictMode>
);
