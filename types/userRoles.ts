/*
|--------------------------------------------------------------------------
| ユーザーの管理
|--------------------------------------------------------------------------
*/
export enum UserRole {
  SYSTEM = "system",
  SCM = "scm",
  BUSINESS_SUCCESS = "business_success",
  PRODUCT_PROMOTION = "product_promotion",
  MANAGEMENT = "management",
}

export type User = {
  id: string;
  password: string;
  role: UserRole;
};

export const users: User[] = [
  { id: "fj-system", password: "UCq5iZUnJmmB", role: UserRole.SYSTEM },
  { id: "fj-scm", password: "s9ASsqqJXEkh", role: UserRole.SCM },
  {
    id: "fj-success",
    password: "yENTSQEhtK4A",
    role: UserRole.BUSINESS_SUCCESS,
  },
  {
    id: "fj-promotion",
    password: "tn3XrWWfXwqn",
    role: UserRole.PRODUCT_PROMOTION,
  },
  { id: "fj-management", password: "2vY783aL5uVb", role: UserRole.MANAGEMENT },
];
