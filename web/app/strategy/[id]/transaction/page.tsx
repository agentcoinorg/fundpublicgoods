import FundingReview from "@/components/FundingReview";
import { FundingEntry } from "@/components/FundingTable";
import { createSupabaseServerClient } from "@/utils/supabase-server";

export default async function Page({ params }: { params: { id: string } }) {
  const workerId = params.id;
  const supabase = createSupabaseServerClient();
  const run = await supabase
    .from("funding_entries_view")
    .select("*")
    .eq("worker_id", workerId);

  if (run.error || !run.data) {
    console.error(run.error);
    throw Error(`Runs with worker_id ${workerId} not found.`);
  }

  return <FundingReview entries={run.data as FundingEntry[]} />;
}
