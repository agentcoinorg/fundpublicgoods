"use client"

import { Tables } from "@/supabase/dbTypes";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingCircle from "./LoadingCircle";

const UNSTARTED_TEXTS: Record<Tables<"logs">["step_name"], string> = {
  FETCH_PROJECTS: "Search for relevant projects",
  EVALUATE_PROJECTS: "Evaluate proof of impact",
  ANALYZE_FUNDING: "Analyze funding needs",
  SYNTHESIZE_RESULTS: "Synthesize results",
}

const LOADING_TEXTS: Record<Tables<"logs">["step_name"], string> = {
  FETCH_PROJECTS: "Searching for relevant projects...",
  EVALUATE_PROJECTS: "Evaluating proof of impact...",
  ANALYZE_FUNDING: "Analyzing funding needs...",
  SYNTHESIZE_RESULTS: "Synthesizing results...",
}

const STEPS_ORDER: Record<Tables<"logs">["step_name"], number> = {
  FETCH_PROJECTS: 1,
  EVALUATE_PROJECTS: 2,
  ANALYZE_FUNDING: 3,
  SYNTHESIZE_RESULTS: 4,
}

const getLogMessage = (log: Tables<"logs">) => {
  switch (log.status) {
    case "NOT_STARTED": return UNSTARTED_TEXTS[log.step_name]
    case "IN_PROGRESS": return LOADING_TEXTS[log.step_name]
    case "COMPLETED": return log.value ?? `Completed: ${UNSTARTED_TEXTS[log.step_name]}`
    case "ERRORED": return `Error while ${LOADING_TEXTS[log.step_name].toLowerCase()}`
  }
}

export default function RealtimeLogs(props: {
  logs: Tables<"logs">[]
  run: {
    id: string;
    prompt: string;
  }
}) {
  const [logs, setLogs] = useState<Tables<"logs">[]>(props.logs)
  const supabase = createSupabaseBrowserClient();
  const router = useRouter()

  const sortedLogsWithSteps = logs.sort((a, b) => {
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
        (payload: { new: Tables<"logs"> }) => {
          const updatedLogs = logs.map(log => {
            if (log.id === payload.new.id) {
              log = payload.new
            }

            return log
          })
          setLogs([...updatedLogs])

          if (payload.new.step_name === "SYNTHESIZE_RESULTS" && payload.new.status === "COMPLETED") {
            router.push(`/${props.run.id}/strategy`)
            return;
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, props.run.id]);

  return (
    <div className="w-full max-w-3xl flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p>Results for:</p>
        <div className="p-4 flex flex-nowrap items-center gap-1 border border-indigo-500 rounded-lg bg-indigo-500/50">
          <span className="flex-1">{props.run.prompt}</span>
        </div>
      </div>
      <div className="w-full h-[1px] bg-indigo-500" />
      <div className="flex flex-col gap-4">
        <p>Results:</p>
        <div className="flex flex-col gap-2">
          { sortedLogsWithSteps.map(log => (
            <div className={clsx(
              "p-4 flex flex-nowrap items-center gap-2 border border-indigo-500 rounded-lg bg-indigo-500/50",
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
    </div>
  )
}