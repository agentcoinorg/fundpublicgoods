import { Tables } from "@/supabase/dbTypes";
import TextField from "./TextField";
import Score from "./Score";

export type StrategyEntry = Tables<"strategy_entries">;
export type Project = Tables<"projects">;

export interface StrategyTableProps {
  strategy: (StrategyEntry & { project: Project })[];
}

export function StrategyTable(props: StrategyTableProps) {
  return (
    <table className="table-fixed">
      <thead>
        <tr>
          <th className="px-4">
            <TextField type="checkbox" />
          </th>
          <th className="text-left">PROJECT</th>
          <th>WEIGHTING</th>
          <th>SMART RANKING</th>
        </tr>
      </thead>
      <tbody className="bg-gray-900 w-full">
        {props.strategy.map((entry, index) => (
          <tr key={index} className="w-full">
            <td className="px-6 pl-4">
              <TextField type="checkbox" />
            </td>
            <td>
              <div className="flex flex-col py-4 mr-6 w-[520px]">
                <div>{entry.project.title}</div>
                <div className="text-[10px] text-slate-500 line-clamp-2">
                  {entry.project.description}
                </div>
              </div>
            </td>
            <td className="w-[120px]">
              <TextField
                className="h-[20px] p-2.5"
                rightAdornment={"%"}
                value={!entry.weight ? "0" : (entry.weight * 100).toFixed(2)}
              />
            </td>
            <td>
              <Score rank={entry.impact ?? 0} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
