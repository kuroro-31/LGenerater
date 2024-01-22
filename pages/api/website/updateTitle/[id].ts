/*
|--------------------------------------------------------------------------
| 編集画面からタイトルだけ更新する
|--------------------------------------------------------------------------
*/
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../../lib/prisma';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const { title } = req.body;

  if (typeof title === "undefined") {
    return res.status(400).json({ error: "Title is undefined" });
  }

  try {
    const website = await prisma.website.update({
      where: { id: Number(id) },
      data: { title: title },
    });

    res.json({ website });
  } catch (error) {
    res.status(500).json({ error: "Failed to update the website title" });
  }
}
