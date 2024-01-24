"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import EditHeader from "@/components/header/edit";
import Loading from "@/components/loading";
import { Website } from "@/types/website";

import Editor from "./editor";

export default function Edit({ id }) {
  const router = useRouter();

  // 未ログインの場合はログインページへ
  const isLoggedIn =
    typeof window !== "undefined" ? localStorage.getItem("isLoggedIn") : null;
  if (!isLoggedIn) {
    router.push("/auth/login");
  }

  // サイトメニュー
  const [isHovered, setIsHovered] = useState(false);
  // 現在ホバーされているメニューのIDを保持するステート
  const [hoveredMenuId, setHoveredMenuId] = useState(null);
  // 削除モーダル
  const [isModalOpen, setIsModalOpen] = useState(false);

  // サイトを削除する
  const handleDelete = async () => {
    const response = await fetch("/api/website/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      // 削除が成功したらトップページへ遷移
      router.push("/");
    } else {
      // エラーハンドリング
      console.error("削除に失敗しました");
    }
  };

  // IDからウェブサイトを取得する
  const [website, setWebsite] = useState<Website | null>(null); // ウェブサイトの型を指定
  const [loading, setLoading] = useState(false); // loadingフラグを追加
  useEffect(() => {
    const fetchWebsite = async () => {
      setLoading(true); // データ取得前にloadingをtrueに
      if (id) {
        const response = await fetch(`/api/website/${id}`);
        const data: Website = await response.json();
        setWebsite(data); // 取得したデータがウェブサイトの型であることを指定
        setInputValue(data.title); // 取得したウェブサイトのタイトルを入力値に設定
        setLoading(false); // データ取得後にloadingをfalseに
      }
    };

    fetchWebsite();
  }, [id]);

  // IDからウェブサイトを更新する
  // IMEの入力セッションが終了したときにのみupdateWebsiteTitleを呼び出す
  const [isComposing, setIsComposing] = useState(false);
  const [inputValue, setInputValue] = useState(""); // 入力値を保持するステートを追加

  // 保存の状態を管理するステート
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // IDからタイトルを更新する
  const updateWebsiteTitle = async (newTitle: string) => {
    setSaving(true); // 保存を開始
    const response = await fetch(`/api/website/updateTitle/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newTitle }),
    });

    if (response.ok) {
      setWebsite((prevWebsite) =>
        prevWebsite ? { ...prevWebsite, title: newTitle } : null
      );
      setSaved(true); // 保存が完了
      setTimeout(() => setSaved(false), 2000); // 2秒後にメッセージを消す
    } else {
      console.error("更新に失敗しました");
    }
    setSaving(false); // 保存を終了
  };

  // ダウンロード機能
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const handleDownload = (lang: string) => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        website?.localizedHtml.find((html) => html.language === lang)
          ?.content || "",
      ],
      { type: "text/html" }
    );
    element.href = URL.createObjectURL(file);
    element.download = "index.html";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="relative min-h-screen">
      {isModalOpen && (
        <div className="w-full min-h-screen max-h-screen fixed z-[9999] top-0 left-0 right-0 bottom-0 p-4 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6">
            <div className="text-lg">本当に削除してもよろしいですか？</div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleDelete}
                className="bg-[#ff4f4f] text-white rounded-lg px-6 py-2 outline-none"
              >
                削除
              </button>
              <button onClick={() => setIsModalOpen(false)} className="ml-4">
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {isDownloadModalOpen && (
        <div className="w-full min-h-screen max-h-screen fixed z-[9999] top-0 left-0 right-0 bottom-0 p-4 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6">
            <div className="text-lg">
              どの言語のHTMLをダウンロードしますか？
            </div>
            <div className="flex justify-around mt-6">
              {["JP", "EN", "TW", "CN"].map((lang) => (
                <button
                  onClick={() => handleDownload(lang)}
                  className="text-primary border border-primary rounded-lg px-6 py-2 outline-none"
                >
                  {lang}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsDownloadModalOpen(false)}
              className="mt-4"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      <EditHeader>
        <div className="ml-6">
          <div className="flex items-center">
            {/* LPタイトル */}
            <input
              id="lp-title"
              type="text"
              value={inputValue} // 入力値を保持するステートを使用
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={(e) => {
                setIsComposing(false);
                updateWebsiteTitle(e.target.value);
              }}
              onChange={(e) => {
                setInputValue(e.target.value); // 入力が変更されたときに入力値を保持するステートを更新
                if (!isComposing) {
                  updateWebsiteTitle(e.target.value);
                }
              }}
              placeholder="読み込み中..."
              className="font-bold border border-white hover:border-[#ccc] rounded py-1.5 px-3"
            />

            {saving && (
              <div className="ml-4 text-xs text-gray-500">
                保存しています...
              </div>
            )}
            {saved && (
              <div className="ml-4 text-xs text-gray-500">保存しました</div>
            )}
          </div>
        </div>
        <div className="ml-auto flex items-center">
          {/* サイトメニュー */}
          <div className="relative">
            {/* タイトル */}
            <div
              className="text-[13px] cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              サイト
            </div>
            {/* 本文 */}
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`${
                isHovered ? "block" : "hidden"
              } absolute top-0 left-[-150px] bg-white z-50 rounded-lg shadow-lg p-6 transition-all`}
            >
              {/* 子メニュー */}
              <div className="flex">
                {/* タイトル */}
                <div className="w-1/2 pr-8">
                  {/* 削除 */}
                  <button
                    onMouseEnter={() => setHoveredMenuId(2)}
                    onMouseLeave={() => setHoveredMenuId(null)}
                    onClick={() => setIsModalOpen(true)} // 追加
                    className="whitespace-nowrap text-sm cursor-pointer hover:text-primary pt-1.5 pb-4 border-b"
                  >
                    サイトをゴミ箱に移動
                  </button>

                  <Link
                    href="/"
                    onMouseEnter={() => setHoveredMenuId(3)}
                    onMouseLeave={() => setHoveredMenuId(null)}
                    className="block whitespace-nowrap text-sm cursor-pointer hover:text-primary pt-4 pb-1.5"
                  >
                    エディタを終了
                  </Link>
                </div>
                {/* 本文 */}
                <div className="w-1/2 bg-[#e7f0ffcc] min-w-[150px] min-h-[200px] rounded-md p-4">
                  <div className={hoveredMenuId === 2 ? "" : "hidden"}>
                    <h3 className="text-sm mb-2">
                      サイトをサービス上から削除します
                    </h3>
                    <p className="text-[13px] font-thin">
                      このサイトをサービス上から削除します。削除したサイトは復元できません。
                    </p>
                  </div>
                  <div className={hoveredMenuId === 3 ? "" : "hidden"}>
                    <h3 className="text-sm mb-2">エディタを終了</h3>
                    <p className="text-[13px] font-thin">
                      サイトを保存し、エディタを終了します。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Link
            href={`/lp/view/${id}`}
            className="inline-block ml-6 text-[13px]"
          >
            プレビュー
          </Link>
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="ml-6 bg-primary text-white px-4 py-2 rounded-full text-[13px]"
          >
            ダウンロード
          </button>
        </div>
      </EditHeader>

      {/* エディタ */}
      {loading ? (
        <div className="mt-[50px] w-full h-[500px] flex items-center justify-center">
          <Loading />
        </div>
      ) : (
        website && <Editor website={website} />
      )}
    </div>
  );
}
