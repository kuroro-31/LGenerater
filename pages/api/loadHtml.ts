/*
|--------------------------------------------------------------------------
| LPのHTMLをfsモジュールを使い変換する
|--------------------------------------------------------------------------
*/
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const relativePath = req.query.path as string;
  const htmlFilePath = path.join(process.cwd(), relativePath);
  const htmlContent = fs.readFileSync(htmlFilePath, "utf8");

  res.status(200).json({ htmlContent: htmlContent });
}
