"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Tables } from "@/supabase/dbTypes";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import LoadingCircle from "@/components/LoadingCircle";
import ProgressBar from "@/components/ProgressBar";
import useSession from "@/hooks/useSession";
import {
  UNSTARTED_TEXTS,
  LOADING_TEXTS,
  STEPS_ORDER,
  STEP_TIME_ESTS,
} from "@/utils/logs";

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
  const { data: session } = useSession();
  const supabase = createSupabaseBrowserClient(
    session?.supabaseAccessToken ?? ""
  );
  const router = useRouter();

  const sortedLogsWithSteps = props.logs.sort((a, b) => {
    return STEPS_ORDER[a.step_name] - STEPS_ORDER[b.step_name];
  });

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
          router.refresh();
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
    const lastStep = sortedLogsWithSteps[totalSteps - 1];
    if (!!lastStep) {
      currentStep = lastStep.status === "COMPLETED" ? totalSteps + 1 : 0;
    } else {
      currentStep = 0;
    }
  }

  return (
    <div className='space-y-2'>
      <div className='text-subdued text-[10px]'>{`~${"5:23"} remaining`}</div>
      <ProgressBar
        stepTimes={stepTimes}
        curStep={currentStep}
        className={"!stroke-indigo-500 text-indigo-200 rounded-lg"}
      />
      {sortedLogsWithSteps
        .filter((log) => log.status !== "NOT_STARTED")
        .map((log) => (
          <div className='flex items-center space-x-2' key={log.id}>
            {log.status === "IN_PROGRESS" ? (
              <LoadingCircle
                hideText={true}
                className='!stroke-indigo-500 text-indigo-200'
              />
            ) : log.status === "COMPLETED" ? (
              <div
                className='text-sm px-0.5 h-4 flex items-center'
                role='img'
                aria-label='check mark symbol'>
                ✅
              </div>
            ) : (
              <div
                className='text-sm px-0.5 h-4 flex items-center'
                role='img'
                aria-label='no entry'>
                ⛔️
              </div>
            )}
            <p
              className={clsx(
                "text-xs leading-tight",
                log.status === "IN_PROGRESS"
                  ? "text-indigo-500"
                  : log.status === "COMPLETED"
                  ? "text-green-600"
                  : "text-red-500"
              )}>
              {getLogMessage(log)}
            </p>
          </div>
        ))}
    </div>
  );
}
