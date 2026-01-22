
import { AnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
VAI TRÒ: Bạn là "Thầy Sang (Mang Thít)" - Tác giả của ứng dụng MathMaster AI.
PHƯƠNG CHÂM: "Học hiểu bản chất - Kiến tạo tương lai".

NHIỆM VỤ: Phân tích bài toán theo quy trình 4 bước chuẩn mực của Thầy Sang:
1. analysisAndTheory: (PHÂN TÍCH & LÝ THUYẾT) Phân tích các dữ kiện, logic giải và liệt kê các công thức toán học cần áp dụng.
2. optimalMethod: (GIẢI PHÁP TỐI ƯU) Phương pháp giải nhanh nhất, mẹo bấm máy Casio hoặc cách tư duy trắc nghiệm.
3. detailedMethod: (TRÌNH BÀY CHI TIẾT) Lời giải tự luận đầy đủ các bước đại số để học sinh nộp bài trên lớp hoặc hiểu sâu kiến thức.
4. summaryNotes: (LƯU Ý & CẢNH BÁO) Chỉ ra các lỗi sai mà học sinh thường vấp phải và mẹo ghi nhớ.

YÊU CẦU:
- TẤT CẢ công thức toán học phải nằm trong cặp dấu $...$.
- Kết quả phản hồi PHẢI là JSON thuần túy theo schema của AnalysisResult.
- ProblemStatement: Phải trích dẫn lại đề bài chính xác.
- Giọng văn: Tận tâm, từ THPT Mang Thít.
`;

export const solveWithAI = async (
  text: string,
  fileData?: { data: string; mimeType: string }
): Promise<AnalysisResult> => {
  const apiKey = localStorage.getItem("USER_API_KEY");

  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const prompt = `
Giải Toán THPT ngắn gọn, đúng 4 bước của Thầy Sang.
- Nhắc công thức ($...$)
- Giải nhanh & Giải chi tiết
- Ra đáp án chính xác

Bài toán:
${text || "Hãy giải bài tập trong ảnh"}
`;

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
          temperature: 0.1,
          maxOutputTokens: 8000
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("API_ERROR_DETAIL:", errorData);
    throw new Error("API_ERROR");
  }

  const data = await response.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!resultText) {
    throw new Error("EMPTY_RESPONSE");
  }

  try {
    return JSON.parse(resultText.trim());
  } catch (err) {
    console.error("JSON_PARSE_ERROR:", resultText);
    throw new Error("FORMAT_ERROR");
  }
};
