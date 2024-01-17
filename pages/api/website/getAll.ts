/*
|--------------------------------------------------------------------------
| すべてのウェブサイトを取得する
|--------------------------------------------------------------------------
*/
import prisma from '../../../lib/prisma';

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const websites = await prisma.website.findMany({
    include: {
      localizedHtml: true,
    },
  });
  res.status(200).json(websites);
}
