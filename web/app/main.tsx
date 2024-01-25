"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Main({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main
      className={clsx(
        "flex h-screen min-h-screen flex-col items-center",
        pathname === "/"
          ? "bg-gradient-to-br from-indigo-200 to-indigo-300"
          : "bg-white"
      )}>
      <div className='flex flex-col w-full flex-grow overflow-y-auto'>
        {children}
      </div>
    </main>
  );
}
