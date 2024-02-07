import { StrategyWithProjects } from "@/components/StrategyTable";
import {
  applyUserWeight,
  redistributeWeights,
} from "@/utils/distributeWeights";
import { useState } from "react";

export function useWeightsHandler(
  strategies: StrategyWithProjects,
  modifyStrategies: (s: StrategyWithProjects) => void,
  totalAmount: string
) {
  const [overwrittenWeights, setOverwrittenWeights] = useState(
    Array(strategies.length).fill(0)
  );
  const [formattedWeights, setFormattedWeights] = useState(
    strategies.map(({ weight, defaultWeight, selected }) =>
      (
        (!selected ? 0 : weight && weight > 0 ? weight : defaultWeight) * 100
      ).toFixed(2)
    )
  );
  const defaultWeights = strategies.map((s) => s.defaultWeight);

  const undoModificationOfWeight = (currentWeight: number, index: number) => {
    setFormattedWeights((weights) => {
      const currentWeights = [...weights];
      const weight = currentWeight * 100;
      currentWeights[index] = weight.toFixed(2);
      return currentWeights;
    });
  };

  const handleWeightUpdate = (value: string, index: number) => {
    const numberValue = parseFloat(value);
    const currentWeight = strategies[index].weight as number;

    if (numberValue / 100 === currentWeight) {
      return;
    }

    if (isNaN(numberValue) || numberValue > 100 || numberValue < 0) {
      undoModificationOfWeight(currentWeight, index);
      return;
    }

    const newOverwrittenWeights = overwrittenWeights.map((w, i) => {
      if (i === index) return numberValue;
      return w;
    });

    if (newOverwrittenWeights.reduce((acc, x) => acc + x) > 100) {
      undoModificationOfWeight(currentWeight, index);
      return;
    }

    const modifiedWeights = strategies.map((s, i) => {
      if (!s.selected || i === index) return true;

      return !!newOverwrittenWeights[i];
    });

    if (modifiedWeights.every((w) => w)) {
      undoModificationOfWeight(currentWeight, index);
      return;
    }

    const weights = strategies.map((w) => {
      return w.selected ? w.defaultWeight * 100 : 0;
    });

    const newPercentages = applyUserWeight(weights, newOverwrittenWeights, {
      percentage: numberValue,
      index,
    });
    setOverwrittenWeights(newOverwrittenWeights);
    setFormattedWeights(newPercentages.map((weight) => weight.toFixed(2)));
    const newStrategies = strategies.map((s, i) => {
      const weight = newPercentages[i] / 100;
      const amount = +totalAmount * weight;
      return {
        ...s,
        amount: totalAmount ? amount.toFixed(2) : undefined,
        weight,
        selected: !(weight === 0),
      };
    });
    modifyStrategies(newStrategies);
  };

  function handleSelectAll(isSelected: boolean) {
    setOverwrittenWeights(Array(strategies.length).fill(0));
    const newWeights = strategies.map(({ defaultWeight }) => {
      return isSelected ? (defaultWeight * 100).toFixed(2) : "0.00";
    });
    setFormattedWeights(newWeights);
    modifyStrategies(
      strategies.map((s) => {
        let amount;
        if (isSelected && totalAmount) {
          amount = (+totalAmount * s.defaultWeight).toFixed(2);
        }
        return {
          ...s,
          selected: isSelected,
          weight: isSelected ? s.defaultWeight : 0.0,
          amount,
        };
      })
    );
  }

  function handleSelectProject(isChecked: boolean, index: number) {
    const selectedWeights = strategies.map((s, i) =>
      i === index ? isChecked : s.selected
    );
    const newWeights = redistributeWeights(defaultWeights, selectedWeights);

    setFormattedWeights(newWeights.map((w) => (w * 100).toFixed(2)));
    const newStrategy = strategies.map((s, i) => {
      const amount = +totalAmount * newWeights[i];
      const strategySelected = (index == i && isChecked) || s.selected;
      return {
        ...s,
        weight: newWeights[i],
        amount: totalAmount && strategySelected ? amount.toFixed(2) : undefined,
        selected: newWeights[i] > 0,
      };
    });
    newStrategy[index].selected = isChecked;
    modifyStrategies(newStrategy);
    setOverwrittenWeights(Array(strategies.length).fill(0));
  }

  return {
    strategies,
    formatted: {
        weights: formattedWeights,
        update: setFormattedWeights
    },
    overwritten: overwrittenWeights,
    handleWeightUpdate,
    handleSelectAll,
    handleSelectProject,
  };
}
