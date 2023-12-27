"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

// ログイン
const Login = () => {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [progressDisplay, setProgressDisplay] = useState("none");
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [buttonClass, setButtonClass] = useState("");

  const [emailValue, setEmailValue] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    if (loading) {
      setProgressDisplay("block");
      setOverlayVisible(false);
      setButtonClass("activeLoading");
    } else {
      setProgressDisplay("none");
      setOverlayVisible(true);
      setButtonClass("");
    }
  }, [loading]);

  // 送信
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // トップページ遷移
    router.push("/");

    // setLoading(false);
  };

  return (
    <div>
      <div className="w-full h-screen flex justify-center items-center">
        <div className="relative sendFormBox w-full max-w-[450px] mx-4 md:mx-auto bg-white dark:bg-dark rounded border dark:lg:border-2 border-b-l-c dark:border-dark dark:lg:border-dark-1 overflow-hidden">
          {/* 送信中の背景 */}
          {loading && (
            <div
              id="overlay"
              className="fixed inset-0 bg-white z-[999] dark:bg-dark opacity-70"
            ></div>
          )}
          {/* プログレスバー */}
          {loading && (
            <div className="progress" style={{ display: progressDisplay }}>
              <div className="color"></div>
            </div>
          )}
          <div>
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
                  <Image
                    src="/sm_logo.png"
                    width={50}
                    height={50}
                    alt="Comiee"
                  />
                </h1>
              </Link>
            </div>

            <h2 className="text-2xl flex justify-center mt-4 px-10 dark:text-f5">
              ログイン
            </h2>
            <p className="flex justify-center text-base mt-2">
              お客様のメールアドレスを使用
            </p>
            <form
              onSubmit={onSubmit}
              id="sendForm"
              method="POST"
              action="/login"
              className="px-6 lg:px-10 dark:bg-dark pt-6"
            >
              {/* Email input */}
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
              {/* Password input */}
              <div className="relative mb-6">
                <input
                  ref={passwordRef}
                  id="password"
                  type="password"
                  name="password"
                  className={`input-field w-full p-4 border-transparent rounded bg-white dark:bg-dark-1 border-[3px] focus:border-primary transition-all ${
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
              <input type="hidden" name="remember" value="on" />
              <div className="w-full flex justify-between items-center pb-6 mb-6 border-b border-b-l-c dark:border-dark-1">
                <span className="cursor-pointer text-primary dark:text-gray dark:hover:text-ddd">
                  パスワードを忘れた場合
                </span>
                <span className="relative">
                  <Button type="submit" variant="default" id="loginButton">
                    次へ
                  </Button>
                </span>
              </div>
            </form>
            <div className="w-full mb-8 lg:mb-12 flex justify-center">
              <a
                href="/auth/signup"
                className="cursor-pointer dark:hover:text-ddd"
              >
                または新規登録
              </a>
            </div>
          </div>{" "}
        </div>
      </div>
    </div>
  );
};

export default Login;
