
import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Thầy Sang đang nghiên cứu bài tập của em...",
  "Đang truy lục kiến thức trọng tâm...",
  "Đang xây dựng lộ trình giải tối ưu...",
  "MathMaster AI đang hoàn tất lời giải...",
  "Sắp xong rồi, em chuẩn bị xem bài nhé!"
];

const LoadingScreen: React.FC = () => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setMsgIdx(p => (p + 1) % MESSAGES.length), 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-12 animate-in fade-in duration-1000">
      <div className="relative">
        <div className="w-24 h-24 border-[6px] border-blue-50 border-t-blue-500 rounded-full animate-spin shadow-inner"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs animate-pulse shadow-lg">
            <i className="fas fa-microchip"></i>
          </div>
        </div>
      </div>
      <div className="text-center space-y-4 px-8">
        <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] leading-none">MathMaster AI</p>
        <p className="text-slate-700 font-bold text-xl italic leading-relaxed h-14">"{MESSAGES[msgIdx]}"</p>
        <div className="flex items-center justify-center space-x-2 opacity-40">
           <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
           <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></span>
           <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
