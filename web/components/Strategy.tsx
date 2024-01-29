"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import { StrategyTable, StrategyWithProjects } from "./StrategyTable";
import TextField from "./TextField";
import { useConnectWallet } from "@web3-onboard/react";
import Dropdown from "./Dropdown";
import { pluralize } from "@/app/lib/utils/pluralize";
import { usePathname, useRouter } from "next/navigation";
import { createFundingEntries } from "@/app/actions/createFundingPlan";
import { distributeWeights } from "@/utils/distributeWeights";
import {
  NetworkName,
  TokenInformation,
  getSupportedNetworkFromWallet,
  getTokensForNetwork,
  splitTransferFunds,
} from "@/utils/ethereum";

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
        <div className="text-lg font-semibold">{props.title}</div>
        <div className="text-xs text-subdued">{props.subtitle}</div>
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
  runId: string;
}) {
  const [currentStrategy, setCurrentStrategy] = useState<StrategyWithProjects>(
    props.strategy
  );
  const [currentPromp, setCurrentPrompt] = useState<string>(props.prompt);
  const [token, setToken] = useState<TokenInformation | undefined>(undefined);
  const [amount, setAmount] = useState<string>("0");
  const [{ wallet }, connectWallet] = useConnectWallet();
  const router = useRouter();
  const pathname = usePathname();
  const network: NetworkName | undefined =
    getSupportedNetworkFromWallet(wallet);

  console.log("network", network);

  const tokens = network ? getTokensForNetwork(network) : [];

  const selectedStrategiesLength = currentStrategy.filter(
    ({ selected }) => selected
  ).length;

  async function connect() {
    await connectWallet();
  }

  async function createFundingPlan() {
    const strategies = currentStrategy
      .filter(({ selected }) => selected)
      .map((strategy) => ({
        // TODO: Check why weight is nullable
        amount: strategy.amount as string,
        weight: strategy.weight || 0,
        project_id: strategy.project_id,
      }));

    if (!token) {
      return;
    }

    await createFundingEntries(props.runId, {
      strategies,
      token: token.name,
      decimals: token.decimals,
    });
    router.push(`${pathname}/transaction`);
  }

  async function regenerateStrat() {
    // TODO: Attach current prompt with regenerate action
  }

  useEffect(() => {
    if (tokens.length) {
      setToken(tokens[0]);
    }
  }, [tokens]);

  useEffect(() => {
    if (amount !== "0") {
      const selectedStrategies = currentStrategy.filter(
        ({ selected }) => selected
      );
      const weights = selectedStrategies.map(
        (strategy) => strategy.weight
      ) as number[];
      const amounts = distributeWeights(weights, +amount, 2);

      const updatedStrategy = currentStrategy.map((strategy, index) => {
        if (amounts.length >= index) {
          strategy.amount = amounts[index].toFixed(2);
        }

        return strategy;
      });

      setCurrentStrategy(updatedStrategy);
    }
  }, [amount]);

  return (
    <div className="flex justify-center py-10 flex-grow flex-column">
      <div className="flex flex-col gap-4 mx-auto max-w-wrapper space-y-4">
        <TextField
          label="Results for"
          value={currentPromp}
          onChange={(e) => setCurrentPrompt(e.target.value)}
        />
        <div className="p-8 bg-indigo-25 rounded-2xl border-2 border-indigo-200 border-dashed">
          <p>
            I&apos;ve evaluated the impact of Ethereum infrastructure projects
            on the Gitcoin project registry and Optimism Retroactive Public
            Funding, and have listed the top 10 most impactful projects below.
            I&apos;ve also allotted a weighting for each to appropriately fund
            each project.
          </p>
        </div>
        <div className="flex flex-col gap-4 bg-indigo-50 shadow-xl shadow-primary-shadow/10 rounded-3xl border-2 border-indigo-200 p-4">
          {!!wallet && token && (
            <TextField
              label="Total Funding Amount"
              rightAdornment={
                <Dropdown
                  items={tokens.map((x) => x.name)}
                  field={{ value: token.name }}
                  onChange={(val) =>
                    setToken(
                      tokens.find((x) => x.name === val) as TokenInformation
                    )
                  }
                />
              }
              value={amount}
              onChange={(e) => {
                const newValue = e.target.value;
                // Allow only numbers with optional single leading zero, and only one decimal point
                if (/^(0|[1-9]\d*)?(\.\d*)?$/.test(newValue)) {
                  setAmount(newValue);
                } else {
                  // Fix the value to remove the invalid characters, maintaining only one leading zero if present
                  const fixedValue = newValue
                    .replace(/[^0-9.]/g, "")
                    .replace(/^0+(?=\d)/, "")
                    .replace(/(\..*)\./g, "$1");
                  setAmount(fixedValue);
                }
              }}
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
            action="Connect →"
            onClick={() => connect()}
          />
        ) : (
          <Information
            title={`Funding ${currentStrategy.length} ${pluralize(
              ["project", "projects"],
              selectedStrategiesLength
            )}`}
            subtitle="Please provide an amount you'd like to fund"
            action="Next →"
            onClick={createFundingPlan}
            disabled={selectedStrategiesLength === 0 || amount === "0"}
          />
        )}
      </div>
    </div>
  );
}
