import { NetworkName } from "./supportedNetworks";

export const supportedErc20Tokens = ["USDC", "USDT", "DAI", "WETH"] as const;
export type SupportedERC20Tokens = (typeof supportedErc20Tokens)[number];

export interface TokenInformation {
  address: string;
  decimals: number;
  name: string;
}

export type SupportedTokensInformation = Partial<Record<
  NetworkName,
  Partial<Record<SupportedERC20Tokens, TokenInformation>>
>>;

export const isValidToken = (token: string): token is SupportedERC20Tokens => {
  const tokens = supportedErc20Tokens as unknown as string[];
  return tokens.includes(token);
};
