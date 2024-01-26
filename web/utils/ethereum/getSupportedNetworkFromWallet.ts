import { WalletState } from "@web3-onboard/core";
import { SUPPORTED_NETWORKS, NetworkName } from ".";

export function getSupportedNetworkFromWallet(wallet: WalletState | null) {
  return wallet 
    ? wallet.chains.length
      ? Object.values(SUPPORTED_NETWORKS).includes(+wallet.chains[0].id as any)
        ? Object.keys(SUPPORTED_NETWORKS).find((key) => 
            SUPPORTED_NETWORKS[key as NetworkName] === +wallet.chains[0].id
          ) as NetworkName
        : undefined
      : undefined
    : undefined;
}