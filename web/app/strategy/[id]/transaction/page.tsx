import FundingReview from "@/components/FundingReview";
import { createSupabaseServerClient } from "@/utils/supabase-server";

export default async function Page({ params }: { params: { id: string } }) {
  const workerId = params.id;
  const supabase = createSupabaseServerClient();
  const run = await supabase
    .from("runs")
    .select(
      `
    id,
    funding_entries(
      amount,
      project:projects(*, 
        applications(recipient))
    )
  `
    )
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false })
    .single();

  if (run.error || !run.data) {
    console.error(run.error);
    throw Error(`Runs with worker_id ${workerId} not found.`);
  }

  const data = run.data.funding_entries;
  console.log(data)
  return <FundingReview />;
}
