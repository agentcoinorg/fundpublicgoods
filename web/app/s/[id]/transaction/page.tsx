import FundingReview from "@/components/FundingReview";
import { FundingEntry } from "@/components/FundingTable";

export default async function Page({ params }: { params: { id: string } }) {
  return <FundingReview id={params.id} />;
}
