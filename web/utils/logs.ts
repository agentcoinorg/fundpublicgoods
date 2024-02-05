import { Tables } from "@/supabase/dbTypes";

export const checkIfFinished = (logs: Tables<"logs">[]) => {
  const sortedLogs = logs.sort((a, b) => {
    return STEPS_ORDER[a.step_name] - STEPS_ORDER[b.step_name];
  });
  const lastStep = sortedLogs.slice(-1)[0];

  if (!lastStep) {
    return false;
  }

  const isFinished =
    lastStep.status === "COMPLETED" &&
    lastStep.step_name === "SYNTHESIZE_RESULTS";

  return isFinished;
};

export type StepName = Tables<"logs">["step_name"];

export const UNSTARTED_TEXTS: Record<StepName, string> = {
  FETCH_PROJECTS: "Search for relevant projects",
  EVALUATE_PROJECTS: "Evaluate proof of impact",
  ANALYZE_FUNDING: "Analyze funding needs",
  SYNTHESIZE_RESULTS: "Synthesize results",
}

export const LOADING_TEXTS: Record<StepName, string> = {
  FETCH_PROJECTS: "Searching for relevant projects...",
  EVALUATE_PROJECTS: "Evaluating proof of impact...",
  ANALYZE_FUNDING: "Analyzing funding needs...",
  SYNTHESIZE_RESULTS: "Synthesizing results...",
}

export const STEPS_ORDER: Record<StepName, number> = {
  FETCH_PROJECTS: 1,
  EVALUATE_PROJECTS: 2,
  ANALYZE_FUNDING: 3,
  SYNTHESIZE_RESULTS: 4,
}

export const STEP_TIME_ESTS: Record<StepName, number> = {
  FETCH_PROJECTS: 60,
  EVALUATE_PROJECTS: 25,
  ANALYZE_FUNDING: 20,
  SYNTHESIZE_RESULTS: 15
}