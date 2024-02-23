import { useConnectWallet } from "@web3-onboard/react";
import { WalletState } from "@web3-onboard/core";
import {
  DISPERSE_CONTRACT_ADDRESSES,
  ERC20_ABI,
  NetworkName,
  TokenInformation,
  getTokensForNetwork,
  splitTransferFunds,
} from "@/utils/ethereum";
import { ethers } from "ethers";

export function useDonation() {
  const [{ wallet }] = useConnectWallet();

  const execute = async (
    selectedNetwork: NetworkName, 
    selectedToken: TokenInformation, 
    recipientAddresses: string[], 
    amounts: number[]
  ) => {
    if (!wallet) return;
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );

    const signer = ethersProvider.getSigner();

    const token = getTokensForNetwork(selectedNetwork).find(
      (t) => t.name == selectedToken.name
    );

    if (!token) {
      throw new Error(`Token with name: ${selectedToken} is not valid`);
    }
    console.log(recipientAddresses, amounts, signer, token, selectedNetwork);

    await splitTransferFunds(
      recipientAddresses,
      amounts,
      signer,
      selectedNetwork,
      token.address,
      token.decimals
    );
  };

  const getBalance = async (wallet: WalletState, token: TokenInformation) => {
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );

    const signer = ethersProvider.getSigner();
    const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
    const currentAddress = await signer.getAddress();
    const balance = await tokenContract.balanceOf(currentAddress);
    return ethers.utils.formatUnits(balance.toString(), token.decimals);
  };

  const getAllowance = async (wallet: WalletState, token: TokenInformation, network: NetworkName) => {
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );

    const signer = ethersProvider.getSigner();
    const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
    const currentAddress = await signer.getAddress();
    const contractAddress = DISPERSE_CONTRACT_ADDRESSES[network];

    const balance = await tokenContract.allowance(currentAddress, contractAddress);
    return ethers.utils.formatUnits(balance.toString(), token.decimals);
  };

  const approve = async (
    wallet: WalletState,
    token: TokenInformation,
    amount: number,
    network: NetworkName
  ) => {
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );
    const signer = ethersProvider.getSigner();
    const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);

    const contractAddress = DISPERSE_CONTRACT_ADDRESSES[network];
    const amountInDecimals = ethers.utils.parseUnits(amount.toString(), token.decimals);
    const approveTx = await tokenContract.approve(contractAddress, amountInDecimals);
    await approveTx.wait(1);
  };

  return {
    execute,
    getBalance,
    approve,
    getAllowance
  };
}
