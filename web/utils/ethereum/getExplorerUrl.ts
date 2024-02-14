import { NetworkName } from ".";

export function getExplorerUrl(network: NetworkName, address: string): string {
  switch (network) {
    case "Mainnet": return `https://etherscan.io/address/${address}`;
    case "Polygon": return `https://polygonscan.com/address/${address}`;
    case "ArbitrumOne": return `https://arbiscan.io/address/${address}`;
    case "Optimism": return `https://optimistic.etherscan.io/address/${address}`;
    case "Base": return `https://basescan.org/address/${address}`;
    case "FantomOpera": return `https://ftmscan.com/address/${address}`;
    case "Sepolia": return `https://sepolia.etherscan.io/address/${address}`;
    case "zkSync": return `https://explorer.zksync.io/address/${address}`;
    case "Avalanche": return `https://subnets.avax.network/c-chain/address/${address}`;
  }
}
