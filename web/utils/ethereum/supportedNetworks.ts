export const SUPPORTED_NETWORKS = {
  Mainnet: 1,
  Polygon: 137,
  ArbitrumOne: 42161,
  Optimism: 10,
  Base: 8453,
  FantomOpera: 250,
  Sepolia: 11155111,
  // TODO: Disperse contract is not deployed on these networks
  // zkSync: 324,
  // Avalanche: 43114,
  // PGN: 424,
} as const

export type NetworkName = keyof typeof SUPPORTED_NETWORKS;
export type NetworkId = (typeof SUPPORTED_NETWORKS)[NetworkName]

export const isValidNetworkName = (network: string): network is NetworkName => {
  const values = Object.keys(SUPPORTED_NETWORKS) as unknown as string[];
  return values.includes(network);
};