"use client";

import { useState } from "react";
import { SparkleIcon } from "./Icons";
import { useRouter } from "next/navigation";
import LoadingCircle from "./LoadingCircle";
import PromptInput from "./PromptInput";
import useSession from "@/hooks/useSession";
import { startRun } from "@/app/actions";

const PROMPT_SUGESTIONS = [
  "Ethereum infrastructure",
  "Zero Knowledge Technology",
  "Environmental initiatives",
  "DAO Tooling",
  "Decentalized Finance",
  "Open Source Software",
  "Multichain ecosystem",
];

export default function Prompt() {
  const [prompt, setPrompt] = useState<string>("");
  const [isWaiting, setIsWaiting] = useState(false);
  const { data: session } = useSession();

  const router = useRouter();

  const sendPrompt = async (prompt: string) => {
    setIsWaiting(true);
    try {
      if (!session) {
        throw new Error("User needs to have a session");
      }
      const response = await startRun(prompt, session.supabaseAccessToken);
      router.push(`/s/${response.runId}`)
    } finally {
      setIsWaiting(false);
    }
  };

  return (
    <>
      <div className='mx-auto max-w-screen-md'>
        {isWaiting ? (
          <div className='w-full'>
            <div className='flex flex-col justify-center items-center gap-2'>
              <LoadingCircle className='w-[40px] h-[40px]' />
              <div className='flex text-md text-center'>Loading</div>
            </div>
          </div>
        ) : (
          <div className='w-full space-y-8'>
            <div className='flex flex-wrap w-full justify-center items-center space-x-2 group/prompt'>
              <h1 className='text-4xl font-bold text-shadow-lg text-shadow-primary-shadow'>
                Fund public goods like magic
              </h1>
              <SparkleIcon size={40} className='drop-shadow-sm' />
            </div>
            <div className='mx-auto max-w-screen-sm relative'>
              <PromptInput
                setPrompt={setPrompt}
                isWaiting={isWaiting}
                sendPrompt={sendPrompt}
                prompt={prompt}
                disabled={!session}
              />
            </div>
            <div className='space-y-4'>
              <div className='flex justify-center'>
                What are you interested in funding?
              </div>
              <div className='flex flex-wrap justify-center gap-3 text-sm'>
                {PROMPT_SUGESTIONS.map((suggestion, index) => (
                  <div key={index}>
                    <button
                      className='text-xs shadow-sm hover:shadow-md shadow-primary-shadow/20 px-3 py-2 leading-none border-2 border-spacing-2 rounded-full hover:bg-indigo-200 hover:border-indigo-400 hover:text-indigo-800 bg-indigo-500 border-indigo-600 text-indigo-50 transition-colors ease-in-out duration-300'
                      disabled={!session}
                      onClick={async () => {
                        setPrompt(suggestion);
                        await sendPrompt(suggestion);
                      }}>
                      {suggestion}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
