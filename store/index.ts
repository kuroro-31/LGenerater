/*
|--------------------------------------------------------------------------
| Zustand Reactの状態管理ライブラリ
| https://github.com/pmndrs/zustand
|--------------------------------------------------------------------------
*/
import { create } from "zustand";

type Store = {
  isLoggedIn: boolean;
  isReady: boolean;
  userEmail: string | null;
  setLoggedIn: (value: boolean) => void;
  setReady: (value: boolean) => void;
  setUserEmail: (email: string | null) => void;
};

export const useStore = create<Store>((set) => ({
  isLoggedIn: false,
  isReady: false,
  userEmail: null,
  setLoggedIn: (value) => set({ isLoggedIn: value }),
  setReady: (value) => set({ isReady: value }),
  setUserEmail: (email) => set({ userEmail: email }),
}));
