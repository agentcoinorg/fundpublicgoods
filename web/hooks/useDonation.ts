import { useConnectWallet } from "@web3-onboard/react";
import { WalletState } from "@web3-onboard/core";
import {
  ERC20_ABI,
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

  const getBalance = async (wallet: WalletState, token: TokenInformation) => {
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );

    const signer = ethersProvider.getSigner();
    const erc20Contract = new ethers.Contract(token.address, ERC20_ABI, signer);
    const currentAddress = await signer.getAddress();
    const balance = await erc20Contract.balanceOf(currentAddress);
    return ethers.utils.formatUnits(balance.toString(), token.decimals);
  };

  return {
    execute,
    isTransactionPending,
    getBalance,
  };
}
