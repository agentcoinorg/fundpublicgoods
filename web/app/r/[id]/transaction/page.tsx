import FundingReview from "@/components/FundingReview";
import { FundingEntry } from "@/components/FundingTable";
import { authOptions } from "@/utils/authOptions";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

export default async function Page({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error(`User needs to have a session`)
  }

  const supabase = createSupabaseServerClient(cookies(), session.supabaseAccessToken)

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
