"use client";

import { Tables } from "@/supabase/dbTypes";
import TextField from "./TextField";
import Score from "./Score";

export type StrategyEntry = Tables<"strategy_entries">;
export type Project = Tables<"projects">;
export type StrategyWithProjects = (StrategyEntry & {
  project: Project;
  selected: boolean;
})[];

export interface StrategyTableProps {
  strategy: StrategyWithProjects;
  modifyStrategy: (projects: StrategyWithProjects) => void;
}

export function StrategyTable(props: StrategyTableProps) {
  const allChecked = props.strategy.every((s) => s.selected);
  const someChecked = props.strategy.some((s) => s.selected);
  return (
    <table className='table-fixed text-sm bg-white overflow-hidden rounded-xl ring-2 ring-indigo-100'>
      <thead>
        <tr>
          <th className='pr-0'>
            <TextField
              type='checkbox'
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
          <th className='text-left'>PROJECT</th>
          <th className='text-left'>WEIGHTING</th>
          <th className='text-left whitespace-nowrap'>SMART RANKING</th>
        </tr>
      </thead>
      <tbody className='w-full'>
        {props.strategy.map((entry, index) => (
          <tr
            key={index}
            className='w-full border-indigo-100/80 border-t-2 bg-indigo-50/50 odd:bg-indigo-50'>
            <td className='pr-0'>
              <TextField
                type='checkbox'
                checked={entry.selected}
                onChange={(e) => {
                  const currentStrategy = [...props.strategy];
                  currentStrategy[index].selected = e.target.checked;
                  props.modifyStrategy(currentStrategy);
                }}
              />
            </td>
            <td className='min-w-6/12 w-full'>
              <div className='space-y-px'>
                <div>{entry.project.title}</div>
                <div className='text-[10px] text-subdued line-clamp-2 leading-tight'>
                  {entry.project.description}
                </div>
              </div>
            </td>
            <td className='min-w-[130px]'>
              <TextField
                readOnly
                className='!pl-3 !pr-8 !py-1 !border-indigo-100 !shadow-none bg-white'
                rightAdornment={"%"}
                value={!entry.weight ? "0" : (entry.weight * 100).toFixed(2)}
              />
            </td>
            <td>
              <div className='w-full'>
                <Score rank={entry.impact ?? 0} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
