"use server";

interface StartRunResponse {
  runId: string;
}

export const startRun = async (
  prompt: string,
  supabaseAccessToken: string
): Promise<StartRunResponse> => {
  const response = await fetch(`${process.env.WORKERS_URL}/api/runs`, {
    cache: "no-cache",
    method: "POST",
    body: JSON.stringify({ prompt }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseAccessToken}`
    },
  });

  if (response.status !== 200) {
    throw Error(`Error starting new run. Status: ${response.status}\nMessage: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.run_id) {
    throw new Error("Error starting new run");
  }

  return {
    runId: result.run_id,
  };
};
