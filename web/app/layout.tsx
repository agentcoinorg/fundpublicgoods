import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import WalletProvider from "./WalletProvider";
import Main from "./main";
import AuthProvider from "@/components/Providers";
import Header from "./Header";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "fundpublicgoods.ai",
  description: "Fund Public Goods",
};

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className='flex flex-col w-full p-6 pt-2'>
      <div className='font-regular flex gap-x-[2px] text-[12px] text-indigo-800/70'>
        <span>a web3 agent by</span>
        <a
          className='underline font-semibold'
          href='https://blog.polywrap.io'
          target='_blank'
          rel='noopener noreferrer'>
          polywrap
        </a>
        <span>© {year}</span>
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
          <AuthProvider>
            <Main>
              <Header />
              {children}
              <Footer />
            </Main>
          </AuthProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
