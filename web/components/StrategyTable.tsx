"use client";

import TextField from "./TextField";
import Score from "./Score";
import { useConnectWallet } from "@web3-onboard/react";
import { useState } from "react";
import Image from "next/image";
import ProjectModal from "./ProjectModal";
import clsx from "clsx";
import {
  StrategyInformation,
  StrategiesHandler,
} from "@/hooks/useStrategiesHandler";
import { NetworkName } from "@/utils/ethereum";
import { SparkleIcon } from "./Icons";

export function StrategyTable(props: StrategiesHandler & { network: NetworkName }) {
  const [{ wallet }] = useConnectWallet();
  const {
    strategies,
    formatted: { weights: formattedWeights, update: setFormattedWeights },
    handleWeightUpdate,
    handleSelectProject,
    handleSelectAll,
    network
  } = props;

  const [showStrategyDetails, setShowStrategyDetails] = useState<{
    show: boolean;
    strategy?: StrategyInformation;
  }>({
    show: false,
  });

  const allChecked = strategies
    .filter((s) => !s.disabled)
    .every((s) => s.selected);
  const someChecked = strategies
    .filter((s) => !s.disabled)
    .some((s) => s.selected);

  function openProjectDetails(strategy: StrategyInformation) {
    setShowStrategyDetails({
      show: true,
      strategy,
    });
  }

  return (
    <>
      <div className='space-y-2'>
        <div className='hidden md:grid grid-cols-12 gap-4 text-indigo-800/50 font-semibold text-xs leading-none uppercase px-4'>
          <div className='col-span-6 flex items-center space-x-4'>
            <div className='w-10'>
              <TextField
                type='checkbox'
                indeterminate={!allChecked && someChecked}
                checked={allChecked}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </div>
            Project
          </div>
          <div className='col-span-6 grid grid-cols-12 items-center'>
            <div className={clsx(wallet ? "col-span-4" : "col-span-6")}>
              Weighting
            </div>
            {!!wallet && <div className='col-span-4'>Amount</div>}
            <div
              className={clsx(
                "text-right",
                wallet ? "col-span-4" : "col-span-6"
              )}>
              Score
            </div>
          </div>
        </div>
        <div className='w-full grid grid-cols-12 gap-2'>
          {strategies.map((entry, index) => (
            <div
              key={index}
              className={clsx(
                "bg-indigo-50 border-2 border-indigo-300 hover:bg-white transition-colors duration-200 w-full rounded-2xl shadow-sm hover:shadow-lg shadow-primary-shadow/20 p-4 col-span-12 space-y-3",
                entry.disabled
                  ? "opacity-20 cursor-not-allowed"
                  : "cursor-pointer"
              )}
              onClick={() => openProjectDetails(entry)}>
              <div className='grid gap-4 grid-cols-12'>
                <div className='flex space-x-4 items-center w-full col-span-12 md:col-span-6'>
                  <div
                    className={clsx(
                      "check",
                      !entry.disabled ? "cursor-pointer" : "cursor-not-allowed"
                    )}>
                    <TextField
                      type='checkbox'
                      checked={entry.selected}
                      disabled={entry.disabled}
                      onChange={(e) => {
                        if (!entry.disabled) {
                          handleSelectProject(e.target.checked, index);
                        }
                      }}
                    />
                  </div>
                  <div className='space-x-2 flex'>
                    <div className='flex flex-col justify-center w-12 relative'>
                      <Image
                        className="absolute top-0 left-0 z-1 w-4 h-4 rounded-full shadow-sm shadow-primary-shadow/20"
                        width={48}
                        height={48}
                        src={`/chains/${entry.networks.includes(network) ? network : entry.networks[0]}.png`}
                        alt="network"
                      />
                      {entry.project.logo ? (
                        <Image
                          className='rounded-full border-2 border-indigo-300 object-fit'
                          width={48}
                          height={48}
                          alt='logo'
                          src={`https://ipfs.io/ipfs/${entry.project.logo}`}
                          onError={() => (
                            <div className="rounded-full flex items-center justify-center bg-indigo-100 border-2 border-indigo-300">
                              <SparkleIcon size={40} className="opacity-80" />
                            </div>
                          )}
                        />
                      ) : (
                        <div className='rounded-full flex items-center justify-center bg-indigo-100 border-2 border-indigo-300'>
                          <SparkleIcon size={40} className='opacity-80' />
                        </div>
                      )}
                    </div>
                    <div className="space-y-px flex-1 max-w-[calc(100%-40px)] break-words [word-break:break-word]">
                      <div className="line-clamp-1">{entry.project.title}</div>
                      <div className="text-[10px] text-subdued line-clamp-2 leading-tight">
                        {entry.project.short_description}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-span-12 md:col-span-6 grid grid-cols-12 gap-4 items-center pt-3 md:pt-0 border-t-2 border-indigo-300 md:border-t-0'>
                  <div className={clsx(wallet ? "col-span-4" : "col-span-6")}>
                    <TextField
                      readOnly={!entry.selected}
                      onChange={(e) => {
                        const currentWeights = [...formattedWeights];
                        currentWeights[index] = e.target.value;
                        setFormattedWeights(currentWeights);
                      }}
                      onKeyDown={(
                        event: React.KeyboardEvent<HTMLInputElement>
                      ) => {
                        if (event.key === "Enter") {
                          handleWeightUpdate(event.currentTarget.value, index);
                        }
                      }}
                      onBlur={(e) => handleWeightUpdate(e.target.value, index)}
                      className='!pl-3 !pr-6 !py-1 !border-indigo-100 !shadow-none bg-white'
                      rightAdornment={"%"}
                      value={formattedWeights[index]}
                    />
                  </div>
                  {!!wallet && (
                    <div className='col-span-4'>{`$${
                      entry.amount || "0.00"
                    }`}</div>
                  )}
                  <div
                    className={clsx(
                      "flex w-full justify-end",
                      wallet ? "col-span-4" : "col-span-6"
                    )}>
                    <Score rank={entry.smart_ranking ?? 0} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ProjectModal
        strategy={showStrategyDetails.strategy}
        network={props.network}
        isOpen={showStrategyDetails.show}
        title={
          <div className='line-clamp-1'>
            {showStrategyDetails.strategy?.project.title || "Project"}
          </div>
        }
        onClose={() => setShowStrategyDetails({ show: false })}
      />
    </>
  );
}
