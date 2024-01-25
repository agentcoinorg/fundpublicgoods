"use client"

import { Tables } from "@/supabase/dbTypes";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import router from "next/router";
import { useState, useEffect } from "react";

type LogWithStep = (Tables<"logs"> & { steps: Tables<"steps"> | null })

const UNSTARTED_TEXTS: Record<Tables<"steps">["name"], string> = {
  FETCH_PROJECTS: "Search for relevant projects",
  EVALUATE_PROJECTS: "Evaluate proof of impact",
  ANALYZE_FUNDING: "Analyze funding needs",
  SYNTHESIZE_RESULTS: "Synthesize results",
}

const LOADING_TEXTS: Record<Tables<"steps">["name"], string> = {
  FETCH_PROJECTS: "Searching for relevant projects",
  EVALUATE_PROJECTS: "Evaluating proof of impact",
  ANALYZE_FUNDING: "Analyzing funding needs",
  SYNTHESIZE_RESULTS: "Synthesizing results",
}

const getLogMessage = (log: LogWithStep) => {
  switch (log.status) {
    case "NOT_STARTED": return UNSTARTED_TEXTS[log.steps!.name]
    case "IN_PROGRESS": return LOADING_TEXTS[log.steps!.name]
    case "COMPLETED": return log.value ?? `Completed: ${UNSTARTED_TEXTS[log.steps!.name]}`
    case "ERRORED": return `Error while ${LOADING_TEXTS[log.steps!.name].toLowerCase()}`
  }
}

export default function RealtimeLogs(props: {
  logs: LogWithStep[]
  steps: Tables<"steps">[]
  run: {
    id: string;
    prompt: string;
  }
}) {
  const [logs, setLogs] = useState<LogWithStep[]>(props.logs)
  const supabase = createSupabaseBrowserClient();
  const runId = props.run
  
  const orderedSteps = props.steps.sort((a, b) => a.order - b.order)
  const lastStep = orderedSteps.slice(-1)[0]

  const sortedLogsWithSteps = logs.sort((a, b) => {
    return a.steps!.order - b.steps!.order
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
          filter: `run_id=eq.${runId}`,
        },
        (payload: { new: Tables<"logs"> }) => {
          const logsMinusTheUpdatedOne = logs.filter(log => log.id !== payload.new.id)
          const newWithStep = {
            ...payload.new,
            steps: props.steps.find(step => step.id === payload.new.step_id) ?? null
          }

          setLogs([...logsMinusTheUpdatedOne, newWithStep])

          if (payload.new.step_id === lastStep.id && payload.new.status === "COMPLETED") {
            router.push(`/${runId}/strategy`)
            return;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, runId]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <span>Results for:</span>
        <div className="flex">
          <span className="flex-1">{props.run.prompt}</span>
        </div>
      </div>
      <div>
        { sortedLogsWithSteps.map(logWithStep => (
          <div>
            { getLogMessage(logWithStep) }
          </div>
        )) }
      </div>
    </div>
  )
}