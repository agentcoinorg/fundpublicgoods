import { useConnectWallet } from "@web3-onboard/react";
import { WalletState } from "@web3-onboard/core";
import {
  DISPERSE_CONTRACT_ADDRESSES,
  ERC20_ABI,
  NetworkName,
  TokenInformation,
  splitTransferFunds,
} from "@/utils/ethereum";
import { BigNumber, ethers } from "ethers";

export function useDonation() {
  const [{ wallet }] = useConnectWallet();

  const execute = async (
    network: NetworkName, 
    token: TokenInformation, 
    recipientAddresses: string[], 
    amounts: number[]
  ) => {
    if (!wallet) return;
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );

    const signer = ethersProvider.getSigner();

    console.log(recipientAddresses, amounts.map(x => x.toString()), signer, token, network);

    await splitTransferFunds(
      recipientAddresses,
      amounts,
      signer,
      network,
      token.address
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
    return await tokenContract.balanceOf(currentAddress);
  };

  const getAllowance = async (wallet: WalletState, token: TokenInformation, network: NetworkName): Promise<BigNumber> => {
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );

    const signer = ethersProvider.getSigner();
    const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
    const currentAddress = await signer.getAddress();
    const contractAddress = DISPERSE_CONTRACT_ADDRESSES[network];

    return await tokenContract.allowance(currentAddress, contractAddress);
  };

  const approve = async (
    wallet: WalletState,
    token: TokenInformation,
    amount: BigNumber,
    network: NetworkName
  ) => {
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );
    const signer = ethersProvider.getSigner();
    const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);

    const contractAddress = DISPERSE_CONTRACT_ADDRESSES[network];
    const approveTx = await tokenContract.approve(contractAddress, amount);
    await approveTx.wait(1);
  };

  return {
    execute,
    getBalance,
    approve,
    getAllowance
  };
}
