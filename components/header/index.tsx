/*
|--------------------------------------------------------------------------
| デフォルトのヘッダー
|--------------------------------------------------------------------------
*/
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useStore } from "@/store";

const Header = () => {
  const router = useRouter();

  const { setLoggedIn } = useStore();
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    router.push("/auth/login");
  };

  return (
    <header className="w-full flex-none border-b border-comiee">
      <div className="container mx-auto py-4">
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
          <div className="flex items-center md:ml-auto">
            {isLoggedIn && (
              <div className="">
                <Link href="/campaign/jp/1" className="btn">
                  LPを作成
                </Link>
                <button onClick={handleLogout} className="btn-border">
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
