import { NetworkName, TokenInformation } from "@/utils/ethereum";
import truncateEthAddress from "@/utils/ethereum/truncateAddress";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";

export interface FundingEntry {
  network: NetworkName;
  token: TokenInformation;
  donations: {
    description: string;
    title: string;
    amount: string;
    recipient: string;
  }[];
}

export default function FundingTable(props: { plan: FundingEntry }) {
  return (
    <table className="table-fixed text-sm bg-white overflow-hidden rounded-xl ring-2 ring-indigo-100 w-full">
      <thead>
        <tr>
          <th className="text-left w-7/12">Project</th>
          <th className="text-left w-3/12">Project Address</th>
          <th className="text-right">Amount</th>
        </tr>
      </thead>
      <tbody className="w-full">
        {props.plan.donations.map((fund, index) => (
          <tr
            key={index}
            className="w-full border-indigo-100/80 border-t-2 bg-indigo-50/50 odd:bg-indigo-50"
          >
            <td className="w-7/12">
              <div className="space-y-px">
                <div className="line-clamp-1 leading-tight">{fund.title}</div>
                <div className="text-[10px] text-subdued line-clamp-2 leading-tight">
                  {fund.description}
                </div>
              </div>
            </td>
            <td className="w-3/12">
              {fund.recipient && (
                <a
                  target="_blank"
                  rel="noredirect"
                  href={`https://etherscan.io/address/${fund.recipient}`}
                  className="inline-flex items-center text-[10px] underline font-bold text-indigo-500 hover:text-indigo-600 cursor-pointer space-x-2"
                >
                  <div>{truncateEthAddress(fund.recipient)}</div>
                  <ArrowSquareOut size={10} weight="bold" />
                </a>
              )}
            </td>
            <td className="text-right">{fund.amount}</td>
          </tr>
        ))}
        <tr></tr>
      </tbody>
    </table>
  );
}
