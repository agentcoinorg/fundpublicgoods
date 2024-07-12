import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import WalletProvider from "./WalletProvider";
import Main from "./main";
import AuthProvider from "@/components/Providers";
import Header from "./Header";
import { ToastContainer } from "react-toastify";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "fundpublicgoods.ai",
  description: "Fund Public Goods",
};

function Footer() {
  return (
    <footer className='flex flex-col w-full p-6 pt-2'>
      <div className='font-regular flex gap-x-[2px] text-[12px] text-indigo-800/70'>
        <span>Built by </span>
        <a
          className='underline font-semibold'
          href='https://agentcoin.org'
          target='_blank'
          rel='noopener noreferrer'>
          Agentcoin
        </a>
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
              <ToastContainer />
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
