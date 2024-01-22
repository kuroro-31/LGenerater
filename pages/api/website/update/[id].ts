/*
|--------------------------------------------------------------------------
|編集画面からウェブサイトの情報を更新する
|--------------------------------------------------------------------------
*/
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../../lib/prisma';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const { title, language, content } = req.body;

  if (typeof language === "undefined" || typeof content === "undefined") {
    return res.status(400).json({ error: "language or content is undefined" });
  }

  // Update the website
  const website = await prisma.website.update({
    where: { id: Number(id) },
    data: { title: title },
  });

  // Find or create the LocalizedHtml record
  const localizedHtml = await prisma.localizedHtml.upsert({
    where: {
      websiteId_language: {
        websiteId: Number(id),
        language: language,
      },
    },
    update: { content: content },
    create: {
      websiteId: Number(id),
      language: language,
      content: content,
    },
  });

  res.json({ website, localizedHtml });
}
