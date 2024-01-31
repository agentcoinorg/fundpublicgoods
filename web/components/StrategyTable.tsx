"use client";

import { Tables } from "@/supabase/dbTypes";
import TextField from "./TextField";
import Score from "./Score";
import { useConnectWallet } from "@web3-onboard/react";
import { redistributeWeights } from "@/utils/distributeWeights";
import { ChangeEvent, useState } from "react";
import Image from "next/image";

export type StrategyEntry = Tables<"strategy_entries">;
export type Project = Tables<"projects">;
export type StrategyWithProjects = (StrategyEntry & {
  project: Project;
  selected: boolean;
  amount?: string;
  defaultWeight: number;
})[];

export interface StrategyTableProps {
  strategy: StrategyWithProjects;
  modifyStrategy: (projects: StrategyWithProjects) => void;
  totalAmount: string;
}

export function StrategyTable(props: StrategyTableProps) {
  const [{ wallet }] = useConnectWallet();
  const [formattedWeights, setFormattedWeights] = useState(
    props.strategy.map(({ weight, defaultWeight, selected }) =>
      (
        (!selected ? 0 : weight && weight > 0 ? weight : defaultWeight) * 100
      ).toFixed(2)
    )
  );

  const defaultWeights = props.strategy.map((s) => s.defaultWeight);
  const allChecked = props.strategy.every((s) => s.selected);
  const someChecked = props.strategy.some((s) => s.selected);

  function handleSelectAll(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.checked;
    if (selected) {
      setFormattedWeights(
        props.strategy.map(({ defaultWeight }) =>
          (defaultWeight * 100).toFixed(2)
        )
      );
    } else {
      setFormattedWeights(props.strategy.map((_) => "0.00"));
    }
    props.modifyStrategy(
      props.strategy.map((s) => {
        let amount;
        if (selected && props.totalAmount) {
          amount = (+props.totalAmount * s.defaultWeight).toFixed(2);
        }
        return {
          ...s,
          selected,
          weight: selected ? s.defaultWeight : 0.0,
          amount,
        };
      })
    );
  }

  function handleSelectProject(
    e: ChangeEvent<HTMLInputElement>,
    index: number,
  ) {
    const isSelected = e.target.checked;
    const selectedWeights = props.strategy.map((s, i) =>
      i === index ? isSelected : s.selected
    );
    const newWeights = redistributeWeights(defaultWeights, selectedWeights);

    setFormattedWeights(newWeights.map((w) => (w * 100).toFixed(2)));
    const newStrategy = props.strategy.map((s, i) => {
      const amount = +props.totalAmount * newWeights[i];
      const strategySelected = (index == i && isSelected) || s.selected;
      return {
        ...s,
        weight: newWeights[i],
        amount:
          props.totalAmount && strategySelected ? amount.toFixed(2) : undefined,
        selected: newWeights[i] > 0,
      };
    });
    newStrategy[index].selected = e.target.checked;
    props.modifyStrategy(newStrategy);
  }

  function handleWeightUpdate(value: string, index: number) {}

  return (
    <table className="table-fixed text-sm bg-white overflow-hidden rounded-xl ring-2 ring-indigo-100 w-full">
      <thead>
        <tr>
          <th className="pr-0 w-10">
            <TextField
              type="checkbox"
              indeterminate={!allChecked && someChecked}
              checked={allChecked}
              onChange={handleSelectAll}
            />
          </th>
          <th className="text-left w-full">PROJECT</th>
          <th className="text-left w-32">WEIGHTING</th>
          {!!wallet && <th className="text-left w-20">AMOUNT</th>}
          <th className="text-left whitespace-nowrap w-32">SMART RANKING</th>
        </tr>
      </thead>
      <tbody className="w-full">
        {props.strategy.map((entry, index) => (
          <tr
            key={index}
            className="w-full border-indigo-100/80 border-t-2 bg-indigo-50/50 odd:bg-indigo-50"
          >
            <td className="pr-0 w-10">
              <TextField
                type="checkbox"
                checked={entry.selected}
                onChange={(e) =>
                  handleSelectProject(e, index)
                }
              />
            </td>
            <td className="flex gap-2 w-full">
              <div className="flex flex-col justify-center w-8">
                { entry.project.logo ? <Image className="rounded-full"
                  width={32}
                  height={32}
                  alt="logo"
                  src={`https://ipfs.io/ipfs/${entry.project.logo}`}
                /> : <div className="w-8 h-8 rounded-full bg-white" /> }
              </div>
              <div className="space-y-px flex-1 max-w-[calc(100%-40px)]">
                <div className="line-clamp-1">{entry.project.title}</div>
                <div className="text-[10px] text-subdued line-clamp-2 leading-tight">
                  {entry.project.description}
                </div>
              </div>
            </td>
            <td className="w-32">
              <TextField
                readOnly={!entry.selected}
                onChange={(e) => {
                  const currentWeights = [...formattedWeights];
                  currentWeights[index] = e.target.value;
                  setFormattedWeights(currentWeights);
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    handleWeightUpdate(event.currentTarget.value, index);
                  }
                }}
                onBlur={(e) => handleWeightUpdate(e.target.value, index)}
                className="!pl-3 !pr-8 !py-1 !border-indigo-100 !shadow-none bg-white"
                rightAdornment={"%"}
                value={formattedWeights[index]}
              />
            </td>
            {!!wallet && <td className="w-20">{`$${entry.amount || "0.00"}`}</td>}
            <td className="w-32">
              <div className="w-full">
                <Score rank={entry.impact ?? 0} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
