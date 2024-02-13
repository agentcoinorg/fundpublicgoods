import React from "react";
import Prompt from "@/components/Prompt";
import { EXAMPLE_PROMPTS } from "@/utils/examplePrompts";

export default async function HomePage() {
  let randomIndexOfExamplePrompts = Math.random() * EXAMPLE_PROMPTS.length;

  if (randomIndexOfExamplePrompts > EXAMPLE_PROMPTS.length - 5) {
    randomIndexOfExamplePrompts -= 5;
  }

  if (randomIndexOfExamplePrompts < 5) {
    randomIndexOfExamplePrompts += 5;
  }

  return (
    <div className="flex h-full items-center justify-center">
      <Prompt promptsIndex={randomIndexOfExamplePrompts} />
    </div>
  );
}
