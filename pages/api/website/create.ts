import prisma from "../../../lib/prisma";

import type { NextApiRequest, NextApiResponse } from "next";

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
