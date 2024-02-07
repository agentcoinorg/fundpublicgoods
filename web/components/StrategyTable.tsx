"use client";

import TextField from "./TextField";
import Score from "./Score";
import { useConnectWallet } from "@web3-onboard/react";
import { useState } from "react";
import Image from "next/image";
import ProjectModal from "./ProjectModal";
import WeightingModal from "./WeightingModal";
import clsx from "clsx";
import {
  StrategyInformation,
  StrategiesHandler,
} from "@/hooks/useStrategiesHandler";

export function StrategyTable(props: StrategiesHandler) {
  const [{ wallet }] = useConnectWallet();
  const {
    strategies,
    formatted: { weights: formattedWeights, update: setFormattedWeights },
    handleWeightUpdate,
    handleSelectProject,
    handleSelectAll,
  } = props;

  const [showStrategyDetails, setShowStrategyDetails] = useState<{
    show: boolean;
    strategy?: StrategyInformation;
  }>({
    show: false,
  });

  const [showWeightingModal, setShowWeightingModal] = useState<boolean>(false);

  const allChecked = strategies.filter(s => !s.disabled).every((s) => s.selected);
  const someChecked = strategies.filter(s => !s.disabled).some((s) => s.selected);

  function openProjectDetails(strategy: StrategyInformation) {
    setShowStrategyDetails({
      show: true,
      strategy,
    });
  }

  return (
    <table className="table-fixed text-sm bg-white overflow-hidden rounded-xl ring-2 ring-indigo-100 w-full">
      <thead>
        <tr>
          <th className="pr-0 w-10">
            <TextField
              type="checkbox"
              indeterminate={!allChecked && someChecked}
              checked={allChecked}
              onChange={(e) => handleSelectAll(!!e.target.value)}
            />
          </th>
          <th className="text-left w-full">PROJECT</th>
          <th className="text-left w-32">WEIGHTING</th>
          {!!wallet && <th className="text-left w-20">AMOUNT</th>}
          <th className="text-left whitespace-nowrap w-32">SMART RANKING</th>
        </tr>
      </thead>
      <tbody className="w-full">
        {strategies.map((entry, index) => (
          <tr
            key={index}
            className={clsx(
              "w-full border-indigo-100/80 border-t-2",
              entry.disabled
                ? "opacity-50 cursor-not-allowed"
                : "bg-indigo-50/50 odd:bg-indigo-50 group/row hover:bg-white duration-200 transition-colors ease-in-out cursor-pointer"
            )}
          >
            <td
              className={clsx(
                "pr-0 w-10 check",
                !entry.disabled ? "cursor-pointer" : "cursor-not-allowed"
              )}
            >
              <TextField
                type="checkbox"
                checked={entry.selected}
                disabled={entry.disabled}
                onChange={(e) => {
                  handleSelectProject(e.target.checked, index);
                }}
              />
            </td>
            <td className="flex gap-2 w-full">
              <div className="flex flex-col justify-center w-8">
                {entry.project.logo ? (
                  <Image
                    className="rounded-full"
                    width={32}
                    height={32}
                    alt="logo"
                    src={`https://ipfs.io/ipfs/${entry.project.logo}`}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white" />
                )}
              </div>
              <div className="space-y-px flex-1 max-w-[calc(100%-40px)]">
                <div className="line-clamp-1">{entry.project.title}</div>
                <div className="text-[10px] text-subdued line-clamp-2 leading-tight">
                  {entry.project.description}
                </div>
              </div>
            </td>
            <td className="w-32">
              <TextField
                readOnly={!entry.selected}
                onChange={(e) => {
                  const currentWeights = [...formattedWeights];
                  currentWeights[index] = e.target.value;
                  setFormattedWeights(currentWeights);
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    handleWeightUpdate(event.currentTarget.value, index);
                  }
                }}
                onBlur={(e) => handleWeightUpdate(e.target.value, index)}
                className="!pl-3 !pr-6 !py-1 !border-indigo-100 !shadow-none bg-white"
                rightAdornment={"%"}
                value={formattedWeights[index]}
              />
            </td>
            {!!wallet && (
              <td className="w-20">{`$${entry.amount || "0.00"}`}</td>
            )}
            <td className="w-32">
              <div className="w-full">
                <Score
                  onClick={() => openProjectDetails(entry)}
                  rank={entry.impact ?? 0}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      <WeightingModal
        isOpen={showWeightingModal}
        title="Customize Project Weightings"
        onClose={() => setShowWeightingModal(false)}
      />
      <ProjectModal
        strategy={showStrategyDetails.strategy}
        isOpen={showStrategyDetails.show}
        title={showStrategyDetails.strategy?.project.title || "Project"}
        onClose={() => setShowStrategyDetails({ show: false })}
      />
    </table>
  );
}
