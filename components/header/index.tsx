/*
|--------------------------------------------------------------------------
| デフォルトのヘッダー
|--------------------------------------------------------------------------
*/
"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Header = () => {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedInStatus === "true");
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    router.push("/auth/login");
  };

  const createWebsite = async () => {
    const response = await axios.post("/api/createWebsite");
    const website = response.data;
    router.push(`/edit/${website.id}`);
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
                <button className="btn" onClick={createWebsite}>
                  LPを作成
                </button>
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
