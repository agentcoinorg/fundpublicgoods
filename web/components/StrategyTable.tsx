"use client";

import { Tables } from "@/supabase/dbTypes";
import TextField from "./TextField";
import Score from "./Score";
import { useConnectWallet } from "@web3-onboard/react";
import Image from "next/image";

export type StrategyEntry = Tables<"strategy_entries">;
export type Project = Tables<"projects">;
export type StrategyWithProjects = (StrategyEntry & {
  project: Project;
  selected: boolean;
  amount?: string
})[];

export interface StrategyTableProps {
  strategy: StrategyWithProjects;
  modifyStrategy: (projects: StrategyWithProjects) => void;
}

export function StrategyTable(props: StrategyTableProps) {
  const [{ wallet }] = useConnectWallet();

  const allChecked = props.strategy.every((s) => s.selected);
  const someChecked = props.strategy.some((s) => s.selected);
  return (
    <table className="table-fixed text-sm bg-white overflow-hidden rounded-xl ring-2 ring-indigo-100 w-full">
      <thead>
        <tr>
          <th className="pr-0 w-10">
            <TextField
              type="checkbox"
              indeterminate={!allChecked && someChecked}
              checked={allChecked}
              onChange={(e) => {
                props.modifyStrategy(
                  props.strategy.map((s) => ({
                    ...s,
                    selected: e.target.checked,
                  }))
                );
              }}
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
                onChange={(e) => {
                  const currentStrategy = [...props.strategy];
                  currentStrategy[index].selected = e.target.checked;
                  props.modifyStrategy(currentStrategy);
                }}
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
              {/* TODO: Make this field writable when connected and handle change */}
              <TextField
                readOnly
                className="!pl-3 !pr-8 !py-1 !border-indigo-100 !shadow-none bg-white"
                rightAdornment={"%"}
                value={!entry.weight ? "0" : (entry.weight * 100).toFixed(2)}
              />
            </td>
            {!!wallet && <td className="w-20">{entry.amount || 0}</td>}
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
