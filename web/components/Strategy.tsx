"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import { StrategyTable, StrategyWithProjects } from "./StrategyTable";
import TextField from "./TextField";
import { useConnectWallet } from "@web3-onboard/react";
import Dropdown from "./Dropdown";
import { pluralize } from "@/app/lib/utils/pluralize";
import { ethers } from "ethers";
import { distributeWeights } from "@/utils/distributeWeights";
import { NetworkName, TokenInformation, getSupportedNetworkFromWallet, getTokensForNetwork, splitTransferFunds } from "@/utils/ethereum";

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
  const [token, setToken] = useState<TokenInformation | undefined>(undefined);
  const [amount, setAmount] = useState<string>("0");
  const [{ wallet }, connectWallet] = useConnectWallet();
  const [isTransferPending, setIsTransferPending] = useState(false);
  const network: NetworkName | undefined = getSupportedNetworkFromWallet(wallet);

  console.log("network", network)

  const tokens = network 
    ? getTokensForNetwork(network) 
    : [];

  useEffect(() => {
    if (tokens.length) {
      setToken(tokens[0]);
    }
  }, [tokens]);

  const selectedStrategiesLength = currentStrategy.filter(
    ({ selected }) => selected
  ).length;

  async function connect() {
    await connectWallet();
  }

  async function regenerateStrat() {
    // TODO: Attach current prompt with regenerate action
  }

  async function transferFunds() {
    if (!wallet || isTransferPending || !token) return;

    const ethersProvider = new ethers.providers.Web3Provider(wallet.provider, "any");
  
    const signer = ethersProvider.getSigner()
    
    const projects = currentStrategy
      .filter(({ selected }) => selected)
      .filter(({ weight }) => weight)
      .map(({ weight }) => ({
      //TODO: Use real addresses
        address: "0xB1B7586656116D546033e3bAFF69BFcD6592225E",
        weight: weight as number,
      }));

    const amounts = distributeWeights(
      projects.map(project => project.weight), 
      +amount, 
      token.decimals
    );

    setIsTransferPending(true);

    console.log(projects, amounts, signer, token)
    try {
      await splitTransferFunds(
        projects.map((project) => project.address),
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

  return (
    <div className='flex justify-center py-10 flex-grow flex-column'>
      <div className='flex flex-col gap-4 mx-auto max-w-wrapper space-y-4'>
        <TextField
          label='Results for'
          value={currentPromp}
          onChange={(e) => setCurrentPrompt(e.target.value)}
        />
        <p>
          I&apos;ve evaluated the impact of Ethereum infrastructure projects on
          the Gitcoin project registry and Optimism Retroactive Public Funding,
          and have listed the top 10 most impactful projects below. I&apos;ve
          also allotted a weighting for each to appropriately fund each project.
        </p>
        <div className='flex flex-col gap-4 bg-indigo-50 shadow-xl shadow-primary-shadow/10 rounded-3xl border-2 border-indigo-200 p-4'>
          {!!wallet && token && (
            <TextField
              label='Total Funding Amount'
              rightAdornment={
                <Dropdown items={tokens.map(x => x.name)} field={{ value: token.name }} onChange={val => setToken(tokens.find(x => x.name === val) as TokenInformation)} />
              }
              value={amount}
              onChange={(e) => {
                const newValue = e.target.value;
                // Allow only numbers with optional single leading zero, and only one decimal point
                if (/^(0|[1-9]\d*)?(\.\d*)?$/.test(newValue)) {
                  setAmount(newValue);
                } else {
                  // Fix the value to remove the invalid characters, maintaining only one leading zero if present
                  const fixedValue = newValue.replace(/[^0-9.]/g, "")
                    .replace(/^0+(?=\d)/, "")
                    .replace(/(\..*)\./g, '$1');
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
            onClick={transferFunds}
            disabled={selectedStrategiesLength === 0 || amount === "0" || isTransferPending}
          />
        )}
      </div>
    </div>
  );
}
