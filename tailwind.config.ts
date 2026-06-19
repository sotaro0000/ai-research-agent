import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1917", // 近黒（本文・プライマリ）
        paper: "#f6f3ec", // 暖色ペーパー（背景）
        wine: "#7f1d1d", // 差し色（章番号・リンク・プロトコル）
      },
      fontFamily: {
        // 見出し：Source Serif 4（エディトリアル・レポート然）
        display: ['"Source Serif 4"', "Georgia", "serif"],
        // 本文：Inter
        sans: ["Inter", "system-ui", "-apple-system", "Hiragino Kaku Gothic ProN", "Meiryo", "sans-serif"],
        // ラベル・数値：等幅
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
