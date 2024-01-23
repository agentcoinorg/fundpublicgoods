"use client";

import { ChangeEvent, useEffect, useState } from "react";
import TextField from "./TextField";
import ChatInputButton from "./ChatInputButton";
import { SparkleIcon } from "./Icons";
import Image from "next/image";
import { startWorker } from "@/app/actions";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import { Tables } from "@/supabase/dbTypes";
import { useRouter } from "next/navigation";
import LoadingCircle from "./LoadingCircle";

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
  const [workerId, setWorkerId] = useState<string>();
  const [runId, setRunId] = useState<string>();
  const [status, setStatus] = useState<string>();

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const sendPrompt = async (prompt: string) => {
    setIsWaiting(true);
    try {
      const response = await startWorker(prompt);
      setWorkerId(response.workerId);
      setRunId(response.runId);
    } finally {
      setIsWaiting(false);
    }
  };

  useEffect(() => {
    if (runId) {
      const channel = supabase
        .channel("logs-added")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            table: "logs",
            schema: "public",
            filter: `run_id=eq.${runId}`,
          },
          (payload: { new: Tables<"logs"> }) => {
            if (payload.new.message === "STRATEGY_CREATED") {
              router.push(`strategy/${workerId}`);
              return;
            }
            setStatus(payload.new.message);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [workerId, supabase, runId, workerId]);

  return (
    <>
      <div className='mx-auto max-w-screen-md'>
        {status ? (
          <div className='w-full'>
            <div className='flex flex-col justify-center items-center gap-2'>
              <LoadingCircle className='w-[40px] h-[40px] ml-10' />
              <div className='flex text-md pl-12 text-center'>{status}</div>
            </div>
          </div>
        ) : (
          <div className='w-full space-y-8'>
            <div className='flex flex-wrap w-full justify-center items-center space-x-2'>
              <h1 className='text-4xl font-bold'>
                Fund public goods like magic
              </h1>
              <SparkleIcon size={40} className='drop-shadow-sm' />
            </div>
            <TextField
              value={prompt}
              placeholder='What would you like to fund?'
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setPrompt(event.target.value);
              }}
              onKeyDown={async (event: React.KeyboardEvent) => {
                if (prompt && event.key === "Enter") {
                  await sendPrompt(prompt);
                }
              }}
              rightAdornment={
                <ChatInputButton
                  running={isWaiting}
                  message={prompt || ""}
                  handleSend={async () => {
                    if (prompt) {
                      await sendPrompt(prompt);
                    }
                  }}
                />
              }
            />
            <div className='space-y-4'>
              <div className='flex justify-center'>
                What are you interested in funding?
              </div>
              <div className='flex flex-wrap justify-center gap-3 text-sm'>
                {PROMPT_SUGESTIONS.map((suggestion, index) => (
                  <div key={index}>
                    <button
                      className='px-4 py-2 border-2 border-spacing-2 rounded-full hover:bg-indigo-200 hover:border-indigo-400 hover:text-indigo-800 bg-indigo-500 border-indigo-600 text-indigo-50 transition-colors ease-in-out duration-300'
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
