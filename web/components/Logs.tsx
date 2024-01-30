"use server"

import { createSupabaseServerClientWithSession } from "@/utils/supabase-server";
import RealtimeLogs from "./RealtimeLogs";

export default async function Logs(props: { runId: string }) {
  const supabase = await createSupabaseServerClientWithSession()

  const { data: run } = await supabase.from('runs').select(`
    id,
    prompt,
    logs(
      id,
      run_id,
      created_at,
      value,
      ended_at,
      status,
      step_name
    )
  `).eq("id", props.runId).single()

  if (!run) {
    throw new Error(`Run with ID '${props.runId}' not found`)
  }

  return (
    <RealtimeLogs logs={run.logs} run={run} />
  )
}