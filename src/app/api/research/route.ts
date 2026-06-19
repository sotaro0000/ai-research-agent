// POST /api/research — トピックと観点を受け取り、エージェントで調査レポートを生成する。
import { NextRequest, NextResponse } from "next/server";
import { runResearch } from "@/lib/agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// エージェントの計画→複数検索→合成が時間を要するため上限を延長
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: {
    topic?: string;
    focus?: string;
    openaiApiKey?: string;
    anthropicApiKey?: string;
    tavilyApiKey?: string;
    serperApiKey?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストボディが不正です。" }, { status: 400 });
  }

  const topic = (body?.topic ?? "").toString().trim();
  const focus = (body?.focus ?? "").toString().trim() || "競合と市場機会";
  if (!topic) {
    return NextResponse.json({ error: "調査したいトピック（企業名・キーワード）を入力してください。" }, { status: 400 });
  }
  if (topic.length > 120) {
    return NextResponse.json({ error: "トピックが長すぎます（120文字以内）。" }, { status: 400 });
  }

  // BYOK: 利用者が持ち込んだキーをリクエスト単位で受け取る（サーバーには保存・ログしない）
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const creds = {
    openaiApiKey: str(body.openaiApiKey),
    anthropicApiKey: str(body.anthropicApiKey),
    tavilyApiKey: str(body.tavilyApiKey),
    serperApiKey: str(body.serperApiKey),
  };

  try {
    const result = await runResearch(topic, focus, creds);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[research] unexpected error", err);
    return NextResponse.json({ error: "調査中に予期しないエラーが発生しました。" }, { status: 500 });
  }
}
