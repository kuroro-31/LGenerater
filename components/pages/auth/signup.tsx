"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

// サインアップ
const Singup = () => {
  const router = useRouter();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [emailValue, setEmailValue] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);

  // プログレスバーと背景の状態管理
  const [loading, setLoading] = useState(false);
  const [progressDisplay, setProgressDisplay] = useState("none");
  const [overlayVisible, setOverlayVisible] = useState(true);

  const [errorToast, setErrorToast] = useState({ open: false, message: "" });

  // ローディング状態に応じてプログレスバーと背景の表示を切り替え
  useEffect(() => {
    if (loading) {
      setProgressDisplay("block");
      setOverlayVisible(false);
    } else {
      setProgressDisplay("none");
      setOverlayVisible(true);
    }
  }, [loading]);

  // 送信
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // トップページに遷移
    router.push("/");

    setLoading(false);
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-full max-w-[450px] mx-4 md:mx-auto bg-white dark:bg-dark rounded border dark:lg:border-2 border-b-l-c dark:border-dark dark:lg:border-dark-1 overflow-hidden">
        <div
          id="overlay"
          className={`fixed inset-0 bg-white z-[999] dark:bg-dark opacity-50 ${
            loading ? "" : "hidden"
          }`}
        ></div>
        <div className={`progress ${loading ? "" : "hidden"}`}>
          <div className="color"></div>
        </div>
        <div className="flex justify-center mt-12 px-10">
          <Link
            href="/"
            className="flex-none md:overflow-hidden md:w-auto"
            passHref
          >
            <span className="sr-only">
              Supatrade - trading predict platform
            </span>
            <h1 className="text-2xl font-bold dark:text-white">
              <Image src="/sm_logo.png" width={50} height={50} alt="Comiee" />
            </h1>
          </Link>
        </div>
        <h2 className="text-2xl flex justify-center mt-4 px-10 dark:text-f5">
          アカウントを作成
        </h2>
        <form
          onSubmit={onSubmit}
          id="sendForm"
          method="POST"
          action="/register"
          className="dark:bg-dark mt-8 px-6 lg:px-10 pb-0"
        >
          <div className="relative mb-4">
            <input
              ref={emailRef}
              id="email"
              type="text"
              name="email"
              className={`input-field w-full p-4 border-transparent rounded bg-white dark:bg-dark-1 focus:border-[3px] focus:border-primary transition-all ${
                emailValue && "has-value"
              }`}
              required
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
            <label
              htmlFor="email"
              className={`label absolute top-[5px] left-[10px] text-gray-500 transition-all duration-200 dark:text-f5 ${
                emailValue || emailFocused ? "label-focused" : ""
              }`}
            >
              メールアドレス
            </label>
            <div className="border-wrapper absolute top-0 left-0 w-full h-full border border-b-l-c dark:border-none rounded pointer-events-none"></div>
          </div>

          <div className="relative">
            <input
              ref={passwordRef}
              id="password"
              type="password"
              name="password"
              className={`input-field w-full p-4 border-transparent rounded bg-white dark:bg-dark-1 focus:border-[3px] focus:border-primary transition-all ${
                passwordValue && "has-value"
              }`}
              required
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <label
              htmlFor="password"
              className={`label absolute top-[5px] left-[10px] text-gray-500 transition-all duration-200 dark:text-f5 ${
                passwordValue || passwordFocused ? "label-focused" : ""
              }`}
            >
              パスワード
            </label>
            <div className="border-wrapper absolute top-0 left-0 w-full h-full border border-b-l-c dark:border-none rounded pointer-events-none"></div>
          </div>

          <div className="flex justify-between items-center mt-6 mb-8 lg:mb-12">
            <Link
              href="/auth/login"
              className="inline-block cursor-pointer text-primary dark:hover:text-ddd"
            >
              またはログイン
            </Link>
            <span className="relative">
              <Button type="submit" variant="default">
                次へ
              </Button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Singup;
