
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `Bạn là Thầy Sang (Mang Thít). Giải toán 4 bước: 
1. analysisAndTheory (logic + công thức $)
2. optimalMethod (mẹo nhanh)
3. detailedMethod (tự luận $)
4. summaryNotes (lỗi sai + mẹo). 
Trả về JSON chuẩn AnalysisResult.`;

export const solveWithAI = async (
  text: string,
  fileData?: { data: string; mimeType: string }
): Promise<AnalysisResult> => {
  const apiKey = localStorage.getItem("USER_API_KEY");

  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  // Prompt ngắn gọn giúp AI phản hồi nhanh hơn
  const prompt = `Giải bài toán: ${text || "Trong ảnh"}. 
  Yêu cầu: Giải 4 bước, công thức nằm trong $, xuất JSON.`;

  const contents = [
    {
      parts: [
        { text: prompt },
        ...(fileData ? [{ inlineData: { data: fileData.data, mimeType: fileData.mimeType } }] : [])
      ]
    }
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      })
    }
  );

  if (!response.ok) throw new Error("API_ERROR");

  const data = await response.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!resultText) throw new Error("EMPTY");

  return JSON.parse(resultText.trim());
};
