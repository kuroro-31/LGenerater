/*
|--------------------------------------------------------------------------
| テンプレート１ 表示画面
|--------------------------------------------------------------------------
*/
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ViewHeader from '@/components/header/view';
import { useWithAuth } from '@/hooks/useWithAuth';

export default function View1() {
  // すでにログインしてたらトップページへ
  const router = useRouter();
  const isLoggedIn = useWithAuth();
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth/login");
    }
  }, [isLoggedIn, router]);

  // デスクトップとモバイルの表示切り替え
  const [viewMode, setViewMode] = useState("mobile"); // 初期状態を'mobile'に設定

  return (
    <div className="">
      {/* ヘッダー */}
      <ViewHeader>
        <div className="flex items-center ml-auto mr-16">
          <button
            id="desktop"
            className="hover:text-primary cursor-pointer"
            onClick={() => setViewMode("desktop")}
          >
            <Image
              src={
                viewMode === "desktop" ? "/desktop-primary.svg" : "/desktop.svg"
              }
              alt="desktop"
              width={30}
              height={30}
            />
          </button>
          <div className="border-r border-[#20303c] h-[25px] mx-8 opacity-50"></div>
          <button
            id="mobile"
            className="hover:text-primary cursor-pointer"
            onClick={() => setViewMode("mobile")}
          >
            <Image
              src={
                viewMode === "mobile" ? "/mobile-primary.svg" : "/mobile.svg"
              }
              alt="mobile"
              width={20}
              height={30}
            />
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

      {/* メインコンテンツ */}
      <div className="w-full min-h-screen bg-[#eee] mt-[89px]">
        {/* デスクトップ */}
        {viewMode === "desktop" && (
          <div className="desktop-prev">
            <div className="desktop-prev__body"></div>
          </div>
        )}

        {/* モバイル */}
        {viewMode === "mobile" && (
          <div className="p-8">
            <div className="mobile-prev mx-auto">
              <div className="mobile-prev__body"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
