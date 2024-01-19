"use server";

interface StartWorkerResponse {
  workerId: string;
  runId: string;
}

export const startWorker = async (prompt: string): Promise<StartWorkerResponse> => {
  const response = await fetch(`${process.env.WORKERS_URL}/api/workers`, {
    method: "POST",
    body: JSON.stringify({ prompt }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await response.json();
  if (!result.worker_id || !result.run_id) {
    throw new Error("Error starting new worker");
  }

  return {
    workerId: result.worker_id,
    runId: result.run_id
  };
};
