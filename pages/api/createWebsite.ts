// pages/api/createWebsite.ts
import { PrismaClient } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const website = await prisma.website.create({
    data: {
      // ここにWebsiteの初期データを設定します
      title: "新しいウェブサイト",
    },
  });

  res.json(website);
}
