"use client";

import Dropdown from "@/components/Dropdown";
import { Logo } from "@/components/Logo";
import truncateEthAddress from "@/utils/ethereum/truncateAddress";
import { CaretDown, Link } from "@phosphor-icons/react";
import { useConnectWallet } from "@web3-onboard/react";
import Image from "next/image";
import { useState } from "react";

function Header() {
  const [{ wallet }] = useConnectWallet();
  const [showDropdownMenu, setShowDropdownMenu] = useState<boolean>(false);

  const handleClick = () => {
    setShowDropdownMenu(!showDropdownMenu);
  };

  return (
    <div className='flex w-full justify-between text-sm px-6 py-4 bg-indigo-300/80 border-b-2 border-indigo-400/20'>
      <a href='/' className='flex'>
        <Logo size={160} />
      </a>
      {wallet && (
        <div className='relative'>
          <div
            onClick={handleClick}
            className='text-indigo-600 hover:text-indigo-800 font-bold text-sm cursor-pointer flex space-x-1 items-center p-1 rounded-md hover:bg-indigo-500/20'>
            <div>
              {wallet.accounts[0]?.ens?.name ? (
                <div className='flex items-center space-x-2'>
                  {wallet.accounts[0]?.ens?.avatar && (
                    <Image
                      className='min-w-[20px] h-5 rounded-full object-fit bg-white'
                      src={wallet.accounts[0]?.ens?.avatar.toString()}
                      alt={wallet.accounts[0]?.ens?.name}
                      width={20}
                      height={20}
                    />
                  )}
                  <div>{wallet.accounts[0]?.ens?.name}</div>
                </div>
              ) : (
                <div>{truncateEthAddress(wallet.accounts[0].address)}</div>
              )}
            </div>
            <CaretDown weight='bold' />
          </div>
          {showDropdownMenu && <div className='absolute top-[calc(100%+8px)] right-0 z-10'>
            <div className='bg-indigo-50 rounded-2xl border-2 border-indigo-300 space-y-2 p-3 shadow-xl shadow-primary-shadow/20'>
              <div className='p-2 flex items-center space-x-2 hover:bg-white cursor-pointer w-full rounded-xl'>
                <Link size={16} weight='bold' className='min-w-[16px]' />
                <div className='whitespace-nowrap'>
                  Disconnect Wallet
                </div>
              </div>
            </div>
          </div>}
        </div>
      )}
    </div>
  );
}

export default Header;
