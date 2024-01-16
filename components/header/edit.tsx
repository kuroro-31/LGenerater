/*
|--------------------------------------------------------------------------
| テンプレート編集画面のヘッダー
|--------------------------------------------------------------------------
*/
"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface ViewHeaderProps {
  children: ReactNode;
}

const EditHeader = ({ children }: ViewHeaderProps) => {
  return (
    <header className="fixed top-0 w-full flex-none border-b bg-white z-10">
      <div className="py-1.5 lg:px-4 lg:border-0 mx-4 lg:mx-0">
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
          <div className="w-full flex items-center">{children}</div>
        </div>
      </div>
    </header>
  );
};

export default EditHeader;
