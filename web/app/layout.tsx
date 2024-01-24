import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import WalletProvider from "./WalletProvider";
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
    <div className='flex w-full justify-between text-sm p-6 pb-2'>
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
          <main className='flex h-screen min-h-screen flex-col items-center'>
            <Header />
            <div className='flex flex-col w-full flex-grow overflow-y-auto'>
              {children}
            </div>
            <Footer />
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
