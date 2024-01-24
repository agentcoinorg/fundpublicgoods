import Button from "@/components/Button";

export default function Page() {
  return (
    <div className="flex flex-col py-12 w-full h-full items-center">
      <div className="w-3/5">
        <div>Great! I've setup the transactions for you below.</div>
        <div className="w-full py-6">
          <div className="h-full">
            <div className="pb-2">

            Transaction Overview
            </div>
            <div className="flex flex-col border p-5">
              <div className="flex justify-between flex-wrap w-full pb-4">
                <div className="flex flex-col">
                  <div>Sending</div>
                  <div>1000.00 USDC</div>
                  <div>View funding breakdown</div>
                </div>
                <div className="flex flex-col">
                  <div>Recipient</div>
                  <div>8 projects</div>
                </div>
              </div>
              <div className="border-t pb-4" />
              <div className="flex flex-wrap justify-between">
                  <div>Gas: 0.001295 ETH</div>
                  <div>i</div>
                </div>
            </div>
          </div>
        </div>
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
  );
}
