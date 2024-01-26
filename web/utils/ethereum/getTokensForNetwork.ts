import { NetworkName, TokenInformation, supportedErc20TokensByNetwork } from ".";

export function getTokensForNetwork(network: NetworkName): TokenInformation[] {
  if (!network || !supportedErc20TokensByNetwork[network]) return [];

  const tokensForNetwork = supportedErc20TokensByNetwork[network];

  if (!tokensForNetwork) return [];

  const tokens: TokenInformation[] = Object.values(tokensForNetwork) as TokenInformation[];

  return tokens.filter(token => token);
}
