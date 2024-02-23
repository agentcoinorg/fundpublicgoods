import { Tables } from "@/supabase/dbTypes";
import {
  applyUserWeight,
  distributeAmounts,
  redistributeAmounts,
} from "@/utils/distributeWeights";
import { NetworkName } from "@/utils/ethereum";
import { Dispatch, SetStateAction, useState } from "react";

export interface StrategiesHandler {
  strategies: StrategiesWithProjects;
  formatted: { weights: string[]; update: Dispatch<SetStateAction<string[]>> };
  overwritten: number[];
  handleWeightUpdate: (value: string, index: number) => void;
  handleSelectAll: (isChecked: boolean) => void;
  handleSelectProject: (isChecked: boolean, index: number) => void;
  handleAmountUpdate: (amount: string) => void;
  handleNetworkUpdate: (network: NetworkName) => void;
}

export type StrategyEntry = Tables<"strategy_entries">;
export type Application = Tables<"applications">;
export type Project = Tables<"projects"> & {
  applications: Tables<"applications">[];
};
export type StrategyInformation = StrategyEntry & {
  project: Project;
  selected: boolean;
  amount?: string;
  defaultWeight: number;
  networks: NetworkName[];
  disabled?: boolean;
  recipients: string[];
  weight?: number
};
export type StrategiesWithProjects = StrategyInformation[];

export function useStrategiesHandler(
  initStrategies: StrategiesWithProjects,
  totalAmount: string,
  networkName: NetworkName,
  overwrites: {
    weights?: string[] | null;
    projects?: string[] | null;
  }
): StrategiesHandler {
  let preparedStrategies = initStrategies
    .map((s, i) => {
      const weights = redistributeAmounts(
        initStrategies.map((s) => s.defaultWeight as number),
        initStrategies.map((s) => s.networks.includes(networkName))
      );

      return {
        ...s,
        weight: weights[i],
        disabled: !s.networks.includes(networkName) || s.defaultWeight === 0,
        selected: s.networks.includes(networkName) && s.defaultWeight !== 0,
      };
    })
    .sort((a, b) => {
      if (!a.disabled && !b.disabled) {
        return (b.smart_ranking || 0) - (a.smart_ranking || 0);
      }
      if (a.disabled && b.disabled) {
        return (b.smart_ranking || 0) - (a.smart_ranking || 0);
      }
      return a.disabled ? 1 : -1;
    });

  const totalOfNewWeights = overwrites.weights?.reduce((acc, x) => acc + +x, 0);
  if (
    totalOfNewWeights === 1 &&
    overwrites.weights &&
    overwrites.projects &&
    overwrites.projects.length === overwrites.weights.length
  ) {
    preparedStrategies = preparedStrategies.map((s, i) => {
      const overwrittenProjectsIndex = overwrites.projects as string[];
      const overwrittenWeight = overwrites.weights as string[];
      const projectIndex = overwrittenProjectsIndex.findIndex((p) => +p === i);
      const weight = projectIndex !== -1 ? +overwrittenWeight[projectIndex] : 0;
      return {
        ...s,
        weight,
        disabled: !s.networks.includes(networkName) || s.defaultWeight === 0,
        selected: projectIndex !== -1,
      };
    });
  }

  const [strategies, modifyStrategies] = useState(preparedStrategies);
  const [overwrittenWeights, setOverwrittenWeights] = useState<number[]>(
    Array(strategies.length).fill(0)
  );
  const [formattedWeights, setFormattedWeights] = useState(
    strategies.map(({ weight, defaultWeight, selected }) =>
      (
        (!selected ? 0 : weight && weight > 0 ? weight : defaultWeight) * 100
      ).toFixed(2)
    )
  );

  const undoModificationOfWeight = (currentWeight: number, index: number) => {
    setFormattedWeights((weights) => {
      const currentWeights = [...weights];
      const weight = currentWeight * 100;
      currentWeights[index] = weight.toFixed(2);
      return currentWeights;
    });
  };

  const handleWeightUpdate = (value: string, index: number) => {
    const numberValue = +Number(value).toFixed(2);
    const currentWeight = strategies[index].weight as number;

    // Check if the value is the same as the current weight
    if ((numberValue / 100).toFixed(4) === currentWeight.toFixed(4)) {
      return;
    }

    // Check if the value is a number
    if (isNaN(numberValue) || numberValue > 100 || numberValue < 0) {
      undoModificationOfWeight(currentWeight, index);
      return;
    }

    // Replace the old weight with the new one
    const newOverwrittenWeights = [...overwrittenWeights];
    newOverwrittenWeights[index] = numberValue;

    // Check if the sum of the weights is greater than 100
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
      return w.selected && !w.disabled ? w.defaultWeight * 100 : 0;
    });

    const newPercentages = applyUserWeight(weights, newOverwrittenWeights);
    const newFractions = newPercentages.map(x => +(x / 100).toFixed(4)); // Convert percentages to fractions ([30.00, 70.00] -> [0.30, 0.70])

    const newAmounts = distributeAmounts(newFractions, +totalAmount);

    const newStrategies = strategies.map((s, i) => {
      const weight = +(newPercentages[i] / 100).toFixed(4);
      return {
        ...s,
        amount: newAmounts[i].toFixed(2),
        weight,
        selected: !(weight === 0),
      };
    });
    setOverwrittenWeights(newOverwrittenWeights);
    setFormattedWeights(newPercentages.map((weight) => weight.toFixed(2)));
    modifyStrategies(newStrategies);
  };

  const handleSelectAll = (isChecked: boolean) => {
    console.log("xxxxxxxxx",  strategies.map((s) => s.defaultWeight),
    strategies.map((s) => isChecked && !s.disabled))
    const aW = redistributeAmounts(
      strategies.map((s) => s.defaultWeight),
      strategies.map((s) => isChecked && !s.disabled)
    );
    console.log("aW", aW)
    const newWeights = aW.map((weight) => {
      return isChecked ? (weight * 100).toFixed(2) : "0.00";
    });
    console.log("newWeightsAAAAAAA", newWeights)
    const amounts = distributeAmounts(
      newWeights.map((w) => +(+w / 100).toFixed(4)),
      +totalAmount
    );
    const newStrategies = strategies.map((s, i) => {
      return {
        ...s,
        selected: !s.disabled && isChecked,
        weight: !s.disabled && isChecked ? +(+newWeights[i] / 100).toFixed(4) : 0.0,
        amount: amounts[i].toFixed(2),
      };
    });
    setOverwrittenWeights(Array(strategies.length).fill(0));
    setFormattedWeights(newWeights);
    modifyStrategies(newStrategies);
  };

  const handleSelectProject = (isChecked: boolean, index: number) => {
    const selectedWeights = strategies.map((s, i) =>
      i === index ? isChecked : s.selected
    );
    console.log("AAAAAAAAAAAAAA", strategies.map((s) => s.defaultWeight), selectedWeights)
    const newWeights = redistributeAmounts(
      strategies.map((s) => s.defaultWeight),
      selectedWeights
    );
    console.log("newWeights", newWeights)

    function calcPercentages(rations: number[]): number[] {
      const total = rations.reduce((acc, x) => acc + x, 0);
      return rations.map(x => +(x / total).toFixed(2));
    }

    const amounts = distributeAmounts(newWeights, +totalAmount, 2);
    console.log("amounts", amounts)

    const newStrategy = strategies.map((s, i) => {
      return {
        ...s,
        weight: newWeights[i],
        amount: amounts[i].toFixed(2),
        selected: newWeights[i] > 0,
      };
    });
    newStrategy[index].selected = isChecked;
    setFormattedWeights(newWeights.map((w) => (w * 100).toFixed(2)));
    modifyStrategies(newStrategy);
    setOverwrittenWeights(Array(strategies.length).fill(0));
  };

  const handleAmountUpdate = (amount: string) => {
    const selectedStrategies = strategies.filter((x) => x.selected);
    const weights = selectedStrategies.map((s) => s.weight) as number[];
    const amounts = distributeAmounts(weights, +amount);
    let amountIndex = 0;
    const newStrategies = strategies.map((s) => ({
      ...s,
      amount: s.selected ? amounts[amountIndex++].toFixed(2) : undefined,
    }));
    modifyStrategies(newStrategies);
  };

  const handleNetworkUpdate = (network: NetworkName) => {
    const weights = redistributeAmounts(
      strategies.map((s) => s.defaultWeight),
      strategies.map((s) => s.networks.includes(network))
    );
    const amounts = distributeAmounts(weights, +totalAmount);
    const newStrategies = strategies
      .map((s, i) => {
        return {
          ...s,
          amount: amounts[i].toFixed(2),
          weight: weights[i],
          selected: weights[i] !== 0,
          disabled: !s.networks.includes(network),
        };
      })
      .sort((a, b) => (b.smart_ranking || 0) - (a.smart_ranking || 0))
      .sort((a, b) => {
        if (!a.disabled && !b.disabled) {
          return (b.smart_ranking || 0) - (a.smart_ranking || 0);
        }
        if (a.disabled && b.disabled) {
          return (b.smart_ranking || 0) - (a.smart_ranking || 0);
        }
        return a.disabled ? 1 : -1;
      });
    setOverwrittenWeights(Array(initStrategies.length).fill(0));
    setFormattedWeights(newStrategies.map((s) => (s.weight * 100).toFixed(2)));
    modifyStrategies(newStrategies);
  };

  return {
    strategies,
    formatted: {
      weights: formattedWeights,
      update: setFormattedWeights,
    },
    overwritten: overwrittenWeights,
    handleWeightUpdate,
    handleSelectAll,
    handleSelectProject,
    handleAmountUpdate,
    handleNetworkUpdate,
  };
}
