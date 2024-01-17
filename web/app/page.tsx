"use client"

import Image from 'next/image'
import React, { useState } from 'react'

export default function Home() {
  const [prompt, setPrompt] = useState<string>()
  const [submitted, setSubmitted] = useState<boolean>(false)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center pb-6 pt-8 backdrop-blur-2xl dark:from-inherit lg:static lg:w-auto lg:p-4">
          fundpublicgoods.ai
        </p>
        <div className="fixed left-0 top-0 flex w-full justify-center pb-6 pt-8 backdrop-blur-2xl dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:p-4">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://polywrap.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
            <Image
              src="/polywrap-logo.png"
              alt="Polywrap Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>
      <div className="input-section mb-4" style={{ width: '40%' }}>
        <input
          type="text"
          className="border p-2 rounded-xl w-full bg-gray-800 text-white placeholder-gray-400"
          placeholder="What do you want to fund?"
          onChange={(e) => setPrompt(e.target.value)}
          disabled={submitted}
        />
      </div>
      <div className="examples-section my-4" style={{ display: 'flex', flexDirection: 'column', width: '25%' }}>
        <div className="example-item mb-2">
          <p>Climate change and environmental research.</p>
        </div>
        <div className="example-item mb-2">
          <p>Zero-knowledge and privacy preserving technologies.</p>
        </div>
        <div className="example-item mb-2">
          <p>Blockchain scalability.</p>
        </div>
        <div className="example-item mb-2">
          <p>IRL coworking and coliving spaces.</p>
        </div>
      </div>
      <div className="launch-button-section my-4">
        <button
          className="border px-4 py-2 bg-blue-500 text-white rounded-xl"
          onClick={() => setSubmitted(true)}
        >
          Launch
        </button>
      </div>
      <div className="response-section my-10 p-4 border rounded-xl max-w-2xl w-full">
        <p>Here will be the response from the service...</p>
      </div>
    </main>
  )
}
