"use server";

interface StartWorkerResponse {
  workerId: string;
  runId: string;
}

export const startWorker = async (
  prompt: string,
  supabaseAccessToken: string
): Promise<StartWorkerResponse> => {
  const response = await fetch(`${process.env.WORKERS_URL}/api/workers`, {
    cache: "no-cache",
    method: "POST",
    body: JSON.stringify({ prompt }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseAccessToken}`
    },
  });

  if (response.status !== 200) {
    throw Error(`Error starting new worker. Status: ${response.status}\nMessage: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.worker_id || !result.run_id) {
    throw new Error("Error starting new worker");
  }

  return {
    workerId: result.worker_id,
    runId: result.run_id,
  };
};

interface RegenerateRunResponse {
  runId: string;
}

export const regenerateStrategy = async (
  prompt: string,
  workerId: string,
  supabaseAccessToken: string
): Promise<RegenerateRunResponse> => {
  const response = await fetch(
    `${process.env.WORKERS_URL}/api/workers/${workerId}/runs`,
    {
      cache: "no-cache",
      method: "POST",
      body: JSON.stringify({ prompt }),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAccessToken}`
      },
    }
  );

  const result = await response.json();
  if (!result.run_id) {
    throw new Error("Error starting new worker");
  }

  return {
    runId: result.run_id,
  };
};
