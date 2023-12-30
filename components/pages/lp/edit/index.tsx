/*
|--------------------------------------------------------------------------
| テンプレート１ 編集画面
|--------------------------------------------------------------------------
*/
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import EditHeader from "@/components/header/edit";

export default function Edit() {
  // 未ログインの場合はログインページへ
  const router = useRouter();
  useEffect(() => {
    const checkLoginStatus = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (!isLoggedIn) {
        router.push("/auth/login");
      }
    };
    checkLoginStatus();
  }, [router]);

  return (
    <div className="">
      <EditHeader>
        <button className="bg-primary text-white px-6 py-2 rounded-full text-sm">
          ダウンロード
        </button>
      </EditHeader>
    </div>
  );
}
