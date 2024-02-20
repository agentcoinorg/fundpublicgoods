import { useEffect, useState } from "react";
import {
  NetworkName,
  TokenInformation,
  getTokensForNetwork,
} from "@/utils/ethereum";

export function useToken(network: NetworkName) {
  const tokens = getTokensForNetwork(network);
  const [token, setToken] = useState<TokenInformation>({
    ...tokens[0],
  });

  useEffect(() => {
    const newTokens = getTokensForNetwork(network);
    updateToken(newTokens[0].name);
  }, [network]);

  const updateToken = (tokenName: string) => {
    const tokens = getTokensForNetwork(network);
    const token = tokens.find((t) => t.name === tokenName);

    if (token) {
      setToken(token);
    }
  };

  return {
    tokens,
    selectedToken: token,
    updateToken,
  };
}
