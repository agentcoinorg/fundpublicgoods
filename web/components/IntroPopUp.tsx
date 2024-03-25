"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { SparkleIcon } from "./Icons";
import { Dispatch, SetStateAction } from "react";

interface IntroPopupProps {
  setShowIntro: Dispatch<SetStateAction<boolean>>;
}

const IntroPopUp = ({ setShowIntro }: IntroPopupProps) => {
  const handleClose = () => {
    setShowIntro(false);
    localStorage.setItem("introClosed", "true");
  };

  return (
    <div className='fixed bottom-16 left-1/2 transform -translate-x-1/2 max-w-screen-md w-[calc(100%-48px)] z-10'>
      <X
        onClick={handleClose}
        className='absolute top-3 right-3 text-indigo-800 hover:text-indigo-500 cursor-pointer'
        size={20}
        weight='bold'
      />
      <div className='p-6 bg-indigo-25 rounded-2xl border-2 border-indigo-200 space-y-1 shadow-md shadow-primary-shadow/20'>
        <div className='flex items-center'>
          <SparkleIcon size={24} className='transform -translate-x-1' />
          <div className='text-lg font-bold'>
            Welcome to fundpublicgoods.ai!
          </div>
        </div>
        <div className='text-[14px] leading-relaxed'>
          This is a proof-of-concept to showcase the potential of AI agents to
          assist users with complex transactions. Give it a try and let us know
          what you think!
        </div>
      </div>
    </div>
  );
};

export default IntroPopUp;
