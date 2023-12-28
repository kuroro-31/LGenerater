"use client";

import Image from "next/image";
import Link from "next/link";
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
      <h2 className="text-2xl bg-white p-12 border-b">
        LPテンプレートを選択してください
      </h2>
      <main className="bg-[#f8f8f8] flex min-h-screen flex-col p-12">
        <div className="">
          <div className="">
            <h3 className="mb-8 text-xl">すべてのテンプレート</h3>
            <div className="flex flex-wrap justify-between">
              <div className="w-1/3 mb-8">
                <div className="relative">
                  <Image
                    src={"https://placehold.jp/412x230.png"}
                    alt={"テンプレート名"}
                    width={410}
                    height={230}
                  />
                  <div className="opacity-0 hover:opacity-100 z-50 absolute top-0 left-0 w-[410px] h-[230px]">
                    <div className="relative w-full h-full">
                      <div className="absolute opacity-50 bg-white w-full h-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Link
                          href="/template/1/edit"
                          className="text-white hover:opacity-80 text-lg bg-primary rounded-full py-2 px-6 mb-4 cursor-pointer block"
                        >
                          編集
                        </Link>
                        <Link
                          href="/template/1/view"
                          className="text-primary bg-white hover:bg-primary hover:text-white text-lg border-primary rounded-full py-2 px-6 cursor-pointer block"
                        >
                          表示
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="mt-4">割引キャンペーン</h4>
              </div>
              <div className="w-1/3 mb-8">
                <div className="relative">
                  <Image
                    src={"https://placehold.jp/412x230.png"}
                    alt={"テンプレート名"}
                    width={410}
                    height={230}
                  />
                  <div className="opacity-0 hover:opacity-100 z-50 absolute top-0 left-0 w-[410px] h-[230px]">
                    <div className="relative w-full h-full">
                      <div className="absolute opacity-50 bg-white w-full h-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Link
                          href="/template/2/edit"
                          className="text-white hover:opacity-80 text-lg bg-primary rounded-full py-2 px-6 mb-4 cursor-pointer block"
                        >
                          編集
                        </Link>
                        <Link
                          href="/template/2/view"
                          className="text-primary bg-white hover:bg-primary hover:text-white text-lg border-primary rounded-full py-2 px-6 cursor-pointer block"
                        >
                          表示
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="mt-4">クーポン</h4>
              </div>
              <div className="w-1/3 mb-8">
                <div className="relative">
                  <Image
                    src={"https://placehold.jp/412x230.png"}
                    alt={"テンプレート名"}
                    width={410}
                    height={230}
                  />
                  <div className="opacity-0 hover:opacity-100 z-50 absolute top-0 left-0 w-[410px] h-[230px]">
                    <div className="relative w-full h-full">
                      <div className="absolute opacity-50 bg-white w-full h-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Link
                          href="/template/3/edit"
                          className="text-white hover:opacity-80 text-lg bg-primary rounded-full py-2 px-6 mb-4 cursor-pointer block"
                        >
                          編集
                        </Link>
                        <Link
                          href="/template/3/view"
                          className="text-primary bg-white hover:bg-primary hover:text-white text-lg border-primary rounded-full py-2 px-6 cursor-pointer block"
                        >
                          表示
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="mt-4">ポイントバック</h4>
              </div>
              <div className="w-1/3 mb-8">
                <div className="relative">
                  <Image
                    src={"https://placehold.jp/412x230.png"}
                    alt={"テンプレート名"}
                    width={410}
                    height={230}
                  />
                  <div className="opacity-0 hover:opacity-100 z-50 absolute top-0 left-0 w-[410px] h-[230px]">
                    <div className="relative w-full h-full">
                      <div className="absolute opacity-50 bg-white w-full h-full"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Link
                          href="/template/4/edit"
                          className="text-white hover:opacity-80 text-lg bg-primary rounded-full py-2 px-6 mb-4 cursor-pointer block"
                        >
                          編集
                        </Link>
                        <Link
                          href="/template/4/view"
                          className="text-primary bg-white hover:bg-primary hover:text-white text-lg border-primary rounded-full py-2 px-6 cursor-pointer block"
                        >
                          表示
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="mt-4">プレゼント</h4>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
