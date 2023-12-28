"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import ViewHeader from "@/components/header/view";
import { useWithAuth } from "@/hooks/useWithAuth";

export default function View1() {
  const router = useRouter();

  // すでにログインしてたらトップページへ
  const isLoggedIn = useWithAuth();
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth/login");
    }
  }, [isLoggedIn, router]);

  return (
    <div className="">
      <ViewHeader>
        <div className="flex items-center ml-auto mr-16">
          <button id="desktop" className="hover:text-primary cursor-pointer">
            <Image src="/desktop.svg" alt="desktop" width={30} height={30} />
          </button>
          <div className="border-r border-[#20303c] h-[25px] mx-8 opacity-50"></div>
          <button id="mobile" className="hover:text-primary cursor-pointer">
            <Image src="/mobile.svg" alt="mobile" width={20} height={30} />
          </button>
        </div>

        <div className="mr-8">
          「編集」をクリックして、HTMLをダウンロードしましょう
        </div>

        <Link
          href="/template/1/edit"
          passHref
          className="bg-primary text-white rounded-full px-6 py-2"
        >
          編集
        </Link>
      </ViewHeader>

      <div className="w-full min-h-screen bg-[#eee]">
        {/* デスクトップ */}

        {/* モバイル */}
        <div className="p-8">
          <div className="mobile-prev mx-auto">
            <div className="mobile-prev__body"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
