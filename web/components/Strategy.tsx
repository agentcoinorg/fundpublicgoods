"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import { StrategyTable } from "./StrategyTable";
import TextField from "./TextField";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import Dropdown from "./Dropdown";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { NetworkName, SUPPORTED_NETWORKS, getNetworkNameFromChainId } from "@/utils/ethereum";
import useSession from "@/hooks/useSession";
import { startRun } from "@/app/actions";
import {
  StrategiesWithProjects,
  useStrategiesHandler,
} from "@/hooks/useStrategiesHandler";
import { useDonation } from "@/hooks/useDonation";
import LoadingCircle from "./LoadingCircle";
import { useToken } from "@/hooks/useToken";
import ChatInputButton from "./ChatInputButton";
import SuccessModal from "./SuccessModal";
import { XLogo } from "./Icons";
import Image from "next/image";
import { pluralize } from "@/utils/pluralize";
import { findMostRepeatedString } from "@/utils/findMostRepeatedString";
import { useTweetShare } from "@/hooks/useTweetShare";

export default function Strategy(props: {
  fetchedStrategies: StrategiesWithProjects;
  prompt: string;
  runId: string;
  networks: NetworkName[];
}) {
  const [currentPrompt, setCurrentPrompt] = useState<string>(props.prompt);
  const [amount, setAmount] = useState<string>("0");
  const [balance, setBalance] = useState<string | null>();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const searchParams = useSearchParams()
  const overwrites = {
    weights: searchParams.get("weights") ? searchParams.get("weights")?.split(",") : null,
    projects: searchParams.get("projects") ? searchParams.get("projects")?.split(",") : null
  }
  
  let networkName = findMostRepeatedString(props.fetchedStrategies.map(x => x.networks).flat()) as NetworkName
  if (searchParams.get("network")) {
    try {
      networkName = getNetworkNameFromChainId(Number(searchParams.get("network")))
    } catch (e) {
      // don't do anything, since the user might pass an unsupported network id through URL
    }
  }

  const [selectedNetwork, setSelectedNetwork] = useState<NetworkName>(networkName);
  const {
    execute: executeDonation,
    getBalance,
    getAllowance,
    approve,
  } = useDonation();
  const strategiesHandler = useStrategiesHandler(
    props.fetchedStrategies,
    amount,
    selectedNetwork,
    overwrites
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
  
  const { strategies, handleAmountUpdate, handleNetworkUpdate } = strategiesHandler;
  const selectedStrategiesLength = strategies.filter((x) => x.selected).length;
  const tweetUrl = useTweetShare(props.runId, strategies, selectedNetwork, props.prompt)
  const [isFundingPending, setIsFundingPending] = useState(false);
  
  useEffect(() => {
    setBalance((currentBalance) => {
      if (currentBalance) return null;
    });
  }, [selectedToken]);

  async function connect() {
    await connectWallet();
  }

  const executeTransaction = async () => {
    setIsFundingPending(true);

    try {
      if (selectedStrategiesLength === 0 || amount === "0") return;

      const currentNetworkId = SUPPORTED_NETWORKS[selectedNetwork];
      if (connectedChain && currentNetworkId !== +connectedChain.id) {
        await setChain({ chainId: `0x${currentNetworkId.toString(16)}` });
        setIsFundingPending(false);
        return;
      }

      if (!selectedToken || !wallet) {
        setIsFundingPending(false);
        return;
      };


      const balance = await getBalance(wallet, selectedToken);

      if (+amount >= +balance) {
        setBalance(balance);
        setIsFundingPending(false);
        return;
      }

      const allowance = await getAllowance(
        wallet,
        selectedToken,
        selectedNetwork
      );

      const donations = strategies
        .filter((x) => x.selected)
        .map((strategy) => {
          const networkIndex = strategy.networks.indexOf(selectedNetwork);
          return {
            amount: strategy.amount as string,
            description: strategy.project.description as string,
            title: strategy.project.title as string,
            recipient: strategy.recipients[networkIndex],
          };
        });
      
      const amounts = donations
        .map((x) => Number(x.amount))
        .filter((x) => x > 0);

      const totalAmount = amounts.reduce((a, b) => a + b, 0);

      if (+allowance < totalAmount) {
        await approve(wallet, selectedToken, totalAmount, selectedNetwork);
      }

      await executeDonation(
        selectedNetwork,
        selectedToken,
        donations.map((x) => x.recipient),
        amounts
      );

      setShowSuccessModal(true);
    } catch (e: any) {
      throw e;
    } finally {
      setIsFundingPending(false);
    }
  };

  async function regenerateStrat(prompt: string) {
    setIsRegenerating(true);
    if (!session) {
      throw new Error("User needs to have a session");
    }
    const response = await startRun(prompt, session.supabaseAccessToken);
    router.push(`/s/${response.runId}`);
    setIsRegenerating(false);
  }

  return (
    <>
      <div className='flex justify-center py-10 px-6 flex-grow flex-column'>
        <div className='flex flex-col mx-auto max-w-wrapper w-full space-y-4'>
          <TextField
            label='Results for'
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !!currentPrompt) {
                regenerateStrat(currentPrompt);
              }
            }}
            rightAdornment={
              <ChatInputButton
                running={isRegenerating}
                message={currentPrompt}
                regenerate
                handleSend={async () => {
                  if (currentPrompt) {
                    await regenerateStrat(currentPrompt);
                  }
                }}
              />
            }
          />
          <div className='p-8 bg-indigo-25 rounded-2xl border-2 border-indigo-200 border-dashed'>
            <p>
              Take a moment to review the allocation strategy and make
              adjustments before moving forward with your donation. Be sure to
              select a network you have funds on.
            </p>
          </div>
          <div className='space-y-2'>
            <div className='space-y-6 bg-indigo-50 rounded-3xl border-2 border-indigo-200 p-2 md:p-4'>
              <div className='space-y-2'>
                <div className='flex flex-wrap gap-2 items-center'>
                  <div className='text-xs text-subdued'>Filter by: </div>
                  <div>
                    <Dropdown
                      items={props.networks.filter((n) => n !== selectedNetwork).map(n => ({ value: n, image: `/chains/${n}.png` }))}
                      field={{ value: selectedNetwork, image: `/chains/${selectedNetwork}.png` }}
                      onChange={(newValue) => {
                        if (props.networks.length === 1) {
                          return;
                        }
                        handleNetworkUpdate(newValue as NetworkName);
                        setSelectedNetwork(newValue as NetworkName);
                      }}
                    />
                  </div>
                </div>
              </div>
              <StrategyTable {...strategiesHandler} network={selectedNetwork} />
              <div className='flex justify-between items-center w-full space-x-4 pt-4 border-t-2 border-indigo-100'>
                {wallet ? (
                  <>
                    <div className='max-w-md w-full'>
                      <TextField
                        className='h-12'
                        placeholder='Enter the amount you want to fund'
                        error={
                          balance && +balance < +amount
                            ? `Insufficient ${selectedToken.name} balance`
                            : ""
                        }
                        rightAdornment={
                          <Dropdown
                            items={tokens
                              .filter((x) => x.name !== selectedToken.name)
                              .map((x) => ({ value : x.name }))}
                            field={{ value: selectedToken.name }}
                            onChange={async (newToken) =>
                              await updateToken(newToken)
                            }
                          />
                        }
                        value={amount !== "0" ? amount : undefined}
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
                          if (newValue !== "0") {
                            handleAmountUpdate(newValue);
                          }
                          if (balance) {
                            setBalance(null);
                          }
                        }}
                      />
                    </div>
                    <Button
                      disabled={
                        selectedStrategiesLength === 0 || amount === "0" || amount === "" || isFundingPending
                      }
                      onClick={executeTransaction}>
                      {isFundingPending ? (
                        <>
                          <div>Pending</div>
                          <LoadingCircle hideText color='white' />
                        </>
                      ) : (
                        <>
                          <div>{`Fund ${selectedStrategiesLength} ${pluralize(
                            ["Project", "Projects"],
                            selectedStrategiesLength
                          )}`}</div>
                          <ArrowRight weight='bold' size={16} />
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className='flex flex-col w-full md:w-auto mb-2 md:mb-0'>
                      <div className='text-sm sm:text-lg font-semibold'>
                        {`${selectedStrategiesLength} ${
                          props.prompt
                        } ${pluralize(
                          ["project", "projects"],
                          selectedStrategiesLength
                        )}`}
                      </div>
                      <div className='text-xs text-subdued'>
                        {`Connect your wallet to fund ${pluralize(
                          ["this project", "these projects"],
                          selectedStrategiesLength
                        )}`}
                      </div>
                    </div>
                    <Button onClick={() => connect()}>
                      <div>Connect</div>
                      <ArrowRight weight='bold' size={16} />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className='flex justify-end'>
              <div className='flex items-center space-x-1 text-[12px] text-subdued'>
                <div>Project data sourced from</div>
                <a
                  href='https://gitcoin.co'
                  target='_blank'
                  rel='noredirect'
                  className='underline font-bold flex items-center space-x-0.5 group/gitcoin-link'>
                  <Image
                    src='/gitcoin-logo.svg'
                    alt='Gitcoin Logo'
                    width={12}
                    height={12}
                    className='group-hover/gitcoin-link:opacity-60'
                  />
                  <div>Gitcoin</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button
        onClick={() => window.open(tweetUrl, "__blank")}
        className='!bg-white hover:!bg-indigo-50 !text-indigo-600 !fixed !bottom-0 !right-0 !m-4 !p-3 sm:py-2 sm:px-6'
        type='submit'>
        <div className='max-sm:!hidden'>Share this strategy</div>
        <XLogo size={16} className='text-[currentColor] max-sm:!ml-0' />
      </Button>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={
          <div className='text-xl text-center'>
            {`You just funded ${selectedStrategiesLength} ${pluralize(
              ["Project", "Projects"],
              selectedStrategiesLength
            )}!`}
          </div>
        }
        onShare={() => window.open(tweetUrl, "__blank")}
      />
    </>
  );
}
