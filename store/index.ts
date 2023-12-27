/*
|--------------------------------------------------------------------------
| Zustand Reactの状態管理ライブラリ
| https://github.com/pmndrs/zustand
|--------------------------------------------------------------------------
*/
import { create } from "zustand";

import { UserRole } from "@/types/userRoles"; // <-- Import the UserRole type

type Store = {
  isLoggedIn: boolean;
  isReady: boolean;
  userRole: UserRole | null;
  userId: string | null;
  setLoggedIn: (value: boolean) => void;
  setReady: (value: boolean) => void;
  setUserRole: (role: UserRole | null) => void;
  setUserId: (id: string | null) => void;
};

export const useStore = create<Store>((set) => ({
  isLoggedIn: false,
  isReady: false,
  userRole: null,
  userId: null,
  setLoggedIn: (value) => set({ isLoggedIn: value }),
  setReady: (value) => set({ isReady: value }),
  setUserRole: (role) => set({ userRole: role }),
  setUserId: (id) => set({ userId: id }),
}));
