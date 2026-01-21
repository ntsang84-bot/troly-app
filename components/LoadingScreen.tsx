
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Thầy Sang đang xem đề bài của em...",
  "Đang truy xuất kiến thức trọng tâm...",
  "Đang tìm phương pháp giải tối ưu...",
  "MathGuru đang viết lời giải chi tiết...",
  "Sắp hoàn tất rồi, em đợi thầy chút nhé!"
];

const LoadingScreen: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setMsgIdx(p => (p + 1) % MESSAGES.length), 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-10 animate-in fade-in duration-700">
      <div className="relative">
        <div className="w-20 h-20 border-[6px] border-blue-50 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-[10px] animate-pulse">
            <i className="fas fa-bolt"></i>
          </div>
        </div>
      </div>
      <div className="text-center space-y-3">
        <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] leading-none">MathGuru AI</p>
        <p className="text-slate-600 font-bold text-lg italic animate-pulse px-6 leading-relaxed">"{MESSAGES[msgIdx]}"</p>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">THPT Mang Thít</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
