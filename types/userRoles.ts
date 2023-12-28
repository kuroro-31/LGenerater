/*
|--------------------------------------------------------------------------
| ユーザーの管理
|--------------------------------------------------------------------------
*/
export enum UserRole {
  SYSTEM = "system",
}

export type User = {
  id: string;
  password: string;
  role: UserRole;
};

export const users: User[] = [
  { id: "system", password: "system", role: UserRole.SYSTEM },
];
