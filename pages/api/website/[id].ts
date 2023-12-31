/*
|--------------------------------------------------------------------------
| IDからウェブサイトを取得する
|--------------------------------------------------------------------------
*/
import { NextApiRequest, NextApiResponse } from "next";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  const website = await prisma.website.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
      title: true, // タイトル
      html: true, // HTML
    },
  });

  res.json(website);
}
