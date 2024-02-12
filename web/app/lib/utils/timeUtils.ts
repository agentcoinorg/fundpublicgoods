export function calculateProgressAndTime(
  stepTimes: number[],
  currentStep: number
) {
  const totalTime = stepTimes.reduce((a, b) => a + b, 0);
  const elapsedTime = stepTimes
    .slice(0, currentStep)
    .reduce((a, b) => a + b, 0);
  const remainingTime = totalTime - elapsedTime;
  const progressPercentage = (elapsedTime / totalTime) * 100;

  return { progressPercentage, remainingTime };
}
