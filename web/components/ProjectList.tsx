export function ProjectList(props: { projects: any[] }) {
  return (
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
        {props.projects.map((project, index) => (
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
  );
}
