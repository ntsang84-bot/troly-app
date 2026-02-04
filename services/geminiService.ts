import { AnalysisResult } from "../types";

interface SolveAIParams {
  prompt: string;
  imageBase64?: string;
  mimeType?: string;
  apiKey: string;
}

export async function solveWithAI({
  prompt,
  imageBase64,
  mimeType,
  apiKey,
}: SolveAIParams): Promise<AnalysisResult> {

  const endpoint =
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const parts: any[] = [];

  if (prompt.trim()) {
    parts.push({ text: prompt });
  }

  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    });
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini API error:", errText);
    throw new Error("Gemini API Error");
  }

  const data = await res.json();

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // 👉 Tạm thời wrap text thành cấu trúc AnalysisResult
  return {
    problemStatement: prompt,
    analysisAndTheory: {
      logic: [text],
      formulas: [],
    },
    optimalMethod: {
      title: "Lời giải AI",
      steps: [text],
      conclusion: text,
    },
    detailedMethod: {
      title: "Trình bày chi tiết",
      steps: [text],
    },
    summaryNotes: [],
  };
}
