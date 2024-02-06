"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Tables } from "@/supabase/dbTypes";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import LoadingCircle from "@/components/LoadingCircle";
import ProgressBar from "@/components/ProgressBar";
import useSession from "@/hooks/useSession";
import { UNSTARTED_TEXTS, LOADING_TEXTS, STEPS_ORDER, STEP_TIME_ESTS } from "@/utils/logs";


const getLogMessage = (log: Tables<"logs">) => {
  switch (log.status) {
    case "NOT_STARTED":
      return UNSTARTED_TEXTS[log.step_name];
    case "IN_PROGRESS":
      return LOADING_TEXTS[log.step_name];
    case "COMPLETED":
      return log.value ?? `Completed: ${UNSTARTED_TEXTS[log.step_name]}`;
    case "ERRORED":
      return `Error while ${LOADING_TEXTS[log.step_name].toLowerCase()}`;
  }
};


export default function RealtimeLogs(props: {
  logs: Tables<"logs">[];
  run: {
    id: string;
    prompt: string;
  };
}) {
  const { data: session } = useSession()
  const supabase = createSupabaseBrowserClient(session?.supabaseAccessToken ?? "");
  const router = useRouter()

  const sortedLogsWithSteps = props.logs.sort((a, b) => {
    return STEPS_ORDER[a.step_name] - STEPS_ORDER[b.step_name]
  })

  useEffect(() => {
    const channel = supabase
      .channel("logs-added")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          table: "logs",
          schema: "public",
          filter: `run_id=eq.${props.run.id}`,
        },
        () => {
          router.refresh()
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, props.run.id]);

  const totalSteps = sortedLogsWithSteps.length;
  const stepTimes = sortedLogsWithSteps.map((x) => STEP_TIME_ESTS[x.step_name]);
  let currentStep = sortedLogsWithSteps.findIndex(
    (x) => x.status === "IN_PROGRESS"
  );

  if (currentStep < 0) {
    const lastStep = sortedLogsWithSteps[totalSteps - 1]
    if (!!lastStep) {
      currentStep = lastStep.status === "COMPLETED" ? totalSteps + 1 : 0;
    } else {
      currentStep = 0
    }
  }

  return (
    <>
      <div className='flex flex-col gap-4'>
        <ProgressBar
          stepTimes={stepTimes}
          curStep={currentStep}
          className={"!stroke-indigo-500 text-indigo-200 rounded-lg"}
        />
        <div className='flex flex-col gap-2'>
          {sortedLogsWithSteps.map((log) => (
            <div
              key={log.id}
              className={clsx(
                "p-4 flex flex-nowrap items-center gap-2 border rounded-lg",
                log.status === "NOT_STARTED"
                  ? "bg-indigo-500/30 border-indigo-400"
                  : "cursor-pointer border-indigo-500 bg-indigo-white hover:bg-indigo-200 shadow-md shadow-primary-shadow/20"
              )}>
              {log.status === "IN_PROGRESS" ? (
                <LoadingCircle
                  hideText={true}
                  className='!stroke-indigo-500 text-indigo-200'
                />
              ) : (
                <></>
              )}
              <p
                className={clsx(
                  "flex-1",
                  log.status === "NOT_STARTED"
                    ? "text-indigo-400"
                    : log.status === "IN_PROGRESS"
                    ? "text-indigo-500"
                    : log.status === "COMPLETED"
                    ? "text-indigo-800"
                    : ""
                )}>
                {getLogMessage(log)}
              </p>
              <div className='w-6 h-6'></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
