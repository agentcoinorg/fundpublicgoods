import { ethers, BigNumber } from "ethers";

const ERC20_ABI = [
  "function transfer(address to, uint256 value) external returns (bool)",
  "function transferFrom(address from, address to, uint256 value) external returns (bool)",
  "function approve(address spender, uint256 value) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

const DISPERSE_ABI = [
  "function disperseEther(address[] recipients, uint256[] values) external payable",
  "function disperseToken(address token, address[] recipients, uint256[] values) external",
  "function disperseTokenSimple(address token, address[] recipients, uint256[] values) external"
];

const DISPERSE_CONTRACT_ADDRESS = "0xD152f549545093347A162Dce210e7293f1452150";

// Use address(0) or 'undefined' for ETH
export async function splitTransferFunds(
  addresses: string[],
  amounts: number[],
  signer: ethers.Signer,
  tokenAddress?: string,
  tokenDecimals?: number
  ) {
  const disperseContract = new ethers.Contract(DISPERSE_CONTRACT_ADDRESS, DISPERSE_ABI, signer);

  const validAddresses = addresses.filter((address) => ethers.utils.getAddress(address));
  const values = amounts.map((amount) => ethers.utils.parseUnits(amount.toString(), tokenDecimals));
  const totalValue = values.reduce((acc, value) => acc.add(value), ethers.constants.Zero);

  if (!tokenAddress || tokenAddress === ethers.constants.AddressZero) {
    // Ether transfer
    console.log("ether transfer");
    await disperseContract.disperseEther(validAddresses, values, {
    value: totalValue,
    });
  } else {
    // ERC20 token transfer
    console.log("tokenAddress", tokenAddress);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    const currentAllowance: BigNumber = await tokenContract.allowance(
      await signer.getAddress(),
      DISPERSE_CONTRACT_ADDRESS
    );
    console.log("currentAllowance", currentAllowance);

    if (currentAllowance.lt(totalValue)) {
      const approveTx = await tokenContract.approve(DISPERSE_CONTRACT_ADDRESS, totalValue);
      await approveTx.wait(1);
    }

    const transferTx = await disperseContract.disperseTokenSimple(tokenAddress, validAddresses, values);
    await transferTx.wait(1);
  }
}
