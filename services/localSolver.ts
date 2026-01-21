
import { AnalysisResult } from "../types";

// Update database to match the AnalysisResult interface structure
export const MATH_DATABASE: Record<string, AnalysisResult> = {
  "dao_ham": {
    problemStatement: "Tính đạo hàm của hàm số $y = \\frac{2x+1}{x-1}$",
    analysisAndTheory: {
      logic: [
        "Đề bài → Hàm số phân thức bậc nhất trên bậc nhất",
        "Xác định dữ kiện → Tử $u=2x+1$, Mẫu $v=x-1$",
        "Nhận dạng → Dạng thương $\\left(\\frac{u}{v}\\right)'$",
        "Lộ trình → Tìm điều kiện → Tính $u', v'$ → Ráp công thức"
      ],
      formulas: [
        { formula: "$\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}$", note: "Quy tắc đạo hàm của một thương" },
        { formula: "$\\left(\\frac{ax+b}{cx+d}\\right)' = \\frac{ad-bc}{(cx+d)^2}$", note: "Mẹo tính nhanh hàm bậc nhất" }
      ]
    },
    optimalMethod: {
      title: "Phương pháp 1: Tính nhanh trắc nghiệm (Tối ưu)",
      steps: [
        "Bước 1: Điều kiện $x \\neq 1$.",
        "Bước 2: Sắp xếp hệ số: $a=2, b=1, c=1, d=-1$.",
        "Bước 3: Tính định thức $ad-bc = 2(-1) - 1(1) = -3$.",
        "Bước 4: Ráp vào mẫu bình phương."
      ],
      conclusion: "$y' = \\frac{-3}{(x-1)^2}$"
    },
    detailedMethod: {
      title: "Phương pháp 2: Biến đổi đại số (Tư duy kiểm chứng)",
      steps: [
        "Bước 1: Tách tử số theo mẫu: $2x+1 = 2(x-1) + 3$.",
        "Bước 2: Chia tử cho mẫu: $y = 2 + \\frac{3}{x-1}$.",
        "Bước 3: Đạo hàm từng phần: $(2)' = 0$; $\\left(\\frac{3}{x-1}\\right)' = 3 \\cdot \\frac{-1}{(x-1)^2}$."
      ],
      conclusion: "$y' = -\\frac{3}{(x-1)^2}$"
    },
    summaryNotes: [
      {
        wrong: "Quên không bình phương mẫu số khi giải tự luận.",
        right: "Mẫu số luôn là $(x-1)^2$.",
        tip: "Hàm bậc nhất/bậc nhất luôn đơn điệu (không có cực trị)."
      }
    ]
  },
  "xac_suat": {
    problemStatement: "Một hộp có 5 bi xanh và 3 bi đỏ. Lấy ngẫu nhiên 2 bi. Tính xác suất lấy được 2 bi cùng màu.",
    analysisAndTheory: {
      logic: [
        "Đề bài → Chọn 2 từ 8 bi (không thứ tự)",
        "Xác định → Không gian mẫu $n(\\Omega) = C_8^2$",
        "Biến cố $A$ → Lấy 2 xanh HOẶC 2 đỏ",
        "Lộ trình → Tính $n(\\Omega)$ → Tính $n(A)$ → Lập tỉ số"
      ],
      formulas: [
        { formula: "$P(A) = \\frac{n(A)}{n(\\Omega)}$", note: "Định nghĩa xác suất cổ điển" },
        { formula: "$C_n^k = \\frac{n!}{k!(n-k)!}$", note: "Công thức tổ hợp (chọn không thứ tự)" }
      ]
    },
    optimalMethod: {
      title: "Phương pháp 1: Liệt kê trực tiếp biến cố (Tối ưu)",
      steps: [
        "Bước 1: Không gian mẫu $n(\\Omega) = C_8^2 = 28$.",
        "Bước 2: Trường hợp 1: Lấy 2 bi xanh $\\implies C_5^2 = 10$.",
        "Bước 3: Trường hợp 2: Lấy 2 bi đỏ $\\implies C_3^2 = 3$.",
        "Bước 4: $n(A) = 10 + 3 = 13$."
      ],
      conclusion: "$P(A) = \\frac{13}{28}$"
    },
    detailedMethod: {
      title: "Phương pháp 2: Dùng biến cố đối (Kiểm chứng)",
      steps: [
        "Bước 1: Biến cố đối $\\overline{A}$ là lấy 2 bi khác màu.",
        "Bước 2: Số cách chọn 2 bi khác màu: $C_5^1 \\cdot C_3^1 = 5 \\cdot 3 = 15$.",
        "Bước 3: $P(\\overline{A}) = \\frac{15}{28}$.",
        "Bước 4: $P(A) = 1 - P(\\overline{A}) = 1 - \\frac{15}{28}$."
      ],
      conclusion: "$P(A) = \\frac{13}{28}$"
    },
    summaryNotes: [
      {
        wrong: "Dùng chỉnh hợp $A_n^k$ thay vì tổ hợp $C_n^k$.",
        right: "Lấy bi cùng lúc không quan trọng thứ tự $\\implies$ dùng $C$.",
        tip: "Hãy nhớ: Lấy lần lượt thì dùng $A$, lấy cùng lúc thì dùng $C$."
      }
    ]
  }
};

export const solveLocally = (input: string): AnalysisResult | null => {
  const text = input.toLowerCase();
  if (text.includes("đạo hàm") || text.includes("phân thức")) return MATH_DATABASE["dao_ham"];
  if (text.includes("xác suất") || text.includes("bi xanh") || text.includes("bi đỏ")) return MATH_DATABASE["xac_suat"];
  return null;
};
