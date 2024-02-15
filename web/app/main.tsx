"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import useSession from "@/hooks/useSession";

export default function Main({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  return (
    <main
      className={clsx(
        "flex h-screen min-h-screen flex-col items-center",
        pathname === "/"
          ? "bg-gradient-to-b from-indigo-200 to-indigo-100"
          : "bg-gradient-to-b from-indigo-100 via-indigo-25 via-40% to-white"
      )}>
      <div className='flex flex-col w-full flex-grow overflow-y-auto'>
        {status === "loading" ? <></>: children}
      </div>
    </main>
  );
}
