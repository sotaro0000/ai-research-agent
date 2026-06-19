// Web検索プロバイダの抽象化（Tavily / Serper）。キー未設定なら null を返す。
import type { Credentials, SearchHit } from "./types";

interface SearchConfig {
  provider: "tavily" | "serper";
  apiKey: string;
}

/**
 * 検索設定を解決する。
 * 優先順位: ① 利用者が持ち込んだキー（BYOK） → ② サーバー環境変数（任意のフォールバック）。
 */
export function resolveSearchConfig(creds?: Credentials): SearchConfig | null {
  // ① BYOK
  if (creds?.tavilyApiKey) return { provider: "tavily", apiKey: creds.tavilyApiKey };
  if (creds?.serperApiKey) return { provider: "serper", apiKey: creds.serperApiKey };
  // ② 環境変数フォールバック
  const provider = (process.env.SEARCH_PROVIDER || "tavily").toLowerCase();
  if (provider === "serper" && process.env.SERPER_API_KEY) {
    return { provider: "serper", apiKey: process.env.SERPER_API_KEY };
  }
  if (process.env.TAVILY_API_KEY) {
    return { provider: "tavily", apiKey: process.env.TAVILY_API_KEY };
  }
  if (process.env.SERPER_API_KEY) {
    return { provider: "serper", apiKey: process.env.SERPER_API_KEY };
  }
  return null;
}

const TIMEOUT_MS = 10_000;

async function tavily(cfg: SearchConfig, query: string): Promise<SearchHit[]> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        api_key: cfg.apiKey,
        query,
        search_depth: "basic",
        max_results: 5,
      }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const results = Array.isArray(json.results) ? json.results : [];
    return results.map((r: { title?: string; url?: string; content?: string }) => ({
      title: r.title ?? "(no title)",
      url: r.url ?? "",
      snippet: (r.content ?? "").slice(0, 500),
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

async function serper(cfg: SearchConfig, query: string): Promise<SearchHit[]> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": cfg.apiKey },
      signal: controller.signal,
      body: JSON.stringify({ q: query, gl: "jp", hl: "ja", num: 5 }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const organic = Array.isArray(json.organic) ? json.organic : [];
    return organic.map((r: { title?: string; link?: string; snippet?: string }) => ({
      title: r.title ?? "(no title)",
      url: r.link ?? "",
      snippet: r.snippet ?? "",
    }));
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

/** 単一クエリで検索する。 */
export async function runSearch(cfg: SearchConfig, query: string): Promise<SearchHit[]> {
  return cfg.provider === "serper" ? serper(cfg, query) : tavily(cfg, query);
}
