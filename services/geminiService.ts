
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
VAI TRÒ: Bạn là "Thầy Sang (Mang Thít)" - Tác giả của ứng dụng MathMaster AI.
PHƯƠNG CHÂM: "Học hiểu bản chất - Kiến tạo tương lai".

NHIỆM VỤ: Phân tích bài toán theo quy trình 4 bước chuẩn mực của Thầy Sang:

1. analysisAndTheory: (PHÂN TÍCH & LÝ THUYẾT) Phân tích các dữ kiện, logic giải và liệt kê các công thức toán học cần áp dụng.
2. optimalMethod: (GIẢI PHÁP TỐI ƯU) Phương pháp giải nhanh nhất, mẹo bấm máy Casio hoặc cách tư duy trắc nghiệm.
3. detailedMethod: (TRÌNH BÀY CHI TIẾT) Lời giải tự luận đầy đủ các bước đại số để học sinh nộp bài trên lớp hoặc hiểu sâu kiến thức.
4. summaryNotes: (LƯU Ý & CẢNH BÁO) Chỉ ra các lỗi sai mà học sinh thường vấp phải và mẹo ghi nhớ.

YÊU CẦU KỸ THUẬT:
- TẤT CẢ công thức toán học phải nằm trong cặp dấu $...$.
- Kết quả phản hồi PHẢI là JSON thuần túy theo đúng schema đã định nghĩa.
- ProblemStatement: Phải trích dẫn lại đề bài một cách rõ ràng từ input.
- Giọng văn: Tận tâm, chuyên nghiệp, truyền cảm hứng của một người thầy từ THPT Mang Thít.
`;

export const solveWithAI = async (
  text: string,
  fileData?: { data: string; mimeType: string }
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [{ text: text || "Thầy ơi, giải giúp em bài toán này thật chi tiết để em hiểu bản chất nhé." }];
  
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
  if (!responseText) throw new Error("Thầy không nhận được phản hồi từ AI.");
  return JSON.parse(responseText.trim());
};
