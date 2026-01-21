
import React, { useState, useRef } from 'react';
import { AnalysisResult, AppStatus, FileData } from './types';
import { solveWithAI } from './services/geminiService';
import MathContent from './components/MathContent';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const [file, setFile] = useState<FileData | null>(null);
  const [textInput, setTextInput] = useState("");
  const [status, setStatus] = useState<AppStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const detailedResultRef = useRef<HTMLDivElement>(null);

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
      setError("Thầy chưa nhận diện được bài toán này. Em hãy chụp lại ảnh rõ nét, vuông góc và đủ sáng nhé!");
      setStatus('error');
    }
  };

  const handleSaveImage = async () => {
    if (!detailedResultRef.current) return;
    try {
      // @ts-ignore
      const dataUrl = await window.htmlToImage.toPng(detailedResultRef.current, {
        backgroundColor: '#ffffff',
        style: { padding: '30px' },
        pixelRatio: 3 // Tăng độ nét cho ảnh
      });
      const link = document.createElement('a');
      link.download = `MathGuru-TuLuan-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Có lỗi khi tạo ảnh. Em hãy chụp màn hình để lưu lại nhé!');
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
    <div className="min-h-screen bg-[#f8fafc] safe-pb">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header safe-pt no-print">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <i className="fas fa-bolt-lightning text-xl"></i>
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight text-slate-800 font-heading">MathGuru AI</h1>
              <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-[0.2em]">Trợ lý Thầy Sang</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {status === 'success' && (
              <button 
                onClick={handleSaveImage}
                className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center active:scale-90 transition-all border border-emerald-100"
                title="Lưu lời giải tự luận"
              >
                <i className="fas fa-download"></i>
              </button>
            )}
            {status !== 'idle' && (
              <button onClick={reset} className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center active:scale-90 transition-all">
                <i className="fas fa-rotate-left"></i>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-24 pb-12">
        {status === 'idle' && (
          <div className="px-6 space-y-10 fade-up">
            <div className="text-center py-6 space-y-4">
              <h2 className="text-4xl font-black text-slate-800 leading-tight font-heading">
                Giải toán <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Thật Đơn Giản</span>
              </h2>
              <p className="text-slate-400 font-bold text-sm max-w-xs mx-auto">Phương pháp học tập 4 bước chuyên sâu từ Thầy Sang THPT Mang Thít.</p>
            </div>

            <div className="bg-white rounded-[2.5rem] card-shadow p-8 space-y-8 border border-white">
              {!file ? (
                <label className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer group">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-500 mb-5 shadow-sm group-hover:scale-110 transition-transform">
                    <i className="fas fa-camera-retro text-3xl"></i>
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Tải ảnh bài toán lên</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative rounded-[2rem] overflow-hidden border border-slate-100 min-h-[300px] bg-slate-50 flex items-center justify-center shadow-inner">
                  <img src={file.previewUrl} className="w-full h-full object-contain p-4" alt="Preview" />
                  <button onClick={() => setFile(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-rose-500 shadow-xl border border-rose-50">
                    <i className="fas fa-xmark"></i>
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
                  <textarea 
                    placeholder="Em muốn thầy lưu ý thêm điều gì không? (Ví dụ: Giải theo cách lớp 11...)" 
                    className="w-full h-28 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600 placeholder:text-slate-300 resize-none"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>
                
                {/* Reminder text */}
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-amber-500">
                  <i className="fas fa-circle-info mr-1"></i> Lưu ý: Mỗi lần gởi 01 bài, ảnh rõ nét
                </p>
              </div>

              <button 
                onClick={handleProcess}
                disabled={!file && !textInput.trim()}
                className="w-full btn-vibrant text-white py-6 rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-2xl disabled:opacity-20 flex items-center justify-center space-x-3"
              >
                <i className="fas fa-wand-magic-sparkles"></i>
                <span>Thầy Sang ơi, giải giúp em!</span>
              </button>
            </div>
          </div>
        )}

        {status === 'loading' && <LoadingScreen />}

        {status === 'error' && (
          <div className="px-6 pt-12 text-center space-y-8 fade-up">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
              <i className="fas fa-face-frown text-4xl"></i>
            </div>
            <div className="space-y-2">
              <p className="text-slate-800 font-black text-lg">Ối, có chút trục trặc!</p>
              <p className="text-slate-500 font-bold px-8 leading-relaxed text-sm">{error}</p>
            </div>
            <button onClick={reset} className="px-12 py-5 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Thử lại bài khác</button>
          </div>
        )}

        {status === 'success' && result && (
          <div className="space-y-12 pb-24">
            <div className="space-y-12">
              {/* PROBLEM CARD */}
              <div className="px-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100">
                  <div className="flex items-center space-x-2 opacity-70 mb-4">
                    <i className="fas fa-file-signature text-xs"></i>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Nội dung đề bài trích dẫn</span>
                  </div>
                  <div className="text-xl font-bold leading-relaxed">
                    <MathContent content={result.problemStatement} />
                  </div>
                </div>
              </div>

              <div className="px-6 space-y-16">
                {/* Step 1: Phân tích & Lý thuyết */}
                <section className="space-y-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black shadow-sm">1</div>
                    <h3 className="text-xl font-black uppercase tracking-tight font-heading text-slate-800">Phân tích & Lý thuyết</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-blue-50 shadow-sm space-y-4">
                      {result.analysisAndTheory.logic.map((l, i) => (
                        <div key={i} className="flex items-start space-x-4">
                          <div className="w-2 h-2 rounded-full bg-blue-400 mt-2.5 shrink-0 shadow-sm"></div>
                          <p className="text-sm font-bold text-slate-500 italic leading-relaxed">{l}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {result.analysisAndTheory.formulas.map((f, i) => (
                        <div key={i} className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] shadow-sm text-center">
                          <MathContent content={f.formula} className="text-xl font-black block mb-3 text-amber-900" isBlock />
                          <div className="inline-block px-3 py-1 bg-amber-100 rounded-full">
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                              <i className="fas fa-key mr-1"></i> {f.note}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Step 2: Giải pháp Tối ưu */}
                <section className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-10 shadow-sm space-y-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-100">2</div>
                    <h3 className="text-xl font-black uppercase tracking-tight font-heading text-emerald-900">Giải pháp Tối ưu</h3>
                  </div>
                  <div className="space-y-8">
                    <h4 className="text-2xl font-black italic text-emerald-800 tracking-tight leading-tight">{result.optimalMethod.title}</h4>
                    <div className="space-y-8">
                      {result.optimalMethod.steps.map((step, si) => (
                        <div key={si} className="flex items-start space-x-5">
                          <span className="w-8 h-8 rounded-xl bg-emerald-200/50 flex items-center justify-center text-xs font-black text-emerald-700 shrink-0 border border-emerald-200">{si+1}</span>
                          <div className="pt-0.5"><MathContent content={step} className="text-base font-bold text-emerald-900/80 leading-relaxed" /></div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-8 border-t border-emerald-200/50">
                      <div className="bg-white border-4 border-emerald-100 text-emerald-700 p-8 rounded-[2rem] text-center shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-3">Kết quả / Đáp số</p>
                        <MathContent content={result.optimalMethod.conclusion} className="text-3xl font-black" />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Step 3: Trình bày Chi tiết - CHỈ LƯU PHẦN NÀY DƯỚI DẠNG ẢNH */}
                <section className="space-y-8" ref={detailedResultRef}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center font-black shadow-sm">3</div>
                    <h3 className="text-xl font-black uppercase tracking-tight font-heading text-slate-800">Trình bày Chi tiết (Tự luận)</h3>
                  </div>
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                     <h4 className="text-xl font-black text-violet-700 italic leading-snug">{result.detailedMethod.title}</h4>
                     <div className="space-y-8">
                      {result.detailedMethod.steps.map((step, si) => (
                        <div key={si} className="flex items-start space-x-5">
                          <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-300 shrink-0">{si+1}</span>
                          <div className="pt-0.5"><MathContent content={step} className="text-base text-slate-600 font-bold leading-relaxed" /></div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-8 border-t border-slate-100 mt-4 text-center">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Lưu từ MathGuru AI - Thầy Sang THPT Mang Thít</p>
                    </div>
                  </div>
                </section>

                {/* Step 4: Lưu ý & Cảnh báo */}
                <section className="bg-rose-50/40 border border-rose-100 rounded-[3rem] p-10 space-y-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-rose-100">4</div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-rose-800 font-heading">Lưu ý & Cảnh báo</h3>
                  </div>
                  <div className="space-y-10">
                    {result.summaryNotes.map((m, i) => (
                      <div key={i} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-7 bg-white rounded-[2rem] border border-rose-100 shadow-sm relative">
                             <div className="absolute -top-3 left-6 px-3 py-1 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Lỗi hay mắc</div>
                             <MathContent content={m.wrong} className="text-sm text-slate-400 font-bold line-through italic" />
                          </div>
                          <div className="p-7 bg-white rounded-[2rem] border border-emerald-100 shadow-sm relative">
                             <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">Cách làm đúng</div>
                             <MathContent content={m.right} className="text-sm text-slate-800 font-black" />
                          </div>
                        </div>
                        <div className="p-7 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] shadow-xl flex items-center space-x-5">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                            <i className="fas fa-star text-xl"></i>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Mẹo nhớ từ Thầy Sang</p>
                            <p className="text-base font-black italic leading-tight">{m.tip}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Copyright Info */}
              <div className="pt-10 px-6 text-center">
                <div className="inline-flex flex-col items-center space-y-2 py-6 px-10 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Bản quyền & Tác giả</p>
                  <p className="text-sm font-black text-slate-800">Thầy Sang - THPT Mang Thít</p>
                  <p className="text-[9px] font-bold text-slate-400 italic">"Học toán giá trị - Kiến tạo tương lai"</p>
                </div>
              </div>
            </div>

            {/* Sticky Actions */}
            <div className="fixed bottom-8 left-0 right-0 px-6 z-40 no-print">
              <div className="max-w-4xl mx-auto flex items-center justify-center gap-4">
                <button 
                  onClick={reset} 
                  className="flex-1 max-w-[200px] py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
                >
                  Giải bài mới
                </button>
                <button 
                  onClick={handleSaveImage} 
                  className="flex-1 max-w-[200px] py-5 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <i className="fas fa-image"></i>
                  <span>Lưu ảnh tự luận</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
