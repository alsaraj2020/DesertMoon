import { Buffer } from "buffer";
import process from "process";

globalThis.Buffer = Buffer;
globalThis.process = process;
window.Buffer = Buffer;
window.process = process;

await import("@solana/wallet-adapter-react-ui/styles.css");

const ReactModule = await import("react");
const React = ReactModule.default;
const { createRoot } = await import("react-dom/client");
const { ConnectionProvider, WalletProvider } = await import("@solana/wallet-adapter-react");
const { WalletModalProvider } = await import("@solana/wallet-adapter-react-ui");
const { PhantomWalletAdapter } = await import("@solana/wallet-adapter-phantom");
const { SolflareWalletAdapter } = await import("@solana/wallet-adapter-solflare");
const { WalletConnectWalletAdapter } = await import("@walletconnect/solana-adapter");
const { WalletAdapterNetwork } = await import("@solana/wallet-adapter-base");
const { default: App } = await import("./App.jsx");
await import("./styles.css");

const CONFIG = {
  backendUrl: import.meta.env.VITE_BACKEND_URL || "http://localhost:8787",
  rpcUrl: import.meta.env.VITE_RPC_URL || "https://api.mainnet-beta.solana.com",
  treasuryWallet:
    import.meta.env.VITE_TREASURY_WALLET ||
    "DgsK21QaQVcRLhJyvAHDXqVyf3ZsJ9Cgkg1cPJKYmHx9",
  publicSiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5173",
  projectId:
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
    "a2b3b8d814dd978790367e1ea11540dc",
  tokenSymbol: import.meta.env.VITE_TOKEN_SYMBOL || "DMOON",
  solPriceUsd: Number(import.meta.env.VITE_SOL_PRICE_USD || 150),
  tokenPriceUsd: Number(import.meta.env.VITE_TOKEN_PRICE_USD || 0.005),
  paymentMints: {
    USDC:
      import.meta.env.VITE_USDC_MINT ||
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    USDT:
      import.meta.env.VITE_USDT_MINT ||
      "Es9vMFrzaCERmJfrF4H2FYD4MNnbNXzQkXrGmKwpZ33",
  },
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

  return React.createElement(
    ConnectionProvider,
    { endpoint: CONFIG.rpcUrl },
    React.createElement(
      WalletProvider,
      { wallets, autoConnect: true },
      React.createElement(WalletModalProvider, null, React.createElement(App, { config: CONFIG }))
    )
  );
}

createRoot(document.getElementById("root")).render(React.createElement(Providers));
