"use client";

import { useState } from "react";
import Button from "./Button";
import { StrategyTable, StrategyWithProjects } from "./StrategyTable";
import TextField from "./TextField";
import { useConnectWallet } from "@web3-onboard/react";
import Dropdown from "./Dropdown";
import { pluralize } from "@/app/lib/utils/pluralize";

function Information(props: {
  title: string;
  subtitle: string;
  onClick: () => void;
  action: string;
  disabled?: boolean;
}) {
  return (
    <div className='flex flex-wrap justify-between'>
      <div className='flex flex-col'>
        <div className='text-lg font-semibold'>{props.title}</div>
        <div className='text-xs text-subdued'>{props.subtitle}</div>
      </div>
      <Button disabled={props.disabled} onClick={props.onClick}>
        {props.action}
      </Button>
    </div>
  );
}

export default function Strategy(props: {
  strategy: StrategyWithProjects;
  prompt: string;
}) {
  const [currentStrategy, setCurrentStrategy] = useState<StrategyWithProjects>(
    props.strategy
  );
  const [currentPromp, setCurrentPrompt] = useState<string>(props.prompt);
  const [amount, setAmount] = useState<number>(0);
  const [{ wallet }, connectWallet] = useConnectWallet();

  const selectedStrategiesLength = currentStrategy.filter(
    ({ selected }) => selected
  ).length;

  async function connect() {
    await connectWallet();
  }

  async function regenerateStrat() {
    // TODO: Attach current prompt with regenerate action
  }

  return (
    <div className='flex justify-center py-10 flex-grow flex-column'>
      <div className='flex flex-col gap-4 mx-auto max-w-wrapper space-y-4'>
        <TextField
          label='Results for'
          value={currentPromp}
          onChange={(e) => setCurrentPrompt(e.target.value)}
        />
        <div className='p-8 bg-indigo-25 rounded-2xl border-2 border-indigo-200 border-dashed'>
          <p>
            I&apos;ve evaluated the impact of Ethereum infrastructure projects
            on the Gitcoin project registry and Optimism Retroactive Public
            Funding, and have listed the top 10 most impactful projects below.
            I&apos;ve also allotted a weighting for each to appropriately fund
            each project.
          </p>
        </div>
        <div className='flex flex-col gap-4 bg-indigo-50 shadow-xl shadow-primary-shadow/10 rounded-3xl border-2 border-indigo-200 p-4'>
          {!!wallet && (
            <TextField
              label='Total Funding Amount'
              rightAdornment={
                <Dropdown items={["USDC"]} field={{ value: "USDC" }} />
              }
              value={amount}
              onChange={(e) => setAmount(+e.target.value)}
            />
          )}
          <StrategyTable
            strategy={currentStrategy}
            modifyStrategy={setCurrentStrategy}
          />
        </div>
        {!wallet ? (
          <Information
            title={`${selectedStrategiesLength} ${props.prompt} ${pluralize(
              ["project", "projects"],
              selectedStrategiesLength
            )}`}
            subtitle={`Connect your wallet to fund ${pluralize(
              ["this project", "these projects"],
              selectedStrategiesLength
            )}`}
            action='Connect →'
            onClick={() => connect()}
          />
        ) : (
          <Information
            title={`Funding ${currentStrategy.length} ${pluralize(
              ["project", "projects"],
              selectedStrategiesLength
            )}`}
            subtitle="Please provide an amount you'd like to fund"
            action='Next →'
            onClick={() => {}}
            disabled={selectedStrategiesLength === 0 || amount === 0}
          />
        )}
      </div>
    </div>
  );
}
