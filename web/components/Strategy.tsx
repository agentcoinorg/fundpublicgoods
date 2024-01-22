"use client";

import { useState } from "react";
import Button from "./Button";
import {
  StrategyTable,
  StrategyTableProps,
  StrategyWithProjects,
} from "./StrategyTable";
import TextField from "./TextField";
import { useConnectWallet } from "@web3-onboard/react";

function Information(props: {
  title: string;
  subtitle: string;
  onClick: () => void;
  action: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-between">
      <div className="flex flex-col">
        <div>{props.title}</div>
        <div className="text-[12px] text-slate-500">{props.subtitle}</div>
      </div>
      <Button disabled={props.disabled} onClick={props.onClick}>{props.action}</Button>
    </div>
  );
}

export default function Strategy(props: {
  strategy: StrategyWithProjects;
  prompt: string;
}) {
  const [currentStrategy, setCurrentStrategy] = useState<StrategyWithProjects>(props.strategy)
  const [{ wallet }, connectWallet] = useConnectWallet();

  const selectedStrategiesLength = currentStrategy.filter(({ selected }) => selected).length

  async function connect() {
    await connectWallet();
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col gap-4 justify-center w-3/5">
        <TextField label="Results for" value={props.prompt} />
        <p>
          I&apos;ve evaluated the impact of Ethereum infrastructure projects on
          the Gitcoin project registry and Optimism Retroactive Public Funding,
          and have listed the top 10 most impactful projects below. I&apos;ve
          also allotted a weighting for each to appropriately fund each project.
        </p>
        <div className="flex flex-col gap-4 border-zinc-700 rounded-lg border-2 p-8">
          {!!wallet && <TextField label="Total Funding Amount" />}
          <div className="bg-gray-800 text-gray-300 rounded-lg shadow-md">
            <StrategyTable strategy={currentStrategy} modifyStrategy={setCurrentStrategy} />
          </div>
        </div>
        {!wallet ? (
          <Information
            title={`${selectedStrategiesLength} ${props.prompt} projects`}
            subtitle="Connect your wallet to fund these projects"
            action="Connect →"
            onClick={() => connect()}
          />
        ) : (
          <Information
            title={`Funding ${currentStrategy.length} projects`}
            subtitle="Please provide an amount you'd like to fund"
            action="Next →"
            onClick={() => {}}
            disabled={selectedStrategiesLength === 0}
          />
        )}
      </div>
    </div>
  );
}
