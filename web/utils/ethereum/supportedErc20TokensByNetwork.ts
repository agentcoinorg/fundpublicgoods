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
    DAI: {
      address: "0x6b175474e89094c44da98b954eedeac495271d0f",
      decimals: 18,
      name: "DAI",
    },
    USDT: {
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      decimals: 6,
      name: "USDT",
    },
  },
  Polygon: {
    USDC: {
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      decimals: 6,
      name: "USDC",
    },
    DAI: {
      address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      decimals: 18,
      name: "DAI",
    },
    USDT: {
      address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      decimals: 6,
      name: "USDT",
    },
  },
  ArbitrumOne: {
    USDC: {
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
      name: "USDC",
    },
    DAI: {
      address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      decimals: 18,
      name: "DAI",
    },
    USDT: {
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 18,
      name: "USDT",
    },
  },
  Optimism: {
    USDC: {
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
      name: "USDC",
    },
    DAI: {
      address: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      decimals: 18,
      name: "DAI",
    },
    USDT: {
      address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
      decimals: 6,
      name: "USDT",
    },
  },
  zkSync: {
    USDC: {
      address: "0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4",
      decimals: 6,
      name: "USDC",
    },
    DAI: {
      address: "0x4b9eb6c0b6ea15176bbf62841c6b2a8a398cb656",
      decimals: 18,
      name: "DAI",
    },
    USDT: {
      address: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C",
      decimals: 6,
      name: "USDT",
    },
  },
  Avalanche: {
    USDC: {
      address: "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e",
      decimals: 6,
      name: "USDC",
    },
    DAI: {
      address: "0xd586e7f844cea2f87f50152665bcbc2c279d8d70",
      decimals: 18,
      name: "DAI",
    },
    USDT: {
      address: "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",
      decimals: 6,
      name: "USDT",
    },
  },
  FantomOpera: {
    USDC: {
      address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
      decimals: 6,
      name: "USDC",
    },
    DAI: {
      address: "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",
      decimals: 18,
      name: "DAI",
    },
    USDT: {
      address: "0x049d68029688eabf473097a2fc38ef61633a3c7a",
      decimals: 6,
      name: "USDT"
    }
  },
  Base: {
    USDC: {
      address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      decimals: 6,
      name: "USDC",
    },
    DAI: {
      address: "0x50c5725949a6f0c72e6c4a641f24049a917db0cb",
      decimals: 18,
      name: "DAI",
    }
  }
};
