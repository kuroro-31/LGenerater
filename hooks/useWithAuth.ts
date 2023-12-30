/*
|--------------------------------------------------------------------------
| 認証状態の管理
|--------------------------------------------------------------------------
*/
import { useEffect, useState } from "react";

export const useWithAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(loggedIn === "true");
  }, []);

  return isLoggedIn;
};
