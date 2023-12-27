import router from "next/router";
/*
|--------------------------------------------------------------------------
| 認証状態の管理
|--------------------------------------------------------------------------
*/
import { useEffect } from "react";

import { useStore } from "@/store";
import { User, users } from "@/types/userRoles"; // <-- Import the users and roles

export const useWithAuth = () => {
  const { isLoggedIn, setLoggedIn, setReady, setUserRole, setUserId } =
    useStore(); // <-- Add setUserId

  useEffect(() => {
    const value = localStorage.getItem("isLoggedIn") === "true";
    setLoggedIn(value);
    if (value) {
      // If the user is logged in, get their role
      const userId = localStorage.getItem("userId");
      const user = users.find((user: User) => user.id === userId);
      if (user) {
        setUserRole(user.role); // <-- Set the user's role in the store
        setUserId(userId); // <-- Set the user's ID in the store
      }
    } else {
      // ログインしていない場合、ログインページにリダイレクト
      router.push("/auth/login");
    }
    setReady(true); // <-- ログイン状態が確定したことを示す
  }, [setLoggedIn, setReady, setUserRole, setUserId]); // <-- Add setUserId

  return isLoggedIn;
};
