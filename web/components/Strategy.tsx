"use client";

import Button from "./Button";
import { StrategyTable, StrategyTableProps } from "./StrategyTable";
import TextField from "./TextField";
import { useConnectWallet } from "@web3-onboard/react";

export default function Strategy(props: StrategyTableProps) {
  const [{ wallet }, connectWallet] = useConnectWallet();

  async function connect() {
    await connectWallet();
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col gap-4 justify-center w-3/5">
        <TextField label="Results for" />
        <p>
          I&apos;ve evaluated the impact of Ethereum infrastructure projects on
          the Gitcoin project registry and Optimism Retroactive Public Funding,
          and have listed the top 10 most impactful projects below. I&apos;ve
          also allotted a weighting for each to appropriately fund each project.
        </p>
        <div className="flex flex-col gap-4 border-zinc-700 rounded-lg border-2 p-8">
          {!!wallet && <TextField label="Total Funding Amount" />}
          <div className="bg-gray-800 text-gray-300 rounded-lg shadow-md">
            <StrategyTable strategy={props.strategy} />
          </div>
        </div>
        {!wallet ? (
          <div className="flex flex-wrap justify-between">
            <div className="flex flex-col">
              <div>Hey whats up</div>
              <div className="text-[12px] text-slate-500">Hallo</div>
            </div>
            <Button onClick={() => connect()}>Connect →</Button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-between">
            <div className="flex flex-col">
              <div>Funding..</div>
              <div className="text-[12px] text-slate-500">Please provide an amount you'd like to fund.</div>
            </div>
            <Button onClick={() => {}}>Next →</Button>
          </div>
        )}
      </div>
    </div>
  );
}
