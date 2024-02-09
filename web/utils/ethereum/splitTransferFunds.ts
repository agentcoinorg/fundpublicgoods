import { ethers } from "ethers";
import { NetworkName, SUPPORTED_NETWORKS } from "./supportedNetworks";

export const ERC20_ABI = [
  "function transfer(address to, uint256 value) external returns (bool)",
  "function transferFrom(address from, address to, uint256 value) external returns (bool)",
  "function approve(address spender, uint256 value) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address owner) external view returns (uint256)"
];

export const DISPERSE_ABI = [
  "function disperseEther(address[] recipients, uint256[] values) external payable",
  "function disperseToken(address token, address[] recipients, uint256[] values) external",
  "function disperseTokenSimple(address token, address[] recipients, uint256[] values) external",
];

export const DISPERSE_CONTRACT_ADDRESSES = Object.keys(SUPPORTED_NETWORKS).reduce((acc, network) => {
  return {
    ...acc,
    [network]: "0xD152f549545093347A162Dce210e7293f1452150",
    "Avalanche": "0xe88ac4b9e9aabf0833f0963e45928f5f60f84cfd",
    "zkSync": "0xbC4c9E0DBCd7719b9861aA6c471da3e222F1c487"
  }
}, {} as Record<NetworkName, string>)

// Use address(0) or 'undefined' for ETH
export async function splitTransferFunds(
  addresses: string[],
  amounts: number[],
  signer: ethers.Signer,
  selectedNetwork: NetworkName,
  tokenAddress?: string,
  tokenDecimals?: number,
) {
  const disperseContract = new ethers.Contract(
    DISPERSE_CONTRACT_ADDRESSES[selectedNetwork],
    DISPERSE_ABI,
    signer
  );

  const validAddresses = addresses.filter((address) =>
    ethers.utils.getAddress(address)
  );
  const values = amounts.map((amount) =>
    ethers.utils.parseUnits(amount.toString(), tokenDecimals)
  );
  const totalValue = values.reduce(
    (acc, value) => acc.add(value),
    ethers.constants.Zero
  );

  if (!tokenAddress || tokenAddress === ethers.constants.AddressZero) {
    // Ether transfer
    await disperseContract.disperseEther(validAddresses, values, {
      value: totalValue,
    });
  } else {
    const transferTx = await disperseContract.disperseTokenSimple(
      tokenAddress,
      validAddresses,
      values
    );
    await transferTx.wait(1);
  }
}
