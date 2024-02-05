import Logs from "@/components/Logs";
import TextField from "@/components/TextField";
import { createSupabaseServerClientWithSession } from "@/utils/supabase-server";

async function PromptField(props: { runId: string }) {
  const supabase = await createSupabaseServerClientWithSession()

  const { data: run } = await supabase.from('runs').select(`
    id,
    prompt
  `).eq("id", props.runId).single()

  if (!run) {
    throw new Error(`Run with ID '${props.runId}' not found`)
  }
  
  return <TextField
    label='Results for'
    value={run.prompt}
    readOnly={true}
  />
}

export default function ProgressPage(props: {
  params: {
    id: string
  }
}) {
  return (
    <div className="w-full flex justify-center h-full p-16">
      <div className="w-full max-w-3xl flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <PromptField runId={props.params.id} />
        </div>
        <div className="w-full h-[1px] bg-indigo-500" />
        <Logs runId={props.params.id} />
      </div>
    </div>
  )
}