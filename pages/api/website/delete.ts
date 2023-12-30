/*
|--------------------------------------------------------------------------
| ウェブサイトを削除する
|--------------------------------------------------------------------------
*/
import { PrismaClient } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.body;

  try {
    const deletedWebsite = await prisma.website.delete({
      // parseInt()関数を使用して、文字列を整数に変換
      where: { id: parseInt(id) },
    });

    res.json(deletedWebsite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "削除に失敗しました" });
  }
}
