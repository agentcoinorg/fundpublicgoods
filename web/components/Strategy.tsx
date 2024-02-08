"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import { StrategyTable } from "./StrategyTable";
import TextField from "./TextField";
import { useConnectWallet } from "@web3-onboard/react";
import Dropdown from "./Dropdown";
import { pluralize } from "@/app/lib/utils/pluralize";
import { usePathname, useRouter } from "next/navigation";
import {
  NetworkName,
  TokenInformation,
  getTokensForNetwork,
} from "@/utils/ethereum";
import useWalletLogin from "@/hooks/useWalletLogin";
import useSession from "@/hooks/useSession";
import { startRun } from "@/app/actions";
import {
  StrategiesWithProjects,
  useStrategiesHandler,
} from "@/hooks/useStrategiesHandler";

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
  fetchedStrategies: StrategiesWithProjects;
  prompt: string;
  runId: string;
}) {
  const [selectedNetwork, setSelectedNetwork] =
    useState<NetworkName>("Mainnet");
  const [currentPrompt, setCurrentPrompt] = useState<string>(props.prompt);
  const [amount, setAmount] = useState<string>("0");
  const [token, setToken] = useState<TokenInformation | undefined>(undefined);

  const strategiesHandler = useStrategiesHandler(
    props.fetchedStrategies,
    amount,
    selectedNetwork
  );
  const [{ wallet }, connectWallet] = useConnectWallet();
  const loginWithWallet = useWalletLogin();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const tokens = getTokensForNetwork(selectedNetwork);

  const {
    strategies,
    handleAmountUpdate,
    handleNetworkUpdate,
    prepareDonation,
  } = strategiesHandler;
  const uniqueNetworks = Array.from(new Set(strategies.map((s) => s.network)));
  const selectedStrategiesLength = strategies.filter((x) => x.selected).length;

  async function connect() {
    await connectWallet();
    await loginWithWallet();
  }

  async function createFundingPlan() {
    if (!token) return;
    prepareDonation(token);
    router.push(`${pathname}/transaction`);
  }

  async function regenerateStrat(prompt: string) {
    if (!session) {
      throw new Error("User needs to have a session");
    }
    const response = await startRun(prompt, session.supabaseAccessToken);
    router.push(`/s/${response.runId}`);
  }

  function updateWeights() {
    if (amount !== "0") {
      handleAmountUpdate(amount);
    }
  }

  useEffect(() => {
    if (tokens.length) {
      setToken(tokens[0]);
    }
  }, [tokens]);

  return (
    <div className="flex justify-center py-10 px-6 flex-grow flex-column">
      <div className="flex flex-col gap-4 mx-auto max-w-wrapper space-y-4">
        <TextField
          label="Results for"
          value={currentPrompt}
          onChange={(e) => setCurrentPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !!currentPrompt) {
              regenerateStrat(currentPrompt);
            }
          }}
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
          <div>
            <Dropdown
              items={uniqueNetworks.filter((n) => n !== selectedNetwork)}
              field={{ value: selectedNetwork }}
              onChange={(newValue) => {
                handleNetworkUpdate(newValue as NetworkName);
                setSelectedNetwork(newValue as NetworkName);
              }}
            />
          </div>
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
              onBlur={updateWeights}
              onKeyDown={(event: React.KeyboardEvent) => {
                if (event.key === "Enter" && amount !== "0") {
                  updateWeights();
                }
              }}
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
          <StrategyTable {...strategiesHandler} />
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
            title={`Funding ${selectedStrategiesLength} ${pluralize(
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
