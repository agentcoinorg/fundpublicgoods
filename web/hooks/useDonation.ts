import { useConnectWallet } from "@web3-onboard/react";
import {
  NetworkName,
  TokenInformation,
  getTokensForNetwork,
  splitTransferFunds,
} from "@/utils/ethereum";
import { useState } from "react";
import { ethers } from "ethers";

export interface FundingEntry {
  network: NetworkName;
  token: TokenInformation;
  donations: {
    description: string;
    title: string;
    amount: string;
    recipient: string;
  }[];
}

export function useDonation() {
  const [{ wallet }] = useConnectWallet();
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  const execute = async (plan: FundingEntry) => {
    if (!wallet || isTransactionPending) return;
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );

    const signer = ethersProvider.getSigner();

    setIsTransactionPending(true);

    const { network: selectedNetwork, token: selectedToken, donations } = plan;
    const token = getTokensForNetwork(selectedNetwork).find(
      (t) => t.name == selectedToken.name
    );

    if (!token) {
      throw new Error(`Token with name: ${selectedToken} is not valid`);
    }
    const amounts = donations.map((d) => Number(d.amount));
    console.log(plan, amounts, signer, token);
    try {
      await splitTransferFunds(
        donations.map((d) => d.recipient),
        amounts,
        signer,
        selectedNetwork,
        token.address,
        token.decimals
      );
    } catch (e) {
      throw e;
    } finally {
      setIsTransactionPending(false);
    }
  };

  return {
    execute,
    isTransactionPending,
  };
}
