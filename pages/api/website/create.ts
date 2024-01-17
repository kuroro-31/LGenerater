/*
|--------------------------------------------------------------------------
| 新しくウェブサイトを作成する
|--------------------------------------------------------------------------
*/
import prisma from '../../../lib/prisma';

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const website = await prisma.website.create({
    data: {
      // ここにWebsiteの初期データを設定します
      title: "新しいLP",
      localizedHtml: {
        create: [
          { language: "JP", content: "" },
          { language: "EN", content: "" },
          { language: "TW", content: "" },
          { language: "CN", content: "" },
        ],
      },
    },
  });

  res.json(website);
}
