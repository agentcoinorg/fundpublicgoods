"use server";

interface CreateFundingPlanArguments {
  amount: number;
  decimals: number;
  token: string;
  strategies: Array<{
    project_id: string;
    weight: number;
  }>;
}

export const createFundingEntries = async (
  runId: string,
  args: CreateFundingPlanArguments
) => {
  const response = await fetch(
    `${process.env.WORKERS_URL}/api/runs/${runId}/funding-entries`,
    {
      cache: "no-cache",
      method: "POST",
      body: JSON.stringify(args),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json();

  if (result.status !== 200) {
    throw new Error("Error creating funding entries");
  }
};
