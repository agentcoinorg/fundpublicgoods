import Logs from "@/components/Logs";

export default function ProgressPage(props: {
  params: {
    runId: string
  }
}) {
  return (
    <div className="max-w-3xl w-full flex justify-center">
      <Logs runId={props.params.runId} />
    </div>
  )
}