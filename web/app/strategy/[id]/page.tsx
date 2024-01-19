import Strategy from "@/components/Strategy";

export default function StrategyPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <Strategy id={id} />
  );
}
