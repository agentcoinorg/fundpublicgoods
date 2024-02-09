import Disclaimer from "@/components/Disclaimer";
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
      <div className="w-full flex flex-col items-center justify-between h-full pt-16 pb-8 px-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col gap-2">
            <TextField label="Results for" value={run.data.prompt} readOnly />
          </div>
          <RealtimeLogs
            logs={run.data.logs}
            run={{ id: params.id, prompt: run.data.prompt }}
          />
        </div>
        <Disclaimer />
      </div>
    );
  }

  const data = run.data.strategy_entries as unknown as StrategiesWithProjects;

  const recipientInformation = data.map((s) => {
    const lastApplication = s.project.applications
      .sort((a, b) => a.created_at - b.created_at)
      .slice(-1)[0];
    return {
      network: getNetworkNameFromChainId(lastApplication.network),
      recipient: lastApplication.recipient,
    };
  });
  const networksFromProjects = Array.from(
    new Set(recipientInformation.map((r) => r.network))
  );
  const strategies = data
    .map((strategy, i) => {
      return {
        ...strategy,
        defaultWeight: strategy.weight as number,
        network: recipientInformation[i].network,
        recipient: recipientInformation[i].recipient,
      };
    })
    .sort((a, b) => (b.smart_ranking || 0) - (a.smart_ranking || 0));
  return (
    <Strategy
      fetchedStrategies={strategies}
      prompt={run.data.prompt}
      runId={run.data.id}
      networks={networksFromProjects}
    />
  );
}
