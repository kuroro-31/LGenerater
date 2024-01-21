/*
|--------------------------------------------------------------------------
| トップページ
|--------------------------------------------------------------------------
*/
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Footer from '@/components/footer';
import Header from '@/components/header';
import Loading from '@/components/loading';
import { Website } from '@/types/website';

export default function TopPage() {
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

  // LP一覧のデータを取得
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false); // loadingフラグを追加
  useEffect(() => {
    setLoading(true); // データ取得前にloadingをtrueに
    fetch("/api/website/getAll")
      .then((response) => response.json())
      .then((data) => {
        setWebsites(data);
        setLoading(false); // データ取得後にloadingをfalseに
      });
  }, []);

  return (
    <div>
      <Header />

      <div className="w-full bg-[#f8f8f8]">
        <div className="mb-8 flex items-center bg-white">
          <h3 className="container text-xl p-8">テンプレートの一覧</h3>
        </div>
        <div className="container mx-auto flex min-h-screen flex-col py-8">
          {loading ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <div className="flex flex-wrap justify-between">
              {/* LP一覧 */}
              {websites.map((website) => (
                <div key={website.id} className="w-1/3 mb-8">
                  <div className="relative">
                    <Image
                      src={"https://placehold.jp/412x230.png"}
                      alt={website.title}
                      width={410}
                      height={230}
                    />
                    <div className="opacity-0 hover:opacity-100 z-50 absolute top-0 left-0 w-[410px] h-[230px]">
                      <div className="relative w-full h-full">
                        <div className="absolute opacity-50 bg-white w-full h-full"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <Link
                            href={`/lp/edit/${website.id}`}
                            className="text-white hover:opacity-80 bg-primary rounded-full py-2 px-6 mb-4 cursor-pointer block"
                          >
                            編集
                          </Link>
                          <Link
                            href={`/lp//view/${website.id}`}
                            className="text-primary bg-white hover:bg-primary hover:text-white border-primary rounded-full py-2 px-6 cursor-pointer block"
                          >
                            表示
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h4 className="mt-4">{website.title}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
