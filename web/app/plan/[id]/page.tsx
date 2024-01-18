import Plan from "@/components/Plan";

export default function PlanPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <Plan id={id} />
  );
}
