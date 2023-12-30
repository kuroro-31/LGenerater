/*
|--------------------------------------------------------------------------
|ログイン時にユーザーIDとパスワードを受け取り
|ユーザーIDとパスワードが一致するユーザーが存在するかを確認する
--------------------------------------------------------------------------
*/
import { PrismaClient } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email: email,
      password: password,
    },
  });

  if (user) {
    res.status(200).json({ userEmail: user.email });
  } else {
    res
      .status(401)
      .json({ error: "ユーザーIDまたはパスワードが間違っています" });
  }
}
