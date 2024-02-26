"use client";

import { SubstackLogo, XLogo } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import truncateEthAddress from "@/utils/ethereum/truncateAddress";
import { CaretDown, DiscordLogo, Link } from "@phosphor-icons/react";
import { useConnectWallet } from "@web3-onboard/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function Header() {
  const [{ wallet }, _, disconnect] = useConnectWallet();
  const [showDropdownMenu, setShowDropdownMenu] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const current = dropdownRef.current;
      if (current && !current.contains(event.target as Node)) {
        setShowDropdownMenu(false);
      }
    }

    // Bind the event listener
    if (showDropdownMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Unbind the event listener on clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdownMenu]);

  return (
    <div className='flex w-full justify-between text-sm px-6 py-4 bg-indigo-300/80 border-b-2 border-indigo-400/20'>
      <a href='/' className='flex'>
        <Logo
          size={160}
          wordmark={!isMobile}
          className='max-sm:bg-white max-sm:rounded-full max-sm:flex max-sm:justify-center max-sm:min-w-[28px]'
        />
      </a>
      <div className='space-x-4 flex items-center'>
        <div className='space-x-3 flex items-center'>
          <a
            href='https://discord.com/invite/Z5m88a5qWu'
            target='_blank'
            rel='noredirect'
            className='flex items-center justify-center rounded-full bg-indigo-400/40 p-1 hover:bg-indigo-100 transition-colors duration-300 ease-in-out text-indigo-600 hover:text-indigo-800'>
            <DiscordLogo size={16} weight='bold' />
          </a>
          <a
            href='https://x.com/polywrap_io'
            target='_blank'
            rel='noredirect'
            className='flex items-center justify-center rounded-full bg-indigo-400/40 p-1 hover:bg-indigo-100 transition-colors duration-300 ease-in-out text-indigo-600 hover:text-indigo-800'>
            <XLogo size={16} />
          </a>
          <a
            href='https://blog.polywrap.io/'
            target='_blank'
            rel='noredirect'
            className='flex items-center justify-center rounded-full bg-indigo-400/40 p-1 hover:bg-indigo-100 transition-colors duration-300 ease-in-out text-indigo-600 hover:text-indigo-800'>
            <SubstackLogo size={16} />
          </a>
        </div>
        {wallet && (
          <div className='relative' ref={dropdownRef}>
            <div
              onClick={() => setShowDropdownMenu((current) => !current)}
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
            {showDropdownMenu ? (
              <div className='absolute top-[calc(100%+8px)] right-0 z-10'>
                <div className='bg-indigo-50 rounded-2xl border-2 border-indigo-300 space-y-2 p-3 shadow-xl shadow-primary-shadow/20'>
                  <div
                    className='p-2 flex items-center space-x-2 hover:bg-white cursor-pointer w-full rounded-xl'
                    onClick={() => {
                      disconnect(wallet);
                      setShowDropdownMenu(!showDropdownMenu);
                    }}>
                    <Link size={16} weight='bold' className='min-w-[16px]' />
                    <div className='whitespace-nowrap'>Disconnect Wallet</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
