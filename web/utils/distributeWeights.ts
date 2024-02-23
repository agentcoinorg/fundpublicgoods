// Weights should be less than 1
export function distributeAmounts(weights: number[], total: number, decimals: number = 2): number[] {
  // Calculate initial amounts
  let amounts = weights.map(weight => weight * total);

  // Round amounts to two decimals and calculate the sum of these amounts
  let roundedAmounts = amounts.map(amount => parseFloat(amount.toFixed(decimals)));
  let sumOfRoundedAmounts = roundedAmounts.reduce((a, b) => a + b, 0);

  // Calculate the remainder
  let remainder = +(total - sumOfRoundedAmounts).toFixed(decimals);

  const remainderIncrement = +(1 / Math.pow(10, decimals)).toFixed(decimals);

  // Distribute the remainder
  // The idea here is to distribute the remainder starting from the largest fraction part
  while (Math.abs(remainder) >= remainderIncrement) {
    let index: number;
    if (remainder > 0) {
        // Find an index to increment
        index = amounts.findIndex((amount, idx) => 
            roundedAmounts[idx] < amount
        );
    } else {
        // Find an index to decrement, ensuring we don't go below the amount that the weight would dictate
        index = roundedAmounts.findIndex((roundedAmount, idx) => 
            roundedAmount > weights[idx] * total && 
            roundedAmount > 0
        );
    }

    if (index === -1) {
        break; // Break if no suitable item is found
    }

    // Adjust the roundedAmount and remainder accordingly
    if (remainder > 0) {
        roundedAmounts[index] += remainderIncrement;
        remainder -= remainderIncrement;
    } else {
        roundedAmounts[index] -= remainderIncrement;
        remainder += remainderIncrement;
    }

    // Ensure values are correctly rounded to avoid floating point issues
    remainder = +remainder.toFixed(decimals);
    roundedAmounts[index] = parseFloat(roundedAmounts[index].toFixed(decimals));
  }

  return roundedAmounts;
}

export function redistributeAmounts(
  defaultWeights: number[],
  selectedWeights: boolean[]
): number[] {
  if (selectedWeights.length !== defaultWeights.length) {
    throw Error("Selected weights and default weights must have the same size");
  }

  const denominator = defaultWeights.reduce((acc, x, index) => {
    return selectedWeights[index] ? acc + +(x * 100).toFixed(2) : acc;
  }, 0);

  return defaultWeights.map((weight, index) => {
    return !selectedWeights[index] ? 0 : +(weight * 100 / denominator).toFixed(4);
  });
}

export function applyUserWeight(
  weights: number[], // Weights are ratios, e.g [87, 85, 83]
  overwrites: number[], // Overwrites are percentages, e.g [39.89, 37.16, 0]
) {
  // Get the indexes of the weights to edit
  // These are the indexes of the overwrites that are 0
  const indexesToEdit = overwrites.map((x, i) => {
    if (x === 0) {
      return i;
    } else {
      return undefined;
    }
  }).filter((x) => x !== undefined) as number[];

  // Get the weights to edit based on the indexes
  const weightsToEdit = indexesToEdit.map((i) => weights[i]);

  // Get the total remaining amount that the user has not distributed
  const totalRemainingUnrounded = 100 - +overwrites.reduce((acc, x) => acc + x, 0).toFixed(2);
  const totalRemaining = +totalRemainingUnrounded.toFixed(2);
  
  // Get the total of weight so that we can calculate the percentages based on the ratios
  const currentTotal = weightsToEdit.reduce((acc, x) => acc + x, 0);
  let percentagesToEdit = weightsToEdit.map((x) => +(x / currentTotal).toFixed(2));

  // Distribute the remaining amount (from 100) to the weights to edit
  const newPercentages = distributeAmounts(percentagesToEdit, totalRemaining);

  // Merge the new percentages with the overwrites, e.g. [23.95] + [39.89, 37.16, 0] -> [39.89, 37.16, 23.95]
  const newWeights = overwrites.map(x => {
    if (x === 0) {
      return newPercentages.shift() as number;
    } else {
      return x;
    }
  });

  return newWeights;
}