"use client";

import { useEffect, useState } from "react";
import { SparkleIcon } from "./Icons";
import { useRouter, useSearchParams } from "next/navigation";
import PromptInput from "./PromptInput";
import useSession from "@/hooks/useSession";
import { startRun } from "@/app/actions";
import clsx from "clsx";
import { EXAMPLE_PROMPTS } from "@/utils/examplePrompts";
import { toast } from "react-toastify";
import IntroPopUp from "./IntroPopUp";

export default function Prompt({ promptIdxs }: { promptIdxs: number[] }) {
  const [prompt, setPrompt] = useState<string>("");
  const [showIntro, setShowIntro] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const router = useRouter();

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

  useEffect(() => {
    const notFoundId = searchParams.get("not-found");
    if (notFoundId) {
      toast.error(`Run with id ${notFoundId} does not exist`, {
        autoClose: 5000,
      });
      router.replace("/");
    }
  }, [searchParams, router]);

  useEffect(() => {
    const introClosed = localStorage.getItem("introClosed");
    if (!introClosed) {
      setShowIntro(true);
    }
  }, []);

  return (
    <div
      className={clsx(
        "flex h-full justify-center md:items-center md:pt-0",
        showIntro ? "items-start pt-8" : "items-center"
      )}>
      <div className='mx-auto max-w-screen-lg'>
        <div className='w-full space-y-8 px-6 flex flex-col items-center'>
          <div className='space-y-4 flex flex-col items-center w-full'>
            <h1
              className={clsx(
                "text-2xl md:text-5xl font-bold text-shadow-lg text-center text-shadow-primary-shadow !leading-[1.35] bg-clip-text cursor-default group/prompt inline-block",
                "hover:bg-gradient-to-r hover:from-indigo-300 hover:via-blue-600 hover:to-indigo-300 hover:inline-block hover:text-transparent hover:animate-gradientText"
              )}>
              Fund public goods like magic
              <SparkleIcon className='h-6 w-6 md:h-10 md:w-10 ml-1 inline-block drop-shadow-sm' />
            </h1>
            <div className='md:w-9/12 w-full relative'>
              <PromptInput
                setPrompt={setPrompt}
                isWaiting={isWaiting}
                sendPrompt={sendPrompt}
                prompt={prompt}
                disabled={!session}
              />
            </div>
          </div>
          <div className='space-y-4 w-10/12'>
            <div className='flex justify-center'>Some ideas:</div>
            <div className='flex flex-wrap justify-center gap-2 md:gap-3 text-sm md:w-10/12 mx-auto'>
              {promptIdxs.map((index) => {
                const prompt = EXAMPLE_PROMPTS[index];
                return (
                  <div key={index}>
                    <button
                      className='text-xs shadow-sm hover:shadow-md shadow-primary-shadow/20 px-3 py-2 leading-none border-2 border-spacing-2 rounded-full hover:bg-indigo-200 hover:border-indigo-400 hover:text-indigo-800 bg-indigo-500 border-indigo-600 text-indigo-50 transition-colors ease-in-out duration-300'
                      disabled={!session}
                      onClick={async () => {
                        setPrompt(prompt);
                        await sendPrompt(prompt);
                      }}>
                      {prompt}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {showIntro && <IntroPopUp setShowIntro={setShowIntro} />}
    </div>
  );
}
