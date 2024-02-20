"use client";

import { useState } from "react";
import TextField from "./TextField";
import { useRouter } from "next/navigation";
import useSession from "@/hooks/useSession";
import { startRun } from "@/app/actions";
import ChatInputButton from "./ChatInputButton";

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