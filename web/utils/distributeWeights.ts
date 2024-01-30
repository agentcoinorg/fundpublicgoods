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
    throw Error("");
  }

  const denominator = defaultWeights.reduce((acc, x, index) => {
    return selectedWeights[index] ? acc + x * 100 : acc;
  }, 0);

  return defaultWeights.map((weight, index) => {
    return !selectedWeights[index] ? 0 : (weight * 100) / denominator;
  });
}