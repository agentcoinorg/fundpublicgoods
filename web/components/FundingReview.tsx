"use client";

import { useState } from "react";
import FundingTable, { FundingEntry } from "./FundingTable";
import Button from "./Button";
import clsx from "clsx";
import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import {
  NetworkId,
  NetworkName,
  SUPPORTED_NETWORKS,
  getNetworkNameFromChainId,
  getTokensForNetwork,
  splitTransferFunds,
} from "@/utils/ethereum";
import { useRouter } from "next/navigation";

export default function FundingReview(props: { entries: FundingEntry[] }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isTransferPending, setIsTransferPending] = useState(false);
  const [{ wallet }] = useConnectWallet();
  const router = useRouter();

  async function transferFunds() {
    if (!wallet || isTransferPending) return;
    const projects = props.entries;
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );

    const signer = ethersProvider.getSigner();

    setIsTransferPending(true);

    // TODO: Handle interaction of funding in multiple chains
    const selectedNetwork = projects[0].network;
    const selectedToken = projects[0].token;

    const networkName = getNetworkNameFromChainId(selectedNetwork)
    const token = getTokensForNetwork(networkName).find(
      (t) => t.name == selectedToken
    );

    if (!token) {
      throw new Error(`Token with name: ${selectedToken} is not valid`);
    }
    const amounts = projects.map((project) => Number(project.amount));
    console.log(projects, amounts, signer, token);
    try {
      await splitTransferFunds(
        projects.map((project) => project.recipient),
        amounts,
        signer,
        token.address,
        token.decimals
      );
    } catch (e) {
      throw e;
    } finally {
      setIsTransferPending(false);
    }
  }

  const totalAmount = props.entries.reduce((acc, x) => {
    return acc + Number(x.amount);
  }, 0);

  return (
    <div
      className={clsx(
        "flex flex-col py-12 w-full items-center",
        !showBreakdown && "h-full"
      )}
    >
      <div className="w-3/5">
        <div>Great! I&apos;ve setup the transactions for you below.</div>
        <div className="w-full py-6">
          <div>
            <div className="pb-2">Transaction Overview</div>
            <div className="flex flex-col border border-white rounded p-5 gap-4">
              <div className="flex justify-between flex-wrap w-full">
                <div className="flex flex-col">
                  <div className="font-normal">Sending</div>
                  <div className="text-2xl font-normal">
                    {totalAmount.toFixed(2)} USDC
                  </div>
                  <div
                    className="font-normal pt-2 hover:cursor-pointer"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                  >
                    View funding breakdown
                  </div>
                </div>
                <div className="pt-7">{"->"}</div>
                <div className="flex flex-col">
                  <div className="font-normal">Recipient</div>
                  <div className="text-2xl font-normal">
                    {props.entries.length} projects
                  </div>
                </div>
              </div>
              {showBreakdown && <FundingTable fundingEntries={props.entries} />}
              <div className="border-t border-black" />
              <div className="flex flex-wrap justify-between">
                <div>Gas: 0.001295 ETH</div>
                <div>i</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 pb-8 hover:cursor-pointer" onClick={() => {
          router.push('./')
          router.refresh()
        }}>
          <div>{"<-"}</div>
          <div className="underline">Edit</div>
        </div>
        <div>
          <div className="flex flex-wrap justify-between w-full">
            <div className="flex flex-col">
              <div>Funding {props.entries.length} projects</div>
              <div className="text-[12px] text-slate-500">
                With a total funding of {totalAmount.toFixed(2)} USDC
              </div>
            </div>
            <Button onClick={transferFunds}>Submit</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
