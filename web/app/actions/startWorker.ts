"use server"

export const startWorker = async (prompt: string) => {
  const response = await fetch(`${process.env.WORKERS_URL}/api/start-worker`, {
    method: "POST",
    body: JSON.stringify({ prompt }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result = await response.json();
  console.log("HERERERE", result);
}
