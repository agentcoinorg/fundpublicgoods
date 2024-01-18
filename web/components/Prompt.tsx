"use client";

import { ChangeEvent, useState } from "react";
import TextField from "./TextField";
import ChatInputButton from "./ChatInputButton";
import SparkleIcon from "@/public/sparkle-icon.svg";
import Image from "next/image";
import { triggerResearch } from "@/app/actions";

export default function Prompt() {
  const [prompt, setPrompt] = useState<string>();
  const [isWaiting, setIsWaiting] = useState(false);

  const sendPrompt = async () => {
    console.log("he")
    await triggerResearch();
    // await fetch(process.env.WORKER_URL)
  };

  const suggestions = [
    "Ethereum infrastructure",
    "Zero Knowledge Technology",
    "Environmental initiatives",
    "DAO Tooling",
    "Decentalized Finance",
    "Open Source Software",
    "Multichain ecosystem",
  ];

  return (
    <div className="w-2/5">
      <div className="flex flex-wrap w-full justify-center pb-7">
        <div className="text-3xl">Fund public goods like magic.</div>
        <div className="mt-1">
          <Image alt="Sparkle" priority src={SparkleIcon} />
        </div>
      </div>
      <TextField
        placeholder="What would you like to fund?"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setPrompt(event.target.value);
        }}
        onKeyDown={() => {}}
        rightAdornment={
          <ChatInputButton
            running={isWaiting}
            message={prompt || ""}
            handleSend={sendPrompt}
          />
        }
      />
      <div className="flex pt-6 justify-center">
        What are you interested in funding?
      </div>
      <div className="flex flex-wrap justify-evenly text-sm">
        {suggestions.map((suggestion, index) => (
          <div key={index}>
            <button
              className="p-2 mt-3 border-2 border-spacing-2 rounded-lg border-zinc-900 text-zinc-400 hover:border-zinc-400"
              // onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
