"use client"

import { Tables } from "@/supabase/dbTypes";
import { createSupabaseBrowserClient } from "@/utils/supabase-browser";
import router from "next/router";
import { useState, useEffect } from "react";

const UNSTARTED_TEXTS: Record<Tables<"logs">["step_name"], string> = {
  FETCH_PROJECTS: "Search for relevant projects",
  EVALUATE_PROJECTS: "Evaluate proof of impact",
  ANALYZE_FUNDING: "Analyze funding needs",
  SYNTHESIZE_RESULTS: "Synthesize results",
}

const LOADING_TEXTS: Record<Tables<"logs">["step_name"], string> = {
  FETCH_PROJECTS: "Searching for relevant projects",
  EVALUATE_PROJECTS: "Evaluating proof of impact",
  ANALYZE_FUNDING: "Analyzing funding needs",
  SYNTHESIZE_RESULTS: "Synthesizing results",
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
  const runId = props.run

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
          filter: `run_id=eq.${runId}`,
        },
        (payload: { new: Tables<"logs"> }) => {
          const logsMinusTheUpdatedOne = logs.filter(log => log.id !== payload.new.id)
          setLogs([...logsMinusTheUpdatedOne, payload.new])

          if (payload.new.step_name === "SYNTHESIZE_RESULTS" && payload.new.status === "COMPLETED") {
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