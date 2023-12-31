/*
|--------------------------------------------------------------------------
| ウェブサイトを更新する
|--------------------------------------------------------------------------
*/
import prisma from '../../../../lib/prisma';

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const { title, html } = req.body;

  const website = await prisma.website.update({
    where: { id: Number(id) },
    data: { title: title, html: html },
  });

  res.json(website);
}
