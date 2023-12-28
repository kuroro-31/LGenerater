"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { useWithAuth } from "@/hooks/useWithAuth";

export default function TopPage() {
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
      <Header />

      <main className="bg-[#f8f8f8] flex min-h-screen flex-col items-center justify-between p-24"></main>

      <Footer />
    </div>
  );
}
