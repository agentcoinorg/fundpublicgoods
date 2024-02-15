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
  EVALUATE_PROJECTS: "Evaluate evidence of impact & funding needs",
  ANALYZE_FUNDING: "Assign numerical scores",
  SYNTHESIZE_RESULTS: "Synthesize results",
}

export const LOADING_TEXTS: Record<StepName, string> = {
  FETCH_PROJECTS: "Searching for relevant projects",
  EVALUATE_PROJECTS: "Evaluating evidence of impact & funding needs",
  ANALYZE_FUNDING: "Assigning numerical scores",
  SYNTHESIZE_RESULTS: "Synthesizing results",
}

export const COMPLETED_TEXTS: Record<StepName, string> = {
  FETCH_PROJECTS: "Found projects related",
  EVALUATE_PROJECTS: "Generated impact & funding needs report for projects",
  ANALYZE_FUNDING: "Computed smart rankings for projects",
  SYNTHESIZE_RESULTS: "Results generated",
}

export const STEPS_ORDER: Record<StepName, number> = {
  FETCH_PROJECTS: 1,
  EVALUATE_PROJECTS: 2,
  ANALYZE_FUNDING: 3,
  SYNTHESIZE_RESULTS: 4,
}

export const STEP_TIME_ESTS: Record<StepName, number> = {
  FETCH_PROJECTS: 30,
  EVALUATE_PROJECTS: 30,
  ANALYZE_FUNDING: 30,
  SYNTHESIZE_RESULTS: 10
}