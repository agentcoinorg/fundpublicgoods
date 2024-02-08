import { isAddress } from "ethers/lib/utils";

/**
 * Truncates an ethereum address to the format 0x0000…0000
 * @param address Full address to truncate
 * @returns Truncated address
 */
const truncateEthAddress = (address: string) => {
  if (isAddress(address)) {
    return address.slice(0, 6).concat("...") + address.slice(-4)
  }
};

export default truncateEthAddress;
