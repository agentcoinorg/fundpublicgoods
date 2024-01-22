"use client"

import Onboard from "@web3-onboard/core"
import { Web3OnboardProvider, init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";

const chains = [
  {
    id: "0x1",
    token: "ETH",
    label: "Ethereum Mainnet",
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
  },
];
const wallets = [injectedModule()];
const web3Onboard = init({
  wallets,
  chains,
  appMetadata: {
    name: "Fund Public Goods",
    icon: "<svg>App Icon</svg>",
    description: "cool description"
  },
});

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      {children}
    </Web3OnboardProvider>
  );
}
