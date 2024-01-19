import { Database } from "@/supabase/dbTypes";

export type StrategyEntry = Database["public"]["Tables"]["strategy_entries"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];

export interface StrategyTableProps {
  strategy: (StrategyEntry & { project: Project })[];
}

export function StrategyTable(props: StrategyTableProps) {
  return (
    <table className="w-full">
      <thead className="bg-gray-700">
        <tr>
          <th scope="col" className="px-6 py-3 text-left font-semibold">
            Project
          </th>
          <th scope="col" className="px-6 py-3 text-left font-semibold">
            Description
          </th>
          <th scope="col" className="px-6 py-3 text-left font-semibold">
            Weight
          </th>
          <th scope="col" className="px-6 py-3 text-left font-semibold">
            Impact Score
          </th>
        </tr>
      </thead>
      <tbody className="bg-gray-900">
        {props.strategy.map((entry, index) => (
          <tr key={index} className="border-b border-gray-700">
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              {entry.project.title}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              {entry.project.description}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              {`${entry.weight} %`}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <div className="flex items-center">
                {entry.impact}
                <span className="ml-2 text-green-400">↑</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
