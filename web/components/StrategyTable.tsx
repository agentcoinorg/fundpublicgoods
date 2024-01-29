"use client";

import { Tables } from "@/supabase/dbTypes";
import TextField from "./TextField";
import Score from "./Score";
import { useConnectWallet } from "@web3-onboard/react";
import { redistributeWeightsProportionally } from "@/utils/distributeWeights";

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

  const allChecked = props.strategy.every((s) => s.selected);
  const someChecked = props.strategy.some((s) => s.selected);
  return (
    <table className="table-fixed text-sm bg-white overflow-hidden rounded-xl ring-2 ring-indigo-100">
      <thead>
        <tr>
          <th className="pr-0">
            <TextField
              type="checkbox"
              indeterminate={!allChecked && someChecked}
              checked={allChecked}
              onChange={(e) => {
                props.modifyStrategy(
                  props.strategy.map((s) => {
                    let amount;
                    if (e.target.checked && props.totalAmount) {
                      amount = (+props.totalAmount * s.defaultWeight).toFixed(2);
                    }
                    return {
                      ...s,
                      selected: e.target.checked,
                      weight: e.target.checked ? s.defaultWeight : 0.0,
                      amount,
                    };
                  })
                );
              }}
            />
          </th>
          <th className="text-left">PROJECT</th>
          <th className="text-left">WEIGHTING</th>
          {!!wallet && <th className="text-left">AMOUNT</th>}
          <th className="text-left whitespace-nowrap">SMART RANKING</th>
        </tr>
      </thead>
      <tbody className="w-full">
        {props.strategy.map((entry, index) => (
          <tr
            key={index}
            className="w-full border-indigo-100/80 border-t-2 bg-indigo-50/50 odd:bg-indigo-50"
          >
            <td className="pr-0">
              <TextField
                type="checkbox"
                checked={entry.selected}
                onChange={(e) => {
                  const isSelected = e.target.checked;
                  const currentWeights = props.strategy.map((entry, i) => {
                    const strategySelected = index == i && isSelected || entry.selected
                    return strategySelected ? (entry.weight as number)  : 0
                  });
                  const newWeights = redistributeWeightsProportionally(
                    currentWeights,
                    index,
                    isSelected ? entry.defaultWeight : 0
                  );

                  const newStrategy = props.strategy.map((s, i) => {
                    const amount = +props.totalAmount * newWeights[i];
                    const strategySelected = index == i && isSelected || s.selected
                    return {
                      ...s,
                      weight: newWeights[i],
                      amount: props.totalAmount && strategySelected ? amount.toFixed(2) : undefined,
                    };
                  });
                  newStrategy[index].selected = e.target.checked;
                  props.modifyStrategy(newStrategy);
                }}
              />
            </td>
            <td className="min-w-6/12 w-full">
              <div className="space-y-px">
                <div>{entry.project.title}</div>
                <div className="text-[10px] text-subdued line-clamp-2 leading-tight">
                  {entry.project.description}
                </div>
              </div>
            </td>
            <td className="min-w-[130px]">
              {/* TODO: Make this field writable when connected and handle change */}
              <TextField
                readOnly
                className="!pl-3 !pr-8 !py-1 !border-indigo-100 !shadow-none bg-white"
                rightAdornment={"%"}
                value={
                  !entry.selected || !entry.weight
                    ? "0.00"
                    : (entry.weight * 100).toFixed(2)
                }
              />
            </td>
            {!!wallet && (
              <td className="min-w-[80px]">{`$${entry.amount || "0.00"}`}</td>
            )}
            <td>
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
