import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Research Agent｜キーワードから競合・市場レポートを自動生成",
  description:
    "企業名やキーワードを入力するだけで、AIエージェントが「調査計画 → Web検索 → レポート合成」を自動実行し、競合・市場分析レポートを出典付きで生成します。",
  openGraph: {
    title: "AI Research Agent — 自律型の市場リサーチエージェント",
    description: "計画→検索→合成を自動実行するAIリサーチエージェント。",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
