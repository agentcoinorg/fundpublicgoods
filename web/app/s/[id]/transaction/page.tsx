import FundingReview from "@/components/FundingReview";

export default async function Page({ params }: { params: { id: string } }) {
  return <FundingReview id={params.id} />;
}
