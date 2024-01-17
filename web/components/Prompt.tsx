"use client";

import { ChangeEvent, useState } from "react";
import TextField from "./TextField";
import Button from "./Button";

export default function Prompt() {
  const [prompt, setPrompt] = useState<string>();
  const [proposedActions, setProposedActions] = useState();

  const sendPrompt = () => {};

  const suggestions = [
    "Climate change and environmental research",
    "IRL coworking and coliving spaces",
    "Blockchain scalability",
    "Zero-knowledge and privacy preserving technologies",
  ];

  return (
    <>
      <div className="w-2/5">
        <TextField
          placeholder="What do you want to fund?"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setPrompt(event.target.value);
          }}
        />
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
      <Button className="mt-4">Execute</Button>
    </>
  );
}
