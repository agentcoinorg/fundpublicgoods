import React from "react";
import Prompt from "@/components/Prompt";
import { EXAMPLE_PROMPTS } from "@/utils/examplePrompts";

export const dynamic = "force-dynamic";

function generateUniqueIndexes(arrayLength: number, count: number): number[] {
  if (arrayLength < count) {
    throw new Error(
      "Array does not have enough elements to generate unique indexes."
    );
  }

  const uniqueIndexes = new Set<number>();

  while (uniqueIndexes.size < count) {
    const randomIndex = Math.floor(Math.random() * arrayLength);
    uniqueIndexes.add(randomIndex);
  }

  return Array.from(uniqueIndexes);
}

export default function HomePage() {
  const promptIdxs = generateUniqueIndexes(EXAMPLE_PROMPTS.length, 6);

  return <Prompt promptIdxs={promptIdxs} />;
}
