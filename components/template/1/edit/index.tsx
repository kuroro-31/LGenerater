/*
|--------------------------------------------------------------------------
| テンプレート１ 編集画面
|--------------------------------------------------------------------------
*/
"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import EditHeader from '@/components/header/edit';
import { useStore } from '@/store';

export default function Edit1() {
  // 未ログインの場合はログインページへ
  const router = useRouter();
  const { isLoggedIn } = useStore();
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/auth/login");
    }
  }, [isLoggedIn, router]);

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
