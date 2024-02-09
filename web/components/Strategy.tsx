"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import { StrategyTable } from "./StrategyTable";
import TextField from "./TextField";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import Dropdown from "./Dropdown";
import { pluralize } from "@/app/lib/utils/pluralize";
import { useRouter } from "next/navigation";
import { NetworkName, SUPPORTED_NETWORKS } from "@/utils/ethereum";
import useSession from "@/hooks/useSession";
import { startRun } from "@/app/actions";
import {
  StrategiesWithProjects,
  useStrategiesHandler,
} from "@/hooks/useStrategiesHandler";
import { useDonation } from "@/hooks/useDonation";
import LoadingCircle from "./LoadingCircle";
import { useToken } from "@/hooks/useToken";

export default function Strategy(props: {
  fetchedStrategies: StrategiesWithProjects;
  prompt: string;
  runId: string;
  networks: NetworkName[];
}) {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkName>(
    props.networks[0]
  );
  const [currentPrompt, setCurrentPrompt] = useState<string>(props.prompt);
  const [amount, setAmount] = useState<string>("0");
  const [balance, setBalance] = useState<string | null>();
  const {
    execute: executeDonation,
    isTransactionPending,
    getBalance,
  } = useDonation();
  const strategiesHandler = useStrategiesHandler(
    props.fetchedStrategies,
    amount,
    selectedNetwork
  );
  const [
    { connectedChain },
    setChain, // function to call to initiate user to switch chains in their wallet
  ] = useSetChain();
  const [{ wallet }, connectWallet] = useConnectWallet();
  const { data: session } = useSession();
  const router = useRouter();
  const {
    tokens,
    updateToken: updateToken,
    selectedToken,
  } = useToken(selectedNetwork);

  const { strategies, handleAmountUpdate, handleNetworkUpdate } =
    strategiesHandler;
  const selectedStrategiesLength = strategies.filter((x) => x.selected).length;

  useEffect(() => {
    setBalance((currentBalance) => {
      if (currentBalance) return null;
    });
  }, [selectedToken]);

  async function connect() {
    await connectWallet();
  }

  const executeTransaction = async () => {
    if (selectedStrategiesLength === 0 || amount === "0") return;

    const currentNetworkId = SUPPORTED_NETWORKS[selectedNetwork];
    if (connectedChain && currentNetworkId !== +connectedChain.id) {
      await setChain({ chainId: `0x${currentNetworkId.toString(16)}` });
      return;
    }
    if (!selectedToken || !wallet) return;

    const balance = await getBalance(wallet, selectedToken);

    if (+amount >= +balance) {
      setBalance(balance);
      return;
    }

    const donations = strategies
      .filter((x) => x.selected)
      .map((strategy) => ({
        amount: strategy.amount as string,
        description: strategy.project.description as string,
        title: strategy.project.title as string,
        recipient: strategy.recipient,
      }));

    await executeDonation({
      donations,
      network: selectedNetwork,
      token: selectedToken,
    });
  };

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

  return (
    <div className="flex justify-center py-10 px-6 flex-grow flex-column">
      <div className="flex flex-col gap-4 mx-auto max-w-wrapper w-full space-y-4">
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
        <div className="space-y-6 bg-indigo-50 rounded-3xl border-2 border-indigo-200 p-2 md:p-4">
          <div className="space-y-2">
            <div>
              <Dropdown
                items={props.networks.filter((n) => n !== selectedNetwork)}
                field={{ value: selectedNetwork }}
                onChange={(newValue) => {
                  handleNetworkUpdate(newValue as NetworkName);
                  setSelectedNetwork(newValue as NetworkName);
                }}
              />
            </div>
          </div>
          <StrategyTable {...strategiesHandler} />
        </div>
        {wallet ? (
          <div className="flex flex-wrap justify-between items-center w-full px-1">
            <div className="flex flex-col w-full md:w-auto mb-2 md:mb-0">
              <div className="text-lg font-semibold">{`Funding ${selectedStrategiesLength} ${pluralize(
                ["project", "projects"],
                selectedStrategiesLength
              )}`}</div>
              <div className="text-xs text-subdued">
                {"Please provide an amount you'd like to fund"}
              </div>
            </div>
            <div>
              <TextField
                error={
                  balance && +balance < +amount
                    ? `Insufficient ${selectedToken.name} balance`
                    : ""
                }
                rightAdornment={
                  <Dropdown
                    items={tokens
                      .filter((x) => x.name !== selectedToken.name)
                      .map((x) => x.name)}
                    field={{ value: selectedToken.name }}
                    onChange={async (newToken) => await updateToken(newToken)}
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
                  if (balance) {
                    setBalance(null);
                  }
                }}
              />
            </div>

            <Button
              disabled={selectedStrategiesLength === 0 || amount === "0"}
              onClick={executeTransaction}
            >
              {isTransactionPending ? <LoadingCircle hideText /> : "Next →"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-between items-center w-full px-1">
            <div className="flex flex-col w-full md:w-auto mb-2 md:mb-0">
              <div className="text-lg font-semibold">
                {`${selectedStrategiesLength} ${props.prompt} ${pluralize(
                  ["project", "projects"],
                  selectedStrategiesLength
                )}`}
              </div>
              <div className="text-xs text-subdued">
                {`Connect your wallet to fund ${pluralize(
                  ["this project", "these projects"],
                  selectedStrategiesLength
                )}`}
              </div>
            </div>
            <Button onClick={() => connect()}>{"Connect →"}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
