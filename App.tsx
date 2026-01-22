
import React, { useState, useRef } from 'react';
import { AnalysisResult, AppStatus, FileData } from './types';
import { solveWithAI } from './services/geminiService';
import { solveLocally } from './services/localSolver';
import MathContent from './components/MathContent';
import LoadingScreen from './components/LoadingScreen';
import ApiKeySettings from './components/ApiKeySettings';

const App: React.FC = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [textInput, setTextInput] = useState("");
  const [status, setStatus] = useState<AppStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mode, setMode] = useState<'ai' | 'local' | null>(null);
  
  const detailedStepRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setFile({
        name: selectedFile.name,
        mimeType: selectedFile.type,
        previewUrl: URL.createObjectURL(selectedFile),
        base64: (reader.result as string).split(',')[1]
      });
    };
    reader.readAsDataURL(selectedFile);
    setError(null);
  };

  const handleProcess = async () => {
    if (!file && !textInput.trim()) return;
    setStatus('loading');
    setError(null);
    setMode(null);

    const apiKey = localStorage.getItem("USER_API_KEY");

    // 1. Nếu có API Key, thử gọi AI trước
    if (apiKey) {
      try {
        const response = await solveWithAI(
          textInput, 
          file ? { data: file.base64!, mimeType: file.mimeType! } : undefined
        );
        setResult(response);
        setMode('ai');
        setStatus('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } catch (err) {
        console.warn("AI Error, falling back to Local:", err);
        // Nếu AI lỗi, tiếp tục xuống bước 2 (Local)
      }
    }

    // 2. Chế độ Local (Logic có sẵn) hoặc Fallback
    const localResponse = solveLocally(textInput);
    if (localResponse) {
      setResult(localResponse);
      setMode('local');
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Nếu cả 2 đều không có kết quả
      if (apiKey) {
        setError("AI gặp lỗi và thầy chưa có lời giải sẵn cho bài này. Em kiểm tra lại Key nhé!");
      } else {
        setError("Thầy chưa có lời giải sẵn cho bài này. Em hãy nhập API Key để dùng AI nâng cao (miễn phí) nhé!");
      }
      setStatus('error');
    }
  };

  const saveDetailedSolutionAsImage = async () => {
    if (!detailedStepRef.current) return;
    try {
      // @ts-ignore
      const dataUrl = await window.htmlToImage.toPng(detailedStepRef.current, {
        backgroundColor: '#ffffff',
        style: { padding: '40px', borderRadius: '0px' },
        pixelRatio: 3
      });
      const link = document.createElement('a');
      link.download = `MathGuru-LoiGiai-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('Không thể tạo ảnh, em hãy chụp màn hình nhé!');
    }
  };

  const reset = () => {
    setFile(null);
    setTextInput("");
    setResult(null);
    setStatus('idle');
    setError(null);
    setMode(null);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] safe-pb">
      <ApiKeySettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header safe-pt no-print">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <i className="fas fa-graduation-cap text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-800 font-heading leading-none">MathMaster AI</h1>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Trợ lý Thầy Sang</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90 transition-transform relative"
              title="Cài đặt AI"
            >
              <i className="fas fa-robot"></i>
              {localStorage.getItem("USER_API_KEY") && <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>}
            </button>
            {status !== 'idle' && (
              <button onClick={reset} className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90 transition-transform">
                <i className="fas fa-plus"></i>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-28 pb-12">
        {status === 'idle' && (
          <div className="px-6 space-y-8 fade-up">
            <div className="text-center py-6 space-y-3">
              <h2 className="text-4xl font-black text-slate-800 leading-tight font-heading">
                Chinh Phục Toán Học <br/><span className="text-blue-600">Cùng Thầy Sang</span>
              </h2>
              <div className="inline-block px-4 py-2 bg-blue-50 rounded-full">
                <p className="text-blue-700 font-black text-[11px] uppercase tracking-widest">
                  <i className="fas fa-star mr-2"></i> THPT Mang Thít
                </p>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-50 p-8 space-y-8 border border-blue-50">
              {!file ? (
                <label className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-blue-100 rounded-[2rem] bg-blue-50/20 hover:bg-blue-50/40 transition-all cursor-pointer group">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-500 mb-6 shadow-md group-hover:scale-110 transition-transform">
                    <i className="fas fa-camera text-3xl"></i>
                  </div>
                  <span className="text-sm font-black text-blue-500 uppercase tracking-widest">Chụp ảnh bài tập</span>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight italic">Ưu tiên ảnh rõ nét, từng bài một</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative rounded-[2rem] overflow-hidden border border-blue-50 min-h-[250px] bg-slate-50 flex items-center justify-center shadow-inner">
                  <img src={file.previewUrl} className="w-full h-full object-contain p-4" alt="Preview" />
                  <button onClick={() => setFile(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-xl">
                    <i className="fas fa-trash-can text-sm"></i>
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all shadow-sm">
                  <textarea 
                    placeholder="Ghi chú thêm cho thầy (VD: 'Giải xác suất', 'Đạo hàm lớp 11'...)" 
                    className="w-full h-24 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>
              </div>

              <button 
                onClick={handleProcess}
                disabled={!file && !textInput.trim()}
                className="w-full btn-vibrant text-white py-6 rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:brightness-110 active:scale-[0.98] disabled:opacity-30 transition-all flex items-center justify-center space-x-3"
              >
                <i className="fas fa-wand-magic-sparkles text-lg"></i>
                <span>Bắt đầu giải toán</span>
              </button>
            </div>
          </div>
        )}

        {status === 'loading' && <LoadingScreen />}

        {status === 'error' && (
          <div className="px-6 pt-12 text-center space-y-6 fade-up">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
              <i className="fas fa-triangle-exclamation text-3xl"></i>
            </div>
            <p className="text-slate-600 font-bold px-8 leading-relaxed italic">{error}</p>
            <div className="flex flex-col space-y-3 items-center">
              <button onClick={reset} className="w-full max-w-xs py-5 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg">Quay lại</button>
              <button onClick={() => setIsSettingsOpen(true)} className="text-blue-600 text-xs font-black uppercase tracking-widest">Mở cài đặt AI</button>
            </div>
          </div>
        )}

        {status === 'success' && result && (
          <div className="space-y-12 pb-24">
            {/* MODE INDICATOR */}
            <div className="px-6 flex justify-center">
              <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${mode === 'ai' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                {mode === 'ai' ? '🚀 Chế độ: AI Nâng Cao' : '📘 Chế độ: Cơ Bản'}
              </div>
            </div>

            <div className="px-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100 opacity-80">Nội dung bài toán</span>
                <div className="text-xl font-bold leading-relaxed mt-4">
                  <MathContent content={result.problemStatement} />
                </div>
              </div>
            </div>

            <div className="px-6 space-y-16">
              {/* Render 4 steps as before */}
              <section className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black">1</div>
                  <h3 className="text-xl font-black uppercase tracking-tight font-heading text-slate-800">Phân tích & Công thức</h3>
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[2rem] border border-blue-50 shadow-sm space-y-4">
                    {result.analysisAndTheory.logic.map((l, i) => (
                      <div key={i} className="flex items-start space-x-4">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2.5 shrink-0"></div>
                        <p className="text-sm font-bold text-slate-500 italic leading-relaxed">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.analysisAndTheory.formulas.map((f, i) => (
                      <div key={i} className="bg-amber-50/60 border border-amber-100 p-6 rounded-[2rem] text-center">
                        <MathContent content={f.formula} className="text-xl font-black block mb-2 text-amber-900" isBlock />
                        <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest leading-none">{f.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-10 shadow-sm space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black">2</div>
                  <h3 className="text-xl font-black uppercase tracking-tight font-heading text-emerald-900">Giải pháp Tối ưu</h3>
                </div>
                <div className="space-y-8">
                  <h4 className="text-2xl font-black italic text-emerald-800 leading-tight">{result.optimalMethod.title}</h4>
                  <div className="space-y-6">
                    {result.optimalMethod.steps.map((step, si) => (
                      <div key={si} className="flex items-start space-x-4">
                        <span className="w-8 h-8 rounded-xl bg-emerald-200/50 flex items-center justify-center text-xs font-black text-emerald-700 shrink-0 border border-emerald-100">{si+1}</span>
                        <div className="pt-0.5"><MathContent content={step} className="text-base font-bold text-emerald-900/80" /></div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white border-4 border-emerald-100 text-emerald-700 p-8 rounded-[2rem] text-center shadow-lg">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">Đáp án nhanh</p>
                    <MathContent content={result.optimalMethod.conclusion} className="text-3xl font-black" />
                  </div>
                </div>
              </section>

              <section className="space-y-8" ref={detailedStepRef}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center font-black">3</div>
                  <h3 className="text-xl font-black uppercase tracking-tight font-heading text-slate-800">Trình bày Tự luận</h3>
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                   <h4 className="text-xl font-black text-violet-700 italic leading-snug">{result.detailedMethod.title}</h4>
                   <div className="space-y-8">
                    {result.detailedMethod.steps.map((step, si) => (
                      <div key={si} className="flex items-start space-x-5">
                        <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">{si+1}</span>
                        <div className="pt-0.5"><MathContent content={step} className="text-base text-slate-600 font-bold" /></div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-8 mt-4 border-t border-slate-50 text-center opacity-30 italic text-[10px] font-bold">Thầy Sang - THPT Mang Thít</div>
                </div>
              </section>

              <section className="bg-rose-50/50 border border-rose-100 rounded-[3rem] p-10 space-y-10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center font-black">4</div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-rose-800 font-heading">Lưu ý & Cảnh báo</h3>
                </div>
                <div className="space-y-10">
                  {result.summaryNotes.map((m, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-8 bg-white rounded-[2rem] border border-rose-100 shadow-sm relative">
                        <div className="absolute -top-3 left-8 px-4 py-1 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Sai lầm</div>
                        <MathContent content={m.wrong} className="text-sm text-slate-400 font-bold line-through italic" />
                      </div>
                      <div className="p-8 bg-white rounded-[2rem] border border-emerald-100 shadow-sm relative">
                        <div className="absolute -top-3 left-8 px-4 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Đúng là</div>
                        <MathContent content={m.right} className="text-sm text-slate-800 font-black" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <footer className="px-6 py-12 text-center space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 no-print">
                <button onClick={reset} className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">Giải bài khác</button>
                <button onClick={saveDetailedSolutionAsImage} className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center space-x-3">
                  <i className="fas fa-download"></i>
                  <span>Lưu lời giải tự luận</span>
                </button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">© Thầy Sang THPT Mang Thít</p>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
