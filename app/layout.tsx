import "./globals.scss";

import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({ subsets: ["vietnamese"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>{children}</body>
    </html>
  );
}
