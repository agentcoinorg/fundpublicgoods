"use server";

export const startWorker = async (prompt: string): Promise<string> => {
  const response = await fetch(`${process.env.WORKERS_URL}/api/start-worker`, {
    method: "POST",
    body: JSON.stringify({ prompt }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  if (!result.worker_id) {
    throw new Error("Error starting new worker");
  }
  return result.worker_id;
};
