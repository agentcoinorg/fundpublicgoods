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

export default function NoResultsFound(props: {
  prompt: string;
}) {
  const [currentPrompt, setCurrentPrompt] = useState<string>(props.prompt);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

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
            label={`No results found for ${props.prompt}, try again...`}
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
        </div>
      </div>
    </>
  )
}