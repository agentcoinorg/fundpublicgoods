import RealtimeLogs from "@/components/RealtimeLogs";
import Strategy from "@/components/Strategy";
import { StrategiesWithProjects } from "@/hooks/useStrategiesHandler";
import TextField from "@/components/TextField";
import { getNetworkNameFromChainId } from "@/utils/ethereum";
import { checkIfFinished } from "@/utils/logs";
import { createSupabaseServerClientWithSession } from "@/utils/supabase-server";

export default async function StrategyPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createSupabaseServerClientWithSession();

  const run = await supabase
    .from("runs")
    .select(
      `
      id,
      created_at,
      prompt,
      strategy_entries(
        *,
        project:projects(
          *,
          applications(
            network,
            created_at,
            recipient
          )
        )
      ),
      logs(
        id,
        run_id,
        created_at,
        value,
        ended_at,
        status,
        step_name
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (run.error || !run.data) {
    console.error(run.error);
    throw Error(`Runs with id ${params.id} not found.`);
  }

  const strategyCreated = checkIfFinished(run.data.logs);
  if (!strategyCreated) {
    return (
      <div className="w-full flex justify-center h-full p-16">
        <div className="w-full max-w-3xl flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <TextField label="Results for" value={run.data.prompt} readOnly />
          </div>
          <div className="w-full h-[1px] bg-indigo-500" />
          <RealtimeLogs
            logs={run.data.logs}
            run={{ id: params.id, prompt: run.data.prompt }}
          />
        </div>
      </div>
    );
  }

  const data = run.data.strategy_entries as unknown as StrategiesWithProjects;

  const strategies = data
    .map((strategy) => {
      const lastApplication = strategy.project.applications
        .sort((a, b) => a.created_at - b.created_at)
        .slice(-1)[0];

      return {
        ...strategy,
        defaultWeight: strategy.weight as number,
        network: getNetworkNameFromChainId(lastApplication.network),
        recipient: lastApplication.recipient
      };
    })
    .sort((a, b) => (b.impact || 0) - (a.impact || 0));

  return (
    <Strategy
      fetchedStrategies={strategies}
      prompt={run.data.prompt}
      runId={run.data.id}
    />
  );
}
