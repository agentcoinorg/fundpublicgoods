import { SupportedERC20Tokens } from "@/utils/ethereum";
import truncateEthAddress from "@/utils/ethereum/truncateAddress";

export interface FundingEntry {
  recipient: string;
  amount: string;
  description: string;
  title: string;
  network: number;
  token: SupportedERC20Tokens
}

export default function FundingTable(props: {
  fundingEntries: FundingEntry[];
}) {
  return (
    <table className="table-fixed text-sm bg-white overflow-hidden rounded-xl ring-2 ring-indigo-100 w-full">
      <tbody className="w-full">
        {props.fundingEntries.map((fund, index) => (
          <tr key={index}>
            <td className="w-8/12">
              <div className="flex flex-col">
                <div>{fund.title}</div>
                <div className="text-[10px] text-subdued line-clamp-2 leading-tight">
                  {fund.description}
                </div>
              </div>
            </td>
            <td className="text-[9px]">{truncateEthAddress(fund.recipient)}</td>
            <td>{fund.amount}</td>
          </tr>
        ))}
        <tr></tr>
      </tbody>
    </table>
  );
}
