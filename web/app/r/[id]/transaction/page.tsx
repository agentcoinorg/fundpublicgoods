import FundingReview from "@/components/FundingReview";
import { FundingEntry } from "@/components/FundingTable";
import { createSupabaseServerClient } from "@/utils/supabase-server";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const run = await supabase
    .from("funding_entries_view")
    .select("*")
    .eq("run_id", params.id);

  if (run.error || !run.data) {
    console.error(run.error);
    throw Error(`Run with ID ${params.id} not found.`);
  }

  return <FundingReview entries={run.data as FundingEntry[]} />;
}
