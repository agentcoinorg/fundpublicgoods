export function distributeWeights(
  weights: number[],
  total: number,
  decimals: number
): number[] {
  // Calculate initial amounts
  let amounts = weights.map((weight) => weight * total);

  // Round amounts to two decimals and calculate the sum of these amounts
  let roundedAmounts = amounts.map((amount) =>
    parseFloat(amount.toFixed(decimals))
  );
  let sumOfRoundedAmounts = roundedAmounts.reduce((a, b) => a + b, 0);

  // Calculate the remainder
  let remainder = total - sumOfRoundedAmounts;

  // Distribute the remainder
  // The idea here is to distribute the remainder starting from the largest fraction part
  while (Math.abs(remainder) >= 0.01) {
    let index = amounts.findIndex(
      (amount, idx) =>
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
  overwrites: number[],
  edit: {
    percentage: number;
    index: number;
  }
) {
  if (weights.length !== overwrites.length) {
    throw new Error("Weights and overwrites must have the same size");
  }

  // 1- Get the total of the current distribution based on selected weights
  const total = weights.reduce((acc, x) => {
    return acc + x;
  }, 0);

  // 2- Get the new weight of given percentage based on total
  const newWeight = (edit.percentage / 100) * total;
  let newOverwrites = [...overwrites];
  newOverwrites[edit.index] = newWeight;

  // 3- Get the diffence of the new weights, if its different to one we must decrease/increase other weights
  const totalOverwrite = newOverwrites.reduce((acc, x) => {
    return acc + x;
  }, 0);

  const deltaDifference = totalOverwrite - 100;
  // 4- If difference is greater than 0 we must decrease the other weights
  if (deltaDifference > 0) {
    const sumOfAllWeights = weights.reduce((acc, x, index) => {
      if (index === edit.index) {
        return acc;
      }
      return acc + x;
    }, 0);

    const decreaseRoots = weights.map((weight) => {
      return (weight / sumOfAllWeights) * deltaDifference;
    });

    newOverwrites = decreaseRoots.map((decreasePercentage, index) => {
      if (index === edit.index) {
        return edit.percentage;
      }
      return weights[index] - total * (decreasePercentage / 100);
    });
  }

  // 5- If difference is lesser than 0 we must decrease the other weights
  if (deltaDifference < 0) {
    const sumOfAllWeights = weights.reduce((acc, x, index) => {
      if (index === edit.index) {
        return acc;
      }
      return acc + x;
    }, 0);

    const increaseRoots = weights.map((weight) => {
      return (weight / sumOfAllWeights) * Math.abs(deltaDifference);
    });

    newOverwrites = increaseRoots.map((increasePercentage, index) => {
      if (index === edit.index) {
        return edit.percentage;
      }
      return weights[index] + total * (increasePercentage / 100);
    });
  }
  return newOverwrites;
}
