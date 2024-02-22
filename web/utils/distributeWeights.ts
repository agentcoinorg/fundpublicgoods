export const WEIGHT_DECIMALS = 10000

export function distributeWeights(weights: number[], total: number, decimals: number): number[] {
  // Weight always come as decimals, convert it to integer with four decimals
  const intWeights = weights.map(w => Number((w * WEIGHT_DECIMALS).toPrecision(4)))
  // Calculate the amount based on total
  const amounts = intWeights.map(weight => weight * total);
  // Convert back to number with two decimals
  return amounts.map(amount => (amount / WEIGHT_DECIMALS) * 10 ** decimals);
}

export function redistributeWeights(
  defaultWeights: number[],
  selectedWeights: boolean[]
): number[] {
  if (selectedWeights.length !== defaultWeights.length) {
    throw Error("Selected weights and default weights must have the same size");
  }

  const denominator = defaultWeights.reduce((acc, x, index) => {
    return selectedWeights[index] ? acc + x * 100 : acc;
  }, 0);

  return defaultWeights.map((weight, index) => {
    return !selectedWeights[index] ? 0 : (weight * 100) / denominator;
  });
}

export function applyUserWeight(
  weights: number[],
  overwrites: number[],
  edit: {
    percentage: number;
    index: number;
  }
) {
  // If percentage to edit is 100, automatically return other weights as zero
  if (edit.percentage === 100) {
    return weights.map((_, i) => {
      if (i === edit.index) return 100;
      return 0;
    });
  }

  // 1- Get the total of the current distribution based on selected weights
  const total = weights.reduce((acc, x) => acc + x);

  // 2- Get the diffence of the new weights
  let totalOverwrite = overwrites.reduce((acc, x) => acc + x);
  const deltaDifference = totalOverwrite - 100;

  // 3- Calculate the sum of all weights (excluding the one being updated)
  const sumOfAllWeights = weights.reduce((acc, x, index) => {
    if (index === edit.index) return acc;
    if (overwrites[index] !== 0) return acc;
    
    return acc + x;
  }, 0);
  
  // 4- Get the percentage (differenceRoot) of how much should we decrease/increase
  const differenceRoots = weights.map((weight) => {
    const percentage = (weight / sumOfAllWeights) * Math.abs(deltaDifference);
    return percentage / 100;
  });

  // 5- Update each weight (excluding the one being updated) with the given percentage
  const newOverwrites = differenceRoots.map((percentage, index) => {
    if (index === edit.index) return edit.percentage;
    if (weights[index] === 0) return 0;
    if (overwrites[index] !== 0) return overwrites[index];

    const amountToUpdate = total * percentage;
    return amountToUpdate / (total / 100);
  });

  return newOverwrites.map((x) => Number(x.toPrecision(6)))
}