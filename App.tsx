
import React, { useState, useRef } from 'react';
import { AnalysisResult, AppStatus, FileData } from './types';
import { solveWithAI } from './services/geminiService';
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
    try {
      const response = await solveWithAI(
        textInput, 
        file ? { data: file.base64!, mimeType: file.mimeType! } : undefined
      );
      setResult(response);
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      if (err.message === "NO_API_KEY") {
        setError("⚠️ AI đang tắt vì em chưa nhập API Key. Hãy nhấn vào biểu tượng cài đặt phía trên nhé!");
        setIsSettingsOpen(true);
      } else if (err.message === "API_ERROR") {
        setError("❌ Lỗi kết nối với máy chủ AI. Có thể API Key của em đã hết hạn hoặc sai.");
      } else {
        setError("Thầy chưa giải mã được bài này. Em lưu ý: Gửi từng bài một, ảnh chụp rõ nét và đủ sáng nhé!");
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
      link.download = `LoiGiaiTuLuan-Thầy-Sang-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi khi lưu ảnh:', err);
      alert('Không thể tạo ảnh, em hãy chụp màn hình phần lời giải này nhé!');
    }
  };

  const reset = () => {
    setFile(null);
    setTextInput("");
    setResult(null);
    setStatus('idle');
    setError(null);
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
              className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90 transition-transform"
              title="Cài đặt API Key"
            >
              <i className="fas fa-cog"></i>
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
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight italic">Mỗi lần gửi 01 bài, ảnh rõ nét</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative rounded-[2rem] overflow-hidden border border-blue-50 min-h-[250px] bg-slate-50 flex items-center justify-center shadow-inner">
                  <img src={file.previewUrl} className="w-full h-full object-contain p-4" alt="Preview" />
                  <button onClick={() => setFile(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 shadow-xl border border-red-50">
                    <i className="fas fa-trash-can text-sm"></i>
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all shadow-sm">
                  <textarea 
                    placeholder="Ghi chú cho thầy (VD: Giải theo cách lớp 12, cách nhanh nhất...)" 
                    className="w-full h-24 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-3 text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <i className="fas fa-circle-exclamation text-sm shrink-0"></i>
                  <p className="text-[11px] font-black uppercase tracking-tight leading-tight">Lưu ý quan trọng: Mỗi lần gửi 01 bài duy nhất, ảnh chụp cần rõ nét để thầy giải chính xác nhất.</p>
                </div>
              </div>

              <button 
                onClick={handleProcess}
                disabled={!file && !textInput.trim()}
                className="w-full btn-vibrant text-white py-6 rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:brightness-110 active:scale-[0.98] disabled:opacity-30 transition-all flex items-center justify-center space-x-3"
              >
                <i className="fas fa-wand-magic-sparkles text-lg"></i>
                <span>Phân tích bài tập</span>
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
              <button onClick={reset} className="w-full max-w-xs py-5 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg">Thử lại bài khác</button>
              <button onClick={() => setIsSettingsOpen(true)} className="text-blue-600 text-xs font-black uppercase tracking-widest">Cài đặt API Key</button>
            </div>
          </div>
        )}

        {status === 'success' && result && (
          <div className="space-y-12 pb-24">
            {/* PROBLEM SUMMARY */}
            <div className="px-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100 opacity-80">Nội dung bài toán</span>
                <div className="text-xl font-bold leading-relaxed mt-4">
                  <MathContent content={result.problemStatement} />
                </div>
              </div>
            </div>

            <div className="px-6 space-y-16">
              {/* Steps render as before... */}
              {/* Step 1: Phân tích */}
              <section className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black shadow-sm">1</div>
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
                      <div key={i} className="bg-amber-50/60 border border-amber-100 p-6 rounded-[2rem] shadow-sm text-center">
                        <MathContent content={f.formula} className="text-xl font-black block mb-2 text-amber-900" isBlock />
                        <div className="inline-block px-3 py-1 bg-amber-100 rounded-full">
                          <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest leading-none">
                            <i className="fas fa-bookmark mr-1"></i> {f.note}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Step 2: Tối ưu */}
              <section className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-10 shadow-sm space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-100">2</div>
                  <h3 className="text-xl font-black uppercase tracking-tight font-heading text-emerald-900">Giải pháp Tối ưu</h3>
                </div>
                <div className="space-y-8">
                  <h4 className="text-2xl font-black italic text-emerald-800 leading-tight">{result.optimalMethod.title}</h4>
                  <div className="space-y-6">
                    {result.optimalMethod.steps.map((step, si) => (
                      <div key={si} className="flex items-start space-x-4">
                        <span className="w-8 h-8 rounded-xl bg-emerald-200/50 flex items-center justify-center text-xs font-black text-emerald-700 shrink-0 border border-emerald-100">{si+1}</span>
                        <div className="pt-0.5"><MathContent content={step} className="text-base font-bold text-emerald-900/80 leading-relaxed" /></div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-8 border-t border-emerald-200/40">
                    <div className="bg-white border-4 border-emerald-100 text-emerald-700 p-8 rounded-[2rem] text-center shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-3 italic">Kết quả nhanh</p>
                      <MathContent content={result.optimalMethod.conclusion} className="text-3xl font-black" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 3: Chi tiết */}
              <section className="space-y-8" ref={detailedStepRef}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center font-black shadow-sm">3</div>
                  <h3 className="text-xl font-black uppercase tracking-tight font-heading text-slate-800">Trình bày Tự luận Chi tiết</h3>
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
                   <h4 className="text-xl font-black text-violet-700 italic leading-snug">{result.detailedMethod.title}</h4>
                   <div className="space-y-8">
                    {result.detailedMethod.steps.map((step, si) => (
                      <div key={si} className="flex items-start space-x-5">
                        <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 shrink-0">{si+1}</span>
                        <div className="pt-0.5"><MathContent content={step} className="text-base text-slate-600 font-bold leading-relaxed" /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Step 4: Cảnh báo */}
              <section className="bg-rose-50/50 border border-rose-100 rounded-[3rem] p-10 space-y-10">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-rose-100">4</div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-rose-800 font-heading">Lưu ý & Cảnh báo</h3>
                </div>
                <div className="space-y-10">
                  {result.summaryNotes.map((m, i) => (
                    <div key={i} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white rounded-[2rem] border border-rose-100 shadow-sm relative">
                           <div className="absolute -top-3 left-8 px-4 py-1 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Lỗi hay gặp</div>
                           <MathContent content={m.wrong} className="text-sm text-slate-400 font-bold line-through italic" />
                        </div>
                        <div className="p-8 bg-white rounded-[2rem] border border-emerald-100 shadow-sm relative">
                           <div className="absolute -top-3 left-8 px-4 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Giải đúng là</div>
                           <MathContent content={m.right} className="text-sm text-slate-800 font-black" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer with Actions */}
            <footer className="px-6 py-12 text-center space-y-10">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 no-print">
                <button onClick={reset} className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">Giải bài khác</button>
                <button onClick={saveDetailedSolutionAsImage} className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center space-x-3">
                  <i className="fas fa-download"></i>
                  <span>Lưu ảnh tự luận</span>
                </button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Thầy Sang - THPT Mang Thít</p>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
