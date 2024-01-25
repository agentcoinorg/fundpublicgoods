"use client";

import { useState } from "react";
import FundingTable from "./FundingTable";
import Button from "./Button";
import clsx from "clsx";

const mockData = [
  {
    amount: "1000",
    project: {
      description: "Cool Project",
      recipient: "0x123123123123123",
      name: "Cool",
    },
  },
  {
    amount: "1000",
    project: {
      description: "Cool Project",
      recipient: "0x123123123123123",
      name: "Cool",
    },
  },
  {
    amount: "1000",
    project: {
      description: "Cool Project",
      recipient: "0x123123123123123",
      name: "Cool",
    },
  },
  {
    amount: "1000",
    project: {
      description: "Cool Project",
      recipient: "0x123123123123123",
      name: "Cool",
    },
  },
  {
    amount: "1000",
    project: {
      description: "Cool Project",
      recipient: "0x123123123123123",
      name: "Cool",
    },
  },
  {
    amount: "1000",
    project: {
      description: "Cool Project",
      recipient: "0x123123123123123",
      name: "Cool",
    },
  },
];

export default function FundingReview() {
  const [showBreakdown, setShowBreakdown] = useState(false);
  return (
    <div className={clsx("flex flex-col py-12 w-full items-center", !showBreakdown && "h-full")}>
      <div className="w-3/5">
        <div>Great! I've setup the transactions for you below.</div>
        <div className="w-full py-6">
          <div>
            <div className="pb-2">Transaction Overview</div>
            <div className="flex flex-col border border-white rounded p-5 gap-4">
              <div className="flex justify-between flex-wrap w-full">
                <div className="flex flex-col">
                  <div className="font-normal">Sending</div>
                  <div className="text-2xl font-normal">1000.00 USDC</div>
                  <div
                    className="font-normal pt-2 hover:cursor-pointer"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                  >
                    View funding breakdown
                  </div>
                </div>
                <div className="pt-7">{"->"}</div>
                <div className="flex flex-col">
                  <div className="font-normal">Recipient</div>
                  <div className="text-2xl font-normal">8 projects</div>
                </div>
              </div>
              {showBreakdown && <FundingTable fundingEntries={mockData} />}
              <div className="border-t border-black" />
              <div className="flex flex-wrap justify-between">
                <div>Gas: 0.001295 ETH</div>
                <div>i</div>
              </div>
            </div>
          </div>
        </div>
        <div>Edit</div>
        <div>
          <div className="flex flex-wrap justify-between w-full">
            <div className="flex flex-col">
              <div>Funding 8 projects</div>
              <div className="text-[12px] text-slate-500">
                With a total funding of 1000 USDC
              </div>
            </div>
            <Button>Submit</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
