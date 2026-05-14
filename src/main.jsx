import { Buffer } from "buffer";
import process from "process";
import React from "react";
import { createRoot } from "react-dom/client";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { WalletConnectWalletAdapter } from "@walletconnect/solana-adapter";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import App from "./App.jsx";
import "./styles.css";
import "@solana/wallet-adapter-react-ui/styles.css";

globalThis.Buffer = Buffer;
globalThis.process = process;
window.Buffer = Buffer;
window.process = process;

const CONFIG = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:8787",
  rpcUrl: import.meta.env.VITE_RPC_URL || "https://api.mainnet-beta.solana.com",
  treasuryWallet: import.meta.env.VITE_TREASURY_WALLET || "DgsK21QaQVcRLhJyvAHDXqVyf3ZsJ9Cgkg1cPJKYmHx9",
  publicSiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5173",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "a2b3b8d814dd978790367e1ea11540dc",
  tokenSymbol: import.meta.env.VITE_TOKEN_SYMBOL || "DMOON",
  solPriceUsd: Number(import.meta.env.VITE_SOL_PRICE_USD || 150),
  tokenPriceUsd: Number(import.meta.env.VITE_TOKEN_PRICE_USD || 0.005),
};

function Providers() {
  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network: WalletAdapterNetwork.Mainnet }),
      new WalletConnectWalletAdapter({
        network: WalletAdapterNetwork.Mainnet,
        options: {
          projectId: CONFIG.projectId,
          relayUrl: "wss://relay.walletconnect.com",
          metadata: {
            name: "DesertMoon",
            description: "DesertMoon DMOON presale on Solana",
            url: CONFIG.publicSiteUrl,
            icons: [`${CONFIG.publicSiteUrl}/assets/logo-banner.jpg`],
          },
        },
      }),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={CONFIG.rpcUrl}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App config={CONFIG} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

createRoot(document.getElementById("root")).render(<Providers />);
