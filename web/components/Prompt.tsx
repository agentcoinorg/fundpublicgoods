"use client";

import { useState } from "react";
import { SparkleIcon } from "./Icons";
import { useRouter } from "next/navigation";
import PromptInput from "./PromptInput";
import useSession from "@/hooks/useSession";
import { startRun } from "@/app/actions";
import clsx from "clsx";
import { EXAMPLE_PROMPTS } from "@/utils/examplePrompts";

export default function Prompt({ promptIdxs }: { promptIdxs: number[] }) {
  const [prompt, setPrompt] = useState<string>("");
  const [isWaiting, setIsWaiting] = useState(false);
  const { data: session } = useSession();

  const router = useRouter();

  console.log(session)
  const sendPrompt = async (prompt: string) => {
    setIsWaiting(true);
    try {
      if (!session) {
        throw new Error("User needs to have a session");
      }
      const response = await startRun(prompt, session.supabaseAccessToken);
      router.push(`/s/${response.runId}`);
    } catch (e) {
      setIsWaiting(false);
      throw e;
    }
  };

  return (
    <>
      <div className="mx-auto max-w-screen-lg">
        <div className="w-full space-y-8 px-6 flex flex-col items-center">
          <div className="space-y-4 flex flex-col items-center w-full">
            <h1
              className={clsx(
                "text-5xl font-bold text-shadow-lg text-center text-shadow-primary-shadow leading-[1.35] bg-clip-text cursor-default group/prompt inline-block",
                "hover:bg-gradient-to-r hover:from-indigo-300 hover:via-blue-600 hover:to-indigo-300 hover:inline-block hover:text-transparent hover:animate-gradientText"
              )}
            >
              Fund public goods like magic
              <SparkleIcon
                size={40}
                className="ml-2 inline-block drop-shadow-sm"
              />
            </h1>
            <div className="w-10/12 relative">
              <PromptInput
                setPrompt={setPrompt}
                isWaiting={isWaiting}
                sendPrompt={sendPrompt}
                prompt={prompt}
                disabled={!session}
              />
            </div>
          </div>
          <div className="space-y-4 w-10/12">
            <div className="flex justify-center">
              Some ideas:
            </div>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              {promptIdxs.map((index) => {
                const prompt = EXAMPLE_PROMPTS[index];
                return (
                  <div key={index}>
                    <button
                      className="text-xs shadow-sm hover:shadow-md shadow-primary-shadow/20 px-3 py-2 leading-none border-2 border-spacing-2 rounded-full hover:bg-indigo-200 hover:border-indigo-400 hover:text-indigo-800 bg-indigo-500 border-indigo-600 text-indigo-50 transition-colors ease-in-out duration-300"
                      disabled={!session}
                      onClick={async () => {
                        setPrompt(prompt);
                        await sendPrompt(prompt);
                      }}
                    >
                      {prompt}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
