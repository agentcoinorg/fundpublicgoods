"use server"

import { createSupabaseServerClient } from "@/utils/supabase-server";
import RealtimeLogs from "./RealtimeLogs";

export default async function Logs(props: { runId: string }) {
  const supabase = createSupabaseServerClient()

  const { data: steps } = await supabase.from('steps').select(`
    id,
    name,
    order
  `)

  if (!steps) {
    throw new Error(`Error fetching steps`)
  }

  const { data: run } = await supabase.from('runs').select(`
    id,
    prompt,
    logs(
      id,
      run_id,
      created_at,
      value,
      step_id,
      ended_at,
      status,
      steps(
        id,
        name,
        order
      )
    )
  `).eq("id", props.runId).single()
  

  if (!run) {
    throw new Error(`Run with ID '${props.runId}' not found`)
  }

  return (
    <RealtimeLogs logs={run.logs} run={run} steps={steps} />
  )
}