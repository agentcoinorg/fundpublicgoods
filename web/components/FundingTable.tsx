interface FundingEntry {
  amount: string;
  transactionHash?: string;
  project: {
    description: string;
    name: string;
    recipient: string;
  };
}


export default function FundingTable(props: { fundingEntries: FundingEntry[] }) {
  return (
    <table className="table-fixed text-sm bg-white overflow-hidden rounded-xl ring-2 ring-indigo-100">
      <thead>
        <tr>
          <th className="text-left w-6/12">PROJECT</th>
          <th className="text-left">PROJECT ADDRESS</th>
          {/* <th className="text-left w-2/12">TRANSACTION</th> */}
          <th className="text-left">AMOUNT</th>
        </tr>
      </thead>
      <tbody className="w-full">
        {props.fundingEntries.map((fund, index) => (
          <tr key={index}>
            <td>
              <div className="flex flex-col">
                <div>{fund.project.name}</div>
                <div>{fund.project.description}</div>
              </div>
            </td>
            <td>{fund.project.recipient}</td>
            {/*
                <td>
                     {fund.project.}
                </td>
            */}
            <td>{fund.amount}</td>
          </tr>
        ))}
        <tr></tr>
      </tbody>
    </table>
  );
}
