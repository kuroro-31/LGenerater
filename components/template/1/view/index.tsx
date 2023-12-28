"use client";

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
      <ViewHeader />
    </div>
  );
}
