import { Tables } from "@/supabase/dbTypes";
import {
  applyUserWeight,
  distributeWeights,
  redistributeWeights,
} from "@/utils/distributeWeights";
import { NetworkName, TokenInformation } from "@/utils/ethereum";
import { Dispatch, SetStateAction, useState } from "react";
import { useAtom, atom } from "jotai";
import { FundingEntry } from "@/components/FundingTable";

export interface StrategiesHandler {
  strategies: StrategiesWithProjects;
  formatted: { weights: string[]; update: Dispatch<SetStateAction<string[]>> };
  overwritten: number[];
  handleWeightUpdate: (value: string, index: number) => void;
  handleSelectAll: (isChecked: boolean) => void;
  handleSelectProject: (isChecked: boolean, index: number) => void;
  handleAmountUpdate: (amount: string) => void;
  handleNetworkUpdate: (network: NetworkName) => void;
  prepareDonation: (token: TokenInformation) => void;
}

export type StrategyEntry = Tables<"strategy_entries">;
export type Project = Tables<"projects"> & {
  applications: Tables<"applications">[];
};
export type StrategyInformation = StrategyEntry & {
  project: Project;
  selected: boolean;
  amount?: string;
  defaultWeight: number;
  network: NetworkName;
  disabled?: boolean;
  recipient: string
};
export type StrategiesWithProjects = StrategyInformation[];

export const donationPlan = atom<FundingEntry | undefined>(undefined);

export function useStrategiesHandler(
  initStrategies: StrategiesWithProjects,
  totalAmount: string,
  networkName: NetworkName
): StrategiesHandler {
  const [,setDonationPlan] = useAtom(donationPlan)
  const weights = redistributeWeights(
    initStrategies.map((s) => s.defaultWeight as number),
    initStrategies.map((s) => s.network === networkName)
  );

  initStrategies = initStrategies.map((s, i) => {
    return {
      ...s,
      weight: weights[i],
      disabled: s.network !== networkName,
      selected: s.network === networkName,
    };
  });

  initStrategies.sort((a, b) => {
    if (!a.disabled && !b.disabled) {
      return (b.impact || 0) - (a.impact || 0);
    }

    if (a.disabled && b.disabled) {
      return (b.impact || 0) - (a.impact || 0);
    }

    return -1;
  });

  const [strategies, modifyStrategies] = useState<StrategiesWithProjects>(initStrategies);
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
      return w.selected && !w.disabled ? w.defaultWeight * 100 : 0;
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

  const handleSelectAll = (isChecked: boolean) => {
    setOverwrittenWeights(Array(strategies.length).fill(0));
    const newWeights = strategies.map(({ defaultWeight }) => {
      return isChecked ? (defaultWeight * 100).toFixed(2) : "0.00";
    });
    setFormattedWeights(newWeights);
    modifyStrategies(
      strategies.filter(s => s.disabled).map((s) => {
        let amount;
        if (isChecked && totalAmount) {
          amount = (+totalAmount * s.defaultWeight).toFixed(2);
        }
        return {
          ...s,
          selected: isChecked,
          weight: isChecked ? s.defaultWeight : 0.0,
          amount,
        };
      })
    );
  }

  const handleSelectProject = (isChecked: boolean, index: number) => {
    const selectedWeights = strategies.map((s, i) =>
      i === index ? isChecked : s.selected
    );
    const newWeights = redistributeWeights(
      strategies.map((s) => s.defaultWeight),
      selectedWeights
    );

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

  const handleAmountUpdate = (amount: string) => {
    const selectedStrategies = strategies.filter((x) => x.selected);
    const weights = selectedStrategies.map((s) => s.weight) as number[];
    const amounts = distributeWeights(weights, +amount, 2);
    let amountIndex = 0;
    modifyStrategies(
      strategies.map((s) => ({
        ...s,
        amount: s.selected ? amounts[amountIndex++].toFixed(2) : undefined,
      }))
    );
  }

  function handleNetworkUpdate(network: NetworkName) {
    const weights = redistributeWeights(
      strategies.map((s) => s.defaultWeight),
      strategies.map((s) => s.network === network)
    );
    const amounts = distributeWeights(weights, +totalAmount, 2);
    const newStrategies = strategies
      .map((s, i) => {
        return {
          ...s,
          amount: amounts[i].toFixed(2),
          weight: weights[i],
          selected: weights[i] !== 0,
          disabled: s.network !== network,
        };
      })
      .sort((a, b) => {
        if ((!a.disabled && !b.disabled) || (a.disabled && b.disabled)) {
          return (b.impact || 0) - (a.impact || 0);
        }

        return -1;
      });
    setOverwrittenWeights(Array(initStrategies.length).fill(0));
    setFormattedWeights(newStrategies.map((s) => (s.weight * 100).toFixed(2)));
    modifyStrategies(newStrategies);
  }

  const prepareDonation = (token: TokenInformation) => {
    const donations = strategies
    .filter((x) => x.selected)
    .map((strategy) => ({
      amount: strategy.amount as string,
      description: strategy.project.description as string,
      title: strategy.project.title as string,
      recipient: strategy.recipient
    }));
    setDonationPlan({
      donations,
      network: networkName,
      token
    })
  }

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
    prepareDonation
  };
}
