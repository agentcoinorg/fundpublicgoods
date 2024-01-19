import Button from "./Button";
import { ProjectList } from "./ProjectList";
import TextField from "./TextField";

const projects: any[] = [
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

export default async function Strategy(props: StrategyProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col gap-4 justify-center w-3/5">
        <TextField label="Results for" />
        <p className="text-base">
          I&apos;ve evaluated the impact of Ethereum infrastructure projects on
          the Gitcoin project registry and Optimism Retroactive Public Funding,
          and have listed the top 10 most impactful projects below. I&apos;ve
          also allotted a weighting for each to appropriately fund each project.
        </p>
        <div className="flex flex-col gap-4 border-zinc-700 rounded-lg border-2 p-8">
          <TextField label="Total Funding Amount" />
          <div className="bg-gray-800 text-gray-300 rounded-lg shadow-md overflow-hidden">
            <ProjectList projects={projects} />
          </div>
        </div>
        {/* <div className="absolute right-0"> */}
          <Button>Next →</Button>
        {/* </div> */}
      </div>
    </div>
  );
}
