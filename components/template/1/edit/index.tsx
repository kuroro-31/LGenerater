"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import EditHeader from "@/components/header/edit";
import { useWithAuth } from "@/hooks/useWithAuth";

export default function Edit1() {
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
      <EditHeader>
        <button className="bg-primary text-white px-6 py-2 rounded-full text-sm">
          ダウンロード
        </button>
      </EditHeader>
    </div>
  );
}
