"use client";

import { Web3OnboardProvider, init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";

const chains = [
  {
    id: "0x1",
    token: "ETH",
    label: "Mainnet",
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
  },
  {
    id: "0xa86a",
    token: "AVAX",
    label: "Avalanche",
    rpcUrl: `https://avalanche-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
  },
  {
    id: "0xa",
    token: "ETH",
    label: "Optimism",
    rpcUrl: `https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
  },
  {
    id: "0xa4b1",
    token: "ETH",
    label: "ArbitrumOne",
    rpcUrl: `https://arbitrum-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
  },
  {
    id: "0x89",
    token: "MATIC",
    label: "Polygon",
    rpcUrl: `https://polygon-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
  },
  {
    id: "0x2105",
    token: "ETH",
    label: "Base",
    rpcUrl: `https://base.llamarpc.com`,
  },
  {
    id: "0x144",
    token: "ETH",
    label: "zkSync",
    rpcUrl: `0x144`,
  },
  {
    id: "0xfa",
    token: "FTM",
    label: "FantomOpera",
    rpcUrl: `https://1rpc.io/ftm`,
  },
  {
    id: "0xe298",
    token: "ETH",
    label: "Sepolia",
    rpcUrl: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_PROJECT_ID}`,
  },
];
const wallets = [injectedModule()];
const web3Onboard = init({
  wallets,
  chains,
  appMetadata: {
    name: "Fund Public Goods",
    icon: "<svg>App Icon</svg>",
    description: "cool description",
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
