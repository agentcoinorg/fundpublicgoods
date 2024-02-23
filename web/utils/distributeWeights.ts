export function distributeWeights(weights: number[], total: number, decimals: number): number[] {
  // Calculate initial amounts
  let amounts = weights.map(weight => weight * total);

  // Round amounts to two decimals and calculate the sum of these amounts
  let roundedAmounts = amounts.map(amount => parseFloat(amount.toPrecision(decimals + 1)));
  let sumOfRoundedAmounts = roundedAmounts.reduce((a, b) => a + b, 0);

  // Calculate the remainder
  let remainder = total - sumOfRoundedAmounts;

  // Distribute the remainder
  // The idea here is to distribute the remainder starting from the largest fraction part
  while (Math.abs(remainder) >= 0.01) {
      let index = amounts.findIndex((amount, idx) => 
          roundedAmounts[idx] < amount && 
          (remainder > 0 || roundedAmounts[idx] > 0)
      );

      if (index === -1) {
          break; // Break if no suitable item is found
      }

      if (remainder > 0) {
          roundedAmounts[index] += 0.01;
          remainder -= 0.01;
      } else {
          roundedAmounts[index] -= 0.01;
          remainder += 0.01;
      }

      roundedAmounts[index] = parseFloat(roundedAmounts[index].toPrecision(decimals));
  }

  return roundedAmounts;
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

  const newWeights =  defaultWeights.map((weight, index) => {
    return !selectedWeights[index] ? 0 : (weight * 100) / denominator;
  })

  return newWeights.map(w => Number(w.toPrecision(4)))
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

    // If there is any weight set to zero it means that we can not take
    // as base the default weights, so we work with the total and percentages only
    const amountToUpdate = total * percentage;
    return amountToUpdate / (total / 100);
  });

  return newOverwrites;
}