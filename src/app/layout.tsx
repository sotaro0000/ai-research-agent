import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Research Agent — 自律型の市場リサーチエージェント",
  description:
    "企業名やキーワードを入力すると、AIエージェントが「調査計画 → Web検索 → レポート合成」を自動実行し、競合・市場分析レポートを出典付きで生成します。",
  openGraph: {
    title: "AI Research Agent — 自律型の市場リサーチエージェント",
    description: "計画→検索→合成を自動実行するAIリサーチエージェント。",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
