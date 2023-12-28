"use client";

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
      <EditHeader />
    </div>
  );
}
