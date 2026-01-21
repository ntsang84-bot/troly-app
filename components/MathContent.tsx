
import React, { useEffect, useRef } from 'react';

// Added type definition for MathJax to fix TypeScript errors on window object
declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathContentProps {
  content: string;
  className?: string;
  isBlock?: boolean;
}

const MathContent: React.FC<MathContentProps> = ({ content, className = "", isBlock = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggerMathJax = () => {
      // Fix: Safely access MathJax after declaring it in the global scope
      if (window.MathJax && window.MathJax.typesetPromise && containerRef.current) {
        window.MathJax.typesetPromise([containerRef.current]).catch((err: any) => {
          console.warn('MathJax processing error:', err);
        });
      }
    };

    // Delay nhẹ để đảm bảo DOM đã render xong
    const timeout = setTimeout(triggerMathJax, 100);
    return () => clearTimeout(timeout);
  }, [content]);

  // Kiểm tra nếu là URL ảnh trực tiếp
  const isImageUrl = (str: string) => {
    return str.startsWith('data:image/') || (str.startsWith('http') && str.match(/\.(jpeg|jpg|gif|png|svg)$/i));
  };

  if (isImageUrl(content)) {
    return (
      <div className={`rounded-2xl overflow-hidden shadow-md border border-slate-100 bg-white p-1 my-2 ${className}`}>
        <img src={content} alt="Math Diagram" className="w-full h-auto object-contain max-h-[400px]" />
      </div>
    );
  }

  // Phân tách văn bản và công thức LaTeX ($...$)
  const parts = content.split(/(\$.*?\$)/g);

  return (
    <div 
      ref={containerRef} 
      className={`math-rendered-container ${isBlock ? 'text-center py-4' : ''} ${className}`}
    >
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          return (
            <span key={i} className="formula-card">
              <span className="text-slate-900 font-bold">{part}</span>
            </span>
          );
        }
        return <span key={i} className="text-current font-medium leading-relaxed">{part}</span>;
      })}
    </div>
  );
};

export default MathContent;
