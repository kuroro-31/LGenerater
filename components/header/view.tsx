/*
|--------------------------------------------------------------------------
| テンプレート表示画面のヘッダー
|--------------------------------------------------------------------------
*/
"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface ViewHeaderProps {
  children: ReactNode;
}
const ViewHeader = ({ children }: ViewHeaderProps) => {
  return (
    <header className="w-full flex-none border-b fixed bg-white top-0 z-50">
      <div className="container mx-auto py-6">
        <div className="relative flex items-center">
          {/* ロゴ */}
          <Link
            href="/"
            className="flex-none md:overflow-hidden md:w-auto"
            passHref
          >
            <span className="sr-only">LIX</span>
            <h1 className="dark:text-white">
              {/* <Logo /> */}
              <Image src="/logo.svg" width={50} height={22} alt="" />
            </h1>
          </Link>

          {/* メニュー */}
          {children}
        </div>
      </div>
    </header>
  );
};

export default ViewHeader;
