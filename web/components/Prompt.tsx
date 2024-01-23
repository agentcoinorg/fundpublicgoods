"use client";

import { ChangeEvent, useEffect, useState } from "react";
import TextField from "./TextField";
import ChatInputButton from "./ChatInputButton";
import SparkleIcon from "@/public/sparkle-icon.svg";
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

  return status ? (
    <div className="w-2/5">
      <div className="flex flex-col justify-center items-center gap-2">
        <LoadingCircle className="w-[40px] h-[40px] ml-10" />
        <div className="flex text-md pl-12 text-center">{status}</div>
      </div>
    </div>
  ) : (
    <div className="w-2/5 flex flex-col items-center gap-8">
      <div className="flex flex-wrap w-full justify-center">
        <div className="text-3xl">Fund public goods like magic.</div>
        <div className="mt-1">
          <Image alt="Sparkle" priority src={SparkleIcon} />
        </div>
      </div>
      <TextField
        className="h-16 bg-background-input/50"
        value={prompt}
        placeholder="What would you like to fund?"
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
      <div className="flex justify-center">
        What are you interested in funding?
      </div>
      <div className="flex flex-wrap justify-center text-sm gap-3">
        {PROMPT_SUGESTIONS.map((suggestion, index) => (
          <div key={index}>
            <button
              className="p-2 border rounded-md bg-background-main/30 border-zinc-900 text-zinc-400 hover:border-zinc-400"
              onClick={async () => {
                setPrompt(suggestion);
                await sendPrompt(suggestion);
              }}
            >
              {suggestion}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
