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

export function redistributeWeightsProportionally(
  weights: number[],
  index: number,
  newWeight: number
): number[] {
  const currentWeight = weights[index];
  const weightDifference = newWeight - currentWeight;

  // Calculate the total weight available for redistribution, excluding the index being modified.
  let totalAvailableForRedistribution = weights.reduce(
    (acc, weight, idx) => acc + (idx !== index && weight > 0 ? weight : 0),
    0
  );

  // If the new weight is larger than the current, ensure we do not subtract more than what's available.
  let adjustmentPerWeight = 0;

  const validWeightsLength = weights.filter(
    (w, i) => i !== index && w > 0
  ).length;

  if (weightDifference > 0 && totalAvailableForRedistribution > 0) {
    // Calculate how much each redistributable weight should adjust, without going negative.
    adjustmentPerWeight =
      Math.min(weightDifference, totalAvailableForRedistribution) /
      validWeightsLength;
  }

  // Iterate on weights array and modify weights that are greater than 0
  let newWeights = weights.map((weight, idx) => {
    if (idx === index) {
      return newWeight; // Set the new weight for the specified index.
    } else if (weight > 0) {
      // Adjust weights proportionally, ensuring they do not go negative.
      let adjustedWeight = Math.max(0, weight - adjustmentPerWeight);
      return adjustedWeight;
    }
    return weight; // Leave zero weights as is.
  });

  // Recalculate the total to account for any rounding and adjustment errors.
  let totalNewWeights = newWeights.reduce((acc, curr) => acc + curr, 0);
  // Adjust for any rounding error to ensure the sum of weights equals 1.
  let roundingError = 1 - totalNewWeights;
  if (roundingError > 0) {
    newWeights = newWeights.map((weight, idx) =>
      idx !== index && weight > 0
        ? weight + roundingError / validWeightsLength
        : weight
    );
  }

  // Ensure the sum of all weights is 1 by applying final adjustments if necessary.
  totalNewWeights = newWeights.reduce((acc, curr) => acc + curr, 0);
  roundingError = 1 - totalNewWeights;

  // if rounding error is negative it means that total new weights is bigger than one
  let differenceAccumulator;
  if (roundingError < 0) {
    newWeights = newWeights.map((weight, i) => {
      if (i !== index && weight > 0 && roundingError != 0) {
        differenceAccumulator = weight + roundingError;
        if (differenceAccumulator < 0) {
          roundingError = differenceAccumulator;
          return 0;
        } else {
          roundingError = 0;
          return differenceAccumulator;
        }
      } else {
        return weight;
      }
    });
  }

  // if rounding error is positive it means that total weights is less than one
  if (roundingError > 0) {
    newWeights = newWeights.map((weight, i) => {
      if (i !== index && weight > 0 && roundingError != 0) {
        differenceAccumulator = weight - roundingError;
        if (differenceAccumulator > 0) {
          roundingError = 0;
          return differenceAccumulator;
        } else {
          roundingError = differenceAccumulator;
          return differenceAccumulator;
        }
      } else {
        return weight;
      }
    });
  }

  return newWeights.map((weight) => parseFloat(weight.toFixed(4)));
}
