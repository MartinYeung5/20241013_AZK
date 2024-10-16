import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App_copy';
//import App from './App_20241007_multisig';
import reportWebVitals from './reportWebVitals';

import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";

const wallets = [new PetraWallet()];
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>,
);

reportWebVitals();
