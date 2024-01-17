import React from "react";
import Prompt from "@/components/Prompt";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex p-12">
        <p className="fixed left-0 top-0 flex w-full justify-center pb-6 pt-8 backdrop-blur-2xl dark:from-inherit lg:static lg:w-auto lg:p-4">
          fundpublicgoods.ai
        </p>
      </div>
      <Prompt />
      <div className="my-10 p-4 border rounded-xl max-w-2xl w-full">
        <p>Here will be the response from the service...</p>
      </div>
      {/* <div className="fixed left-0 top-0 flex w-full justify-center pb-6 pt-8 backdrop-blur-2xl dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:p-4">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://polywrap.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/polywrap-logo.png"
              alt="Polywrap Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div> */}
    </main>
  );
}
