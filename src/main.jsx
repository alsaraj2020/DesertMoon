import { Buffer } from "buffer";
import process from "process";
import React from "react";
import { createRoot } from "react-dom/client";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import App from "./App.jsx";
import "./styles.css";
import "@solana/wallet-adapter-react-ui/styles.css";

globalThis.Buffer = Buffer;
globalThis.process = process;
window.Buffer = Buffer;
window.process = process;

const CONFIG = {
  backendUrl:
    import.meta.env.VITE_BACKEND_URL ||
    "https://desertmoon-backend.onrender.com",
  rpcUrl:
    import.meta.env.VITE_RPC_URL ||
    "https://api.mainnet-beta.solana.com",
  treasuryWallet:
    import.meta.env.VITE_TREASURY_WALLET ||
    "9JVtaDxzymteMrTKNGhsyGcNqsFfY7ce3LqdXhij4McC",
  publicSiteUrl: "https://desertmoon.io",
  tokenSymbol: import.meta.env.VITE_TOKEN_SYMBOL || "DMOON",
  solPriceUsd: Number(import.meta.env.VITE_SOL_PRICE_USD || 150),
  tokenPriceUsd: Number(import.meta.env.VITE_TOKEN_PRICE_USD || 0.005),
};

function Providers() {
  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: WalletAdapterNetwork.Mainnet }),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={CONFIG.rpcUrl}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <App config={CONFIG} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

createRoot(document.getElementById("root")).render(<Providers />);
