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
} as const;

export type NetworkName = keyof typeof SUPPORTED_NETWORKS;
export type NetworkId = (typeof SUPPORTED_NETWORKS)[NetworkName];

export const isValidNetworkName = (network: string): network is NetworkName => {
  const values = Object.keys(SUPPORTED_NETWORKS) as unknown as string[];
  return values.includes(network);
};

export const isValidNetworkId = (id: number): id is NetworkId => {
  const values = Object.values(SUPPORTED_NETWORKS) as unknown as number[];
  return values.includes(id);
};

export const getNetworkNameFromChainId = (id: number): NetworkName => {
  if (!isValidNetworkId(id)) {
    throw Error("Not valid ID: " + id);
  }
  const networkIndex = Object.values(SUPPORTED_NETWORKS).indexOf(id);
  const networkName = Object.keys(SUPPORTED_NETWORKS)[networkIndex];

  return networkName as NetworkName;
};
