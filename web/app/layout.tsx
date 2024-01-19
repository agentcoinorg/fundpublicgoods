import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "fundpublicgoods.ai",
  description: "Fund Public Goods",
};

function Header() {
  return (
    <div className="flex w-full justify-between text-sm p-6 border-b border-zinc-700">
      <p className="pl-5">fundpublicgoods.ai</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="flex flex-col w-full border-t border-zinc-700 pl-5 pt-4">
      <div className="flex gap-x-1.5">
        built by
        <a href="https://polywrap.io" target="_blank" rel="noopener noreferrer">
          polywrap
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
    <html lang="en">
      <body className={inter.className}>
        <main className="flex h-screen flex-col items-center">
          <Header />
          <div className="flex flex-col w-full h-5/6 overflow-y-auto">
            {children}
          </div>
          <Footer />
        </main>
      </body>
    </html>
  );
}
