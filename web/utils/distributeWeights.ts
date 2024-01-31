export function distributeWeights(weights: number[], total: number, decimals: number): number[] {
  // Calculate initial amounts
  let amounts = weights.map(weight => weight * total);

  // Round amounts to two decimals and calculate the sum of these amounts
  let roundedAmounts = amounts.map(amount => parseFloat(amount.toFixed(decimals)));
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

      roundedAmounts[index] = parseFloat(roundedAmounts[index].toFixed(decimals));
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

  return defaultWeights.map((weight, index) => {
    return !selectedWeights[index] ? 0 : (weight * 100) / denominator;
  });
}

export function applyUserWeight(
  weights: number[],
  edit: {
    percentage: number;
    index: number;
  }
) {
  // If percentage to edit is 100, automatically return other weights as zero
  if (edit.percentage === 100) {
    return weights.map((_, i) => {
      if (i === edit.index) {
        return 100
      }

      return 0
    })
  }

  // 1- Get the total of the current distribution based on selected weights
  const total = weights.reduce((acc, x) => {
    return acc + x;
  }, 0);

  // 2- Update weights collection with the new weight
  let newOverwrites = [...weights];
  newOverwrites[edit.index] = edit.percentage;

  // 3- Get the diffence of the new weights
  let totalOverwrite = newOverwrites.reduce((acc, x) => {
    return acc + x;
  }, 0);

  if (weights.some((w) => w === 0)) {
    totalOverwrite = edit.percentage;
  }

  const deltaDifference = totalOverwrite - 100;

  // 4- If there's a difference we must:
  // Calculate the sum of all weights (excluding the one being updated)
  // Get the percentage (differenceRoot) of how much should we decrease/increase
  // Update each weight (excluding the one being updated) with the given percentage
  const sumOfAllWeights = weights.reduce((acc, x, index) => {
    if (index === edit.index) {
      return acc;
    }
    return acc + x;
  }, 0);

  const differenceRoots = weights.map((weight) => {
    const percentage = (weight / sumOfAllWeights) * Math.abs(deltaDifference);
    return percentage / 100;
  });

  newOverwrites = differenceRoots.map((percentage, index) => {
    if (index === edit.index) {
      return edit.percentage;
    }

    if (weights[index] === 0) {
      return 0;
    }

    // If there is any weight set to zero it means that we can not take
    // as base the default weights, so we work with the total and percentages only
    const weight = weights.some((w) => w === 0) ? 0 : weights[index];
    if (deltaDifference > 0) {
      // 4.1- If difference is greater than 0 we must decrease the other weights
      const amountToUpdate = weight - total * percentage;
      return amountToUpdate / (total / 100);
    } else {
      // 4.2- If difference is lesser than 0 we must increase the other weights
      const amountToUpdate = weight + total * percentage;
      return amountToUpdate / (total / 100);
    }
  });

  console.log(newOverwrites.reduce((acc, x) => acc + x))
  return newOverwrites;
}
