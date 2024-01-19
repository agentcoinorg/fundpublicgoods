const projects = [
  {
    name: "Project Name",
    category: "Ethereum Infrastructure",
    weight: 11.95,
    impactScore: 9.3,
  },
  {
    name: "Project Name",
    category: "Ethereum Infrastructure",
    weight: 11.7,
    impactScore: 9.1,
  },
  {
    name: "Project Name",
    category: "Ethereum Infrastructure",
    weight: 11.18,
    impactScore: 8.7,
  },
  {
    name: "Project Name",
    category: "Ethereum Infrastructure",
    weight: 10.54,
    impactScore: 8.2,
  },
  {
    name: "Project Name",
    category: "Ethereum Infrastructure",
    weight: 10.15,
    impactScore: 7.9,
  },
  {
    name: "Project Name",
    category: "Ethereum Infrastructure",
    weight: 10.03,
    impactScore: 7.8,
  },
  {
    name: "Project Name",
    category: "Ethereum Infrastructure",
    weight: 9.51,
    impactScore: 7.4,
  },
  {
    name: "Project Name",
    category: "Ethereum Infrastructure",
    weight: 9.51,
    impactScore: 7.1,
  },
  {
    name: "Project Name",
    category: "Ethereum Infrastructure",
    weight: 8.87,
    impactScore: 6.9,
  },
  {
    name: "Project Name",
    category: "Ethereum Infrastructure",
    weight: 6.94,
    impactScore: 5.4,
  },
];

export interface StrategyProps {
  id: string;
}

export default function Strategy(props: StrategyProps) {
  return (
    <div className="w-2/5">
      <div className="flex flex-col space-y-4">
        <p className="text-sm text-gray-500">
          I&apos;ve evaluated the impact of Ethereum infrastructure projects on
          the Gitcoin project registry and Optimism Retroactive Public Funding,
          and have listed the top 10 most impactful projects below. I&apos;ve
          also allotted a weighting for each to appropriately fund each project.
        </p>
        <div className="bg-black rounded-md w-64">
          <label
            htmlFor="totalFundingAmount"
            className="font-semibold text-white px-4 pt-4 pb-2 block"
          >
            Total Funding Amount
          </label>
          <div className="flex">
            <input
              type="number"
              id="totalFundingAmount"
              className="focus:outline-none w-full rounded-tl-md bg-black text-white border-0 py-2 pl-4"
              defaultValue={1231231}
            />
            <div className="flex">
              <select className="appearance-none bg-black text-white py-2 pr-4 pl-2 focus:outline-none rounded-tr-md cursor-pointer">
                <option value="USD">USD</option>
                <option value="USDC" selected>
                  USDC
                </option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 text-gray-300 rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left font-semibold">
                  Project
                </th>
                <th scope="col" className="px-6 py-3 text-left font-semibold">
                  Category
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
              {projects.map((project, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {project.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {`${project.weight} %`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      {project.impactScore.toFixed(1)}
                      <span className="ml-2 text-green-400">↑</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center px-6 py-3 bg-gray-900">
            <button className="text-gray-400 hover:text-white">
              Regenerate ↻
            </button>
            <button className="text-blue-500 hover:text-blue-400">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
