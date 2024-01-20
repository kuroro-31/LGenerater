import type { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../../lib/prisma';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const { title, language, content } = req.body;

  // Update the website
  const website = await prisma.website.update({
    where: { id: Number(id) },
    data: { title: title },
  });

  // Update or create the localizedHtml
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
