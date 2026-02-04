import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult } from "../types";

export async function solveWithAI(
  prompt: string,
  image?: { data: string; mimeType: string }
): Promise<AnalysisResult> {

  const apiKey = localStorage.getItem("USER_API_KEY");
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const contents: any[] = [];

  if (image) {
    contents.push({
      role: "user",
      parts: [
        { inlineData: { data: image.data, mimeType: image.mimeType } },
        { text: prompt || "Giải bài toán trong hình" }
      ]
    });
  } else {
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });
  }

  const result = await model.generateContent({ contents });
  const text = result.response.text();

  // ⚠️ Giả định AI trả JSON
  return JSON.parse(text);
}
