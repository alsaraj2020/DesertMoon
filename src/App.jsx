import React, { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

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
      priceUsd: 0.01,
      minRaisedSol: 11250,
      maxRaisedSol: 26250,
      allocation: "20%",
    },
    {
      name: "Tier 3",
      priceUsd: 0.02,
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

export default DEFAULT_TOKEN;
