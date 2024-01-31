import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import { getCsrfToken, signIn } from "next-auth/react";
import { SiweMessage } from "siwe";

export default function useWalletLogin() {
  const [{ wallet }, connect] = useConnectWallet()

  const handleLogin = async () => {
    const walletToUse = wallet ?? (await connect())[0]

    const provider = new ethers.providers.Web3Provider(walletToUse.provider)
    const chainId = parseInt(walletToUse.chains[0].id);
    const signer = await provider.getSigner();
    const address = await signer.getAddress()
    const nonce = await getCsrfToken()

    try {
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in with Ethereum to the app.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      })
      const preparedMessage = message.prepareMessage()
      const signedMessage = await signer.signMessage(preparedMessage)

      await signIn("siwe", {
        message: JSON.stringify(message),
        redirect: false,
        signature: signedMessage,
      })
    } catch (error) {
      console.log(error)
    }
  }

  return handleLogin
}