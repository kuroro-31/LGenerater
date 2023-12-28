"use client";

import Image from "next/image";
import Link from "next/link";

import { useStore } from "@/store";

/*
|--------------------------------------------------------------------------
| ナビゲーション
|--------------------------------------------------------------------------
*/
const Header = () => {
  const { isLoggedIn, setLoggedIn } = useStore();

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <header className="w-full flex-none border-b border-comiee">
      <div className="py-4 lg:px-4 lg:border-0 mx-4 lg:mx-0">
        <div className="relative flex items-center">
          {/* ロゴ */}
          <Link
            href="/"
            className="flex-none md:overflow-hidden md:w-auto"
            passHref
          >
            <span className="sr-only">
              Startrade - Stock Trading Social Networking Service
            </span>
            <h1 className="dark:text-white">
              {/* <Logo /> */}
              <Image src="/logo.svg" width={50} height={22} alt="" />
            </h1>
          </Link>

          {/* メニュー */}
          <div className="flex items-center md:ml-auto">
            {isLoggedIn && (
              <button onClick={handleLogout} className="btn-border">
                ログアウト
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
