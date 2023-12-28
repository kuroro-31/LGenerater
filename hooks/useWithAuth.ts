/*
|--------------------------------------------------------------------------
| 認証状態の管理
|--------------------------------------------------------------------------
*/
import { useEffect } from 'react';

import { useStore } from '@/store';
import { User, users } from '@/types/userRoles';

export const useWithAuth = () => {
  const { isLoggedIn, setLoggedIn, setReady, setUserRole, setUserId } =
    useStore();

  useEffect(() => {
    const value = localStorage.getItem("isLoggedIn") === "true";
    setLoggedIn(value);
    if (value) {
      const userId = localStorage.getItem("userId");
      const user = users.find((user: User) => user.id === userId);
      if (user) {
        setUserRole(user.role);
        setUserId(userId);
      }
    }
    setReady(true);
  }, [setLoggedIn, setReady, setUserRole, setUserId]);

  return isLoggedIn;
};
