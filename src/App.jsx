import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const DEFAULT_TOKEN = {
  totalSupply: 1000000000,
  presaleAllocationPercent: 30,
  presaleAllocationTokens: 300000000,
  teamAllocationPercent: 10,
  teamAllocationTokens: 100000000,
  presalePriceUsd: 0.005,
  currentPriceUsd: 0.005,
  listingPriceUsd: 0.05,
  blockchain: "Solana",
  maxContributionSol: 50,
  softCapSol: 15000,
  hardCapSol: 75000,
  teamCliffMonths: 11,
  teamVestingMonths: 18,

  priceTiers: [
    {
      name: "Tier 1",
      priceUsd: 0.005,
      minRaisedSol: 0,
      maxRaisedSol: 11250,
      allocation: "15%",
    },
    {
      name: "Tier 2",
      priceUsd: 0.010,
      minRaisedSol: 11250,
      maxRaisedSol: 26250,
      allocation: "20%",
    },
    {
      name: "Tier 3",
      priceUsd: 0.020,
      minRaisedSol: 26250,
      maxRaisedSol: 45000,
      allocation: "25%",
    },
    {
      name: "Tier 4",
      priceUsd: 0.035,
      minRaisedSol: 45000,
      maxRaisedSol: 75000,
      allocation: "40%",
    },
  ],
};

function fmt(value, max = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: max,
  }).format(Number(value || 0));
}

export default function App({ config }) {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();

  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Not connected");

  const [stats, setStats] = useState({
    totals: {
      totalRaisedSol: 0,
      percentFunded: 0,
      hardCapSol: 75000,
    },

    token: DEFAULT_TOKEN,
  });

  const [busy, setBusy] = useState(false);

  const token = stats.token || DEFAULT_TOKEN;
  const totals = stats.totals || {};

  const receiveAmount = useMemo(() => {
    const n = Number(amount || 0);

    if (!n) return 0;

    const solPriceNow = Number(
      token.solPriceUsd || config.solPriceUsd || 96
    );

    return (
      (n * solPriceNow) /
      Number(token.currentPriceUsd || token.presalePriceUsd || 0.005)
    );
  }, [amount, token, config]);

  async function fetchJson(path, options) {
    const res = await fetch(`${config.backendUrl}${path}`, options);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Request failed: ${path}`);
    }

    return data;
  }

  async function refreshStats() {
    try {
      const data = await fetchJson("/stats");

      if (data && data.token) {
        setStats(data);
      }

      setStatus("Presale ready");
    } catch (err) {
      console.error(err);
      setStatus("Presale ready");
    }
  }

  async function checkBalance() {
    try {
      if (!wallet.publicKey) {
        throw new Error("Connect wallet first.");
      }

      const data = await fetchJson(
        `/balance/${wallet.publicKey.toString()}`
      );

      setStatus(
        `Balance: ${fmt(data.purchasedTokens)} ${
          data.tokenSymbol || "DMOON"
        } | Paid: ${fmt(data.solPaid)} SOL`
      );
    } catch (err) {
      console.error(err);
      setStatus(`Balance check failed: ${err.message}`);
    }
  }

  function openWalletModal() {
    setVisible(true);
  }

  useEffect(() => {
    refreshStats();

    const id = setInterval(refreshStats, 10000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (wallet.publicKey) {
      const key = wallet.publicKey.toString();

      setStatus(`Connected: ${key.slice(0, 4)}...${key.slice(-4)}`);
    } else {
      setStatus("Not connected");
    }
  }, [wallet.publicKey]);

  async function buyNow() {
    try {
      if (!wallet.publicKey || !wallet.sendTransaction) {
        throw new Error("Connect wallet first.");
      }

      const n = Number(amount);

      if (!n || n <= 0) {
        throw new Error("Enter a valid SOL amount.");
      }

      if (n > 50) {
        throw new Error("Maximum contribution is 50 SOL per wallet.");
      }

      setBusy(true);

      setStatus("Preparing SOL transaction...");

      const conn = new Connection(config.rpcUrl, "confirmed");

      const treasury = new PublicKey(
        config.treasuryWallet
      );

      const transferInstruction =
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: treasury,
          lamports: Math.round(
            n * LAMPORTS_PER_SOL
          ),
        });

      const tx = new Transaction();

      tx.add(transferInstruction);

      const latestBlockhash =
        await conn.getLatestBlockhash(
          "confirmed"
        );

      tx.feePayer = wallet.publicKey;

      tx.recentBlockhash =
        latestBlockhash.blockhash;

      setStatus(
        "Approve transaction in wallet..."
      );

      const signature =
        await wallet.sendTransaction(
          tx,
          conn,
          {
            skipPreflight: false,
            preflightCommitment:
              "confirmed",
            maxRetries: 5,
          }
        );

      setStatus(
        "Confirming transaction..."
      );

      await conn.confirmTransaction(
        {
          signature,
          blockhash:
            latestBlockhash.blockhash,
          lastValidBlockHeight:
            latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      setStatus("Transaction successful!");

      try {
        await fetchJson(
          "/register-purchase",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              wallet:
                wallet.publicKey.toString(),
              amount: n,
              txSignature: signature,
            }),
          }
        );
      } catch (e) {
        console.error(
          "Register purchase failed:",
          e
        );
      }

      setStatus(
        `Success! ${fmt(
          receiveAmount
        )} ${
          config.tokenSymbol || "DMOON"
        } purchased`
      );

      setAmount("");

      setTimeout(refreshStats, 2000);
    } catch (err) {
      console.error(err);

      setStatus(
        `Buy failed: ${err.message}`
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="bg-orb orb-1"></div>

      <div className="bg-orb orb-2"></div>

      <div className="bg-stars"></div>

      <main className="page-shell">
        <header className="hero">
          <img
            className="hero-logo"
            src="/assets/logo-banner.jpg"
            alt="DesertMoon logo"
          />

          <h1>Presale is Live!</h1>

          <p className="subtitle">
            The next moonshot on Solana
          </p>

          <div className="hero-stats">
            <div className="stat-chip">
              <span className="label">
                Soft Cap
              </span>

              <strong>
                {fmt(token.softCapSol, 0)} SOL
              </strong>
            </div>

            <div className="stat-chip">
              <span className="label">
                Hard Cap
              </span>

              <strong>
                {fmt(token.hardCapSol, 0)} SOL
              </strong>
            </div>

            <div className="stat-chip">
              <span className="label">
                Max Contribution
              </span>

              <strong>
                {fmt(
                  token.maxContributionSol
                )}{" "}
                SOL
              </strong>
            </div>

            <div className="stat-chip">
              <span className="label">
                Presale Price
              </span>

              <strong>
                $
                {token.currentPriceUsd ||
                  token.presalePriceUsd}
              </strong>
            </div>
          </div>
        </header>
