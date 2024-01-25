import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import WalletProvider from "./WalletProvider";
import Main from "./main";
import { Logo } from "@/components/Logo";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "fundpublicgoods.ai",
  description: "Fund Public Goods",
};

function Header() {
  return (
    <div className='flex w-full justify-between text-sm px-6 py-4 bg-indigo-300/80 border-b-2 border-indigo-400/20'>
      <a href='/' className='flex hover:opacity-80'>
        <Logo size={160} />
      </a>
    </div>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className='flex flex-col w-full p-6 pt-2'>
      <div className='flex gap-x-1 text-[10px]'>
        <span className='font-regular text-indigo-800'>built by</span>
        <a
          className='underline font-semibold'
          href='https://polywrap.io'
          target='_blank'
          rel='noopener noreferrer'>
          polywrap
        </a>
        <span className='font-regular text-indigo-800'>© {year}</span>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={sans.className}>
        <WalletProvider>
          <Main>
            <Header />
            {children}
            <Footer />
          </Main>
        </WalletProvider>
      </body>
    </html>
  );
}
