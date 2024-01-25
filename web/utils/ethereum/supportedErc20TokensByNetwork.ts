import { NetworkName } from ".";
import { SupportedTokensInformation } from "./supportedErc20Tokens";

export const supportedErc20TokensByNetwork: SupportedTokensInformation = {
  Sepolia: {
    WETH: {
      address: "0xfff9976782d46cc05630d1f6ebab18b2324d6b14",
      decimals: 18,
      name: "WETH",
    },
  },
  Mainnet: {
    USDC: {
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      decimals: 6,
      name: "USDC",
    },
  },
  Polygon: {
    USDC: {
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      decimals: 6,
      name: "USDC",
    },
  },
  ArbitrumOne: {
    USDC: {
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
      name: "USDC",
    },
  },
  Optimism: {
    USDC: {
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
      name: "USDC",
    },
  },
};
