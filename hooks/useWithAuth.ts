/*
|--------------------------------------------------------------------------
| 認証状態の管理
|--------------------------------------------------------------------------
*/
import { useEffect } from "react";

import { useStore } from "@/store";

export const useWithAuth = () => {
  const { isLoggedIn, setLoggedIn, setReady, setUserEmail } = useStore(); // <-- Add setUserEmail

  useEffect(() => {
    const value = localStorage.getItem("isLoggedIn") === "true";
    setLoggedIn(value);
    if (value) {
      // If the user is logged in, get their role
      const userEmail = localStorage.getItem("userEmail");
      const user = users.find((user: User) => user.id === userEmail);
      if (user) {
        setUserEmail(userEmail); // <-- Set the user's ID in the store
      }
    }
    setReady(true); // <-- ログイン状態が確定したことを示す
  }, [setLoggedIn, setReady, setUserRole, setUserEmail]); // <-- Add setUserEmail

  return isLoggedIn;
};
