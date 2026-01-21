
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
VAI TRÒ: Bạn là "Thầy Sang (Mang Thít)" - Tác giả của MathGuru AI.
PHƯƠNG CHÂM: "Toán học giá trị - Học hiểu bản chất".

NHIỆM VỤ: Phân tích bài toán theo QUY TRÌNH 4 BƯỚC TỐI ƯU:

1. analysisAndTheory: (PHÂN TÍCH & LÝ THUYẾT) Gồm logic giải toán và các công thức liên quan. Giải thích ý nghĩa từng đại lượng.
2. optimalMethod: (GIẢI PHÁP TỐI ƯU) Cách làm nhanh, thường dùng cho trắc nghiệm hoặc mẹo Casio.
3. detailedMethod: (TRÌNH BÀY CHI TIẾT) Các bước đại số đầy đủ để học sinh hiểu sâu.
4. summaryNotes: (LƯU Ý & CẢNH BÁO) Chỉ ra lỗi sai phổ biến và mẹo nhớ bài.

YÊU CẦU KỸ THUẬT:
- Mọi công thức toán PHẢI nằm trong cặp dấu $...$.
- Phản hồi hoàn toàn bằng JSON theo đúng cấu trúc schema.
- problemStatement: Trích xuất đề bài chính xác từ input. 
- Luôn giữ thái độ tận tâm, khích lệ của một người thầy từ THPT Mang Thít.
`;

export const solveWithAI = async (
  text: string,
  fileData?: { data: string; mimeType: string }
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [{ text: text || "Thầy ơi, giải giúp em bài này thật chi tiết nhé." }];
  
  if (fileData) {
    parts.push({
      inlineData: {
        data: fileData.data,
        mimeType: fileData.mimeType,
      },
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 4000 }, 
      maxOutputTokens: 8000,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problemStatement: { type: Type.STRING },
          analysisAndTheory: {
            type: Type.OBJECT,
            properties: {
              logic: { type: Type.ARRAY, items: { type: Type.STRING } },
              formulas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    formula: { type: Type.STRING },
                    note: { type: Type.STRING }
                  }
                }
              }
            }
          },
          optimalMethod: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              conclusion: { type: Type.STRING }
            }
          },
          detailedMethod: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              conclusion: { type: Type.STRING }
            }
          },
          summaryNotes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                wrong: { type: Type.STRING },
                right: { type: Type.STRING },
                tip: { type: Type.STRING }
              }
            }
          }
        },
        required: ["problemStatement", "analysisAndTheory", "optimalMethod", "detailedMethod", "summaryNotes"]
      }
    },
  });

  const responseText = response.text;
  if (!responseText) throw new Error("Thầy không nhận được phản hồi.");
  return JSON.parse(responseText.trim());
};
