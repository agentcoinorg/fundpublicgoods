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
  // Filter out the index being modified and any zero weights for redistribution.
  const redistributableIndexes = weights
    .map((_, idx) => idx)
    .filter((idx) => idx !== index && weights[idx] > 0);
  const totalRedistributableWeight = weights.reduce(
    (acc, weight, idx) => (idx !== index && weight > 0 ? acc + weight : acc),
    0
  );

  // Calculate the adjustment per redistributable weight.
  let adjustmentPerWeight = 0;
  if (redistributableIndexes.length > 0 && totalRedistributableWeight > 0) {
    adjustmentPerWeight = weightDifference / redistributableIndexes.length;
  }

  // Apply adjustments.
  let newWeights = weights.map((weight, idx) => {
    if (idx === index) {
      return newWeight; // Set the new weight for the specified index.
    } else if (redistributableIndexes.includes(idx)) {
      // Calculate new weight, ensuring it does not go below zero.
      let adjustedWeight = weight - adjustmentPerWeight;
      return Math.max(0, adjustedWeight);
    }
    return weight; // Leave zero weights as is.
  });

  // Ensure the total sums to 1 by making final adjustments due to rounding.
  let totalNewWeights = newWeights.reduce((acc, curr) => acc + curr, 0);
  let roundingError = 1 - totalNewWeights;

  // Apply rounding error correction evenly across non-zero weights if necessary.
  //   console.log(newWeights.reduce((acc, current) => {
  //     return acc + current
  //   }, 0))
  console.log(totalNewWeights);
  console.log(roundingError);
  if (roundingError !== 0 && redistributableIndexes.length > 0) {
    newWeights = newWeights.map((weight, idx) =>
      redistributableIndexes.includes(idx)
        ? weight + roundingError / redistributableIndexes.length
        : weight
    );
  }

  console.log(
    newWeights.reduce((acc, current) => {
      return acc + current;
    }, 0)
  );
  console.log(
    newWeights.map((weight) => parseFloat(weight.toFixed(2)))
  )
  // Final round to ensure two decimal places, applied to all weights.
  return newWeights.map((weight) => parseFloat(weight.toFixed(2)));
}
