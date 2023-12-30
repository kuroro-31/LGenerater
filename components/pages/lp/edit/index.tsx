"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import EditHeader from "@/components/header/edit";

export default function Edit({ id }) {
  const router = useRouter();

  // 未ログインの場合はログインページへ
  const isLoggedIn =
    typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") : null;
  if (!isLoggedIn) {
    router.push("/auth/login");
  }

  return (
    <div>
      <EditHeader>
        <Link href={`/lp/view/${id}`} className="text-sm">
          プレビュー
        </Link>
        <button className="ml-4 bg-primary text-white px-4 py-2 rounded-full text-[13px]">
          ダウンロード
        </button>
      </EditHeader>
    </div>
  );
}
