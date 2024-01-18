"use client";

import { ChangeEvent, useEffect, useState } from "react";
import TextField from "./TextField";
import ChatInputButton from "./ChatInputButton";
import SparkleIcon from "@/public/sparkle-icon.svg";
import Image from "next/image";
import { startWorker } from "@/app/actions";

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
  const [prompt, setPrompt] = useState<string>();
  const [isWaiting, setIsWaiting] = useState(false);
  const [workerId, setWorkerId] = useState<string>();

  const sendPrompt = async (prompt: string) => {
    setIsWaiting(true);
    try {
      const workerId = await startWorker(prompt);
      setWorkerId(workerId);
    } finally {
      setIsWaiting(false);
    }
  };

  useEffect(() => {
    if (workerId) {
    }
  }, [workerId]);

  return (
    <div className="w-2/5">
      <div className="flex flex-wrap w-full justify-center pb-7">
        <div className="text-3xl">Fund public goods like magic.</div>
        <div className="mt-1">
          <Image alt="Sparkle" priority src={SparkleIcon} />
        </div>
      </div>
      <TextField
        value={prompt}
        placeholder="What would you like to fund?"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setPrompt(event.target.value);
        }}
        onKeyDown={async (event: React.KeyboardEvent) => {
          if (event.key === "Enter") {
            await sendPrompt(prompt as string);
          }
        }}
        rightAdornment={
          <ChatInputButton
            running={isWaiting}
            message={prompt || ""}
            handleSend={() => sendPrompt(prompt as string)}
          />
        }
      />
      <div className="flex pt-6 justify-center">
        What are you interested in funding?
      </div>
      <div className="flex flex-wrap justify-evenly text-sm">
        {PROMPT_SUGESTIONS.map((suggestion, index) => (
          <div key={index}>
            <button
              className="p-2 mt-3 border-2 border-spacing-2 rounded-lg border-zinc-900 text-zinc-400 hover:border-zinc-400"
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
