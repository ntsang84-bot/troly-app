import { AnalysisResult } from "../types";

export function solveWithRule(
  textInput: string
): AnalysisResult {

  const text = textInput.toLowerCase();

  if (text.includes("c?p s? c?ng")) {
    return {
      problemStatement: "B�i to�n v? c?p s? c?ng.",

      analysisAndTheory: {
        logic: [
          "��y l� d?ng to�n c?p s? c?ng.",
          "C?n x�c d?nh s? h?ng d?u v� c�ng sai."
        ],
        formulas: [
          { formula: "u_n = u_1 + (n-1)d", note: "S? h?ng t?ng qu�t" },
          { formula: "S_n = \\frac{n(u_1+u_n)}{2}", note: "T?ng c?p s? c?ng" }
        ]
      },

      optimalMethod: {
        title: "C�ch gi?i nhanh",
        steps: [
          "X�c d?nh $u_1$ v� $d$.",
          "�p d?ng c�ng th?c c?p s? c?ng.",
          "T�nh ra k?t qu?."
        ],
        conclusion: "Ho�n th�nh b�i to�n."
      },

      detailedMethod: {
        title: "L?i gi?i chi ti?t",
        steps: [
          "X�c d?nh d?ng to�n.",
          "Vi?t c�ng th?c.",
          "Thay s? v� t�nh."
        ]
      },

      summaryNotes: []
    };
  }

  return {
    problemStatement: "Chua nh?n di?n du?c d?ng to�n.",

    analysisAndTheory: {
      logic: ["B�i to�n chua thu?c d?ng d� c�i d?t."],
      formulas: []
    },

    optimalMethod: {
      title: "Chua c� phuong ph�p",
      steps: ["H�y nh?p r� d?ng b�i to�n."],
      conclusion: ""
    },

    detailedMethod: {
      title: "Chua c� l?i gi?i",
      steps: []
    },

    summaryNotes: []
  };
}
