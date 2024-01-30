"use client"

import { Tables } from "@/supabase/dbTypes";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingCircle from "./LoadingCircle";
import ProgressBar from "./ProgressBar";
import Button from "./Button";
import useSession from "@/hooks/useSession";

type StepName = Tables<"logs">["step_name"];

const UNSTARTED_TEXTS: Record<StepName, string> = {
  FETCH_PROJECTS: "Search for relevant projects",
  EVALUATE_PROJECTS: "Evaluate proof of impact",
  ANALYZE_FUNDING: "Analyze funding needs",
  SYNTHESIZE_RESULTS: "Synthesize results",
}

const LOADING_TEXTS: Record<StepName, string> = {
  FETCH_PROJECTS: "Searching for relevant projects...",
  EVALUATE_PROJECTS: "Evaluating proof of impact...",
  ANALYZE_FUNDING: "Analyzing funding needs...",
  SYNTHESIZE_RESULTS: "Synthesizing results...",
}

const STEPS_ORDER: Record<StepName, number> = {
  FETCH_PROJECTS: 1,
  EVALUATE_PROJECTS: 2,
  ANALYZE_FUNDING: 3,
  SYNTHESIZE_RESULTS: 4,
}

const STEP_TIME_ESTS: Record<StepName, number> = {
  FETCH_PROJECTS: 60,
  EVALUATE_PROJECTS: 25,
  ANALYZE_FUNDING: 20,
  SYNTHESIZE_RESULTS: 15
}

const getLogMessage = (log: Tables<"logs">) => {
  switch (log.status) {
    case "NOT_STARTED": return UNSTARTED_TEXTS[log.step_name]
    case "IN_PROGRESS": return LOADING_TEXTS[log.step_name]
    case "COMPLETED": return log.value ?? `Completed: ${UNSTARTED_TEXTS[log.step_name]}`
    case "ERRORED": return `Error while ${LOADING_TEXTS[log.step_name].toLowerCase()}`
  }
}

const checkIfFinished = (logs: Tables<"logs">[]) => {
  const sortedLogs = logs.sort((a, b) => {
    return STEPS_ORDER[a.step_name] - STEPS_ORDER[b.step_name]
  })
  const lastStep = sortedLogs.slice(-1)[0];

  if (!lastStep) {
    return false
  }

  const isFinished = lastStep.status === "COMPLETED" && lastStep.step_name === "SYNTHESIZE_RESULTS"

  return isFinished
}

export default function RealtimeLogs(props: {
  logs: Tables<"logs">[]
  run: {
    id: string;
    prompt: string;
  }
}) {
  const [logs, setLogs] = useState<Tables<"logs">[]>(props.logs)
  const { data: session } = useSession()
  const supabase = createSupabaseBrowserClient(session?.supabaseAccessToken ?? "");
  const router = useRouter()

  const sortedLogsWithSteps = logs.sort((a, b) => {
    return STEPS_ORDER[a.step_name] - STEPS_ORDER[b.step_name]
  })

  const isFinished = checkIfFinished(sortedLogsWithSteps)

  const navigateToStrategy = () => {
    router.push(`./`)
  }

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
        async () => {
          const response = await supabase.from("logs").select(`
            id,
            run_id,
            created_at,
            value,
            ended_at,
            status,
            step_name
          `).eq("run_id", props.run.id)
          const updatedLogs = response.data

          if (!updatedLogs) {
            throw new Error(`Logs for Run with ID '${props.run.id}' not found`)
          }
          
          setLogs([...updatedLogs])

          if (checkIfFinished(updatedLogs)) {
            navigateToStrategy()
            return;
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, props.run.id]);

  const totalSteps = sortedLogsWithSteps.length;
  const stepTimes = sortedLogsWithSteps.map((x) => STEP_TIME_ESTS[x.step_name]);
  let currentStep = sortedLogsWithSteps.findIndex((x) => x.status === "IN_PROGRESS");

  if (currentStep < 0) {
    currentStep = sortedLogsWithSteps[totalSteps - 1].status === "COMPLETED" ?
      totalSteps + 1 :
      0;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <p>Results:</p>
        <ProgressBar stepTimes={stepTimes} curStep={currentStep} className={"!stroke-indigo-500 text-indigo-200 rounded-lg"} />
        <div className="flex flex-col gap-2">
          { sortedLogsWithSteps.map(log => (
            <div key={log.id} className={clsx(
              "p-4 flex flex-nowrap items-center gap-2 border border-indigo-500 rounded-lg bg-indigo-500/50 cursor-pointer",
              log.status === "IN_PROGRESS" ? "text-indigo-50" : ""
            )}>
              { log.status === "IN_PROGRESS" ? <LoadingCircle hideText={true} className="!stroke-indigo-500 text-indigo-200" /> : <></>}
              <p className={clsx(
                "flex-1",
                log.status === "NOT_STARTED" ? "text-indigo-50" :
                log.status === "IN_PROGRESS" ? "text-indigo-500" :
                log.status === "COMPLETED" ? "text-indigo-800" :
                ""
              )}>{ getLogMessage(log) }</p>
              <div className="w-6 h-6"></div>
            </div>
          )) }
        </div>
      </div>
      <Button disabled={!isFinished} onClick={() => navigateToStrategy()}>
        View Results
      </Button>
    </>
  )
}