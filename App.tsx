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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFile({
        name: selectedFile.name,
        mimeType: selectedFile.type,
        previewUrl: URL.createObjectURL(selectedFile),
        base64: (reader.result as string).split(',')[1],
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

    /** =============================
     *  1️⃣ THỬ AI (NẾU CÓ API KEY)
     ============================== */
    if (apiKey) {
      try {
        const aiResult = await solveWithAI({
          prompt: textInput,
          imageBase64: file?.base64,
          mimeType: file?.mimeType,
          apiKey,
        });

        setResult(aiResult);
        setMode('ai');
        setStatus('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } catch (err) {
        console.warn("AI Error → fallback Local", err);
      }
    }

    /** =============================
     *  2️⃣ FALLBACK LOCAL
     ============================== */
    const localResult = solveLocally(textInput);
    if (localResult) {
      setResult(localResult);
      setMode('local');
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    /** =============================
     *  3️⃣ BÁO LỖI
     ============================== */
    if (apiKey) {
      setError("AI gặp lỗi và thầy chưa có lời giải sẵn. Em kiểm tra lại API Key nhé!");
    } else {
      setError("Chưa có lời giải sẵn. Em hãy nhập API Key để dùng AI nhé!");
    }
    setStatus('error');
  };

  const reset = () => {
    setFile(null);
    setTextInput("");
    setResult(null);
    setStatus('idle');
    setError(null);
    setMode(null);
  };

  const saveDetailedSolutionAsImage = async () => {
    if (!detailedStepRef.current) return;
    try {
      // @ts-ignore
      const dataUrl = await window.htmlToImage.toPng(detailedStepRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 3,
      });
      const link = document.createElement('a');
      link.download = `MathMaster-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert("Không thể tạo ảnh, em chụp màn hình nhé!");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe]">
      <ApiKeySettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-black text-xl">MathMaster AI</h1>
          <button onClick={() => setIsSettingsOpen(true)}>
            ⚙️
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto pt-28 pb-20 px-6">
        {status === 'idle' && (
          <>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Nhập đề toán..."
            />
            <button onClick={handleProcess}>Giải bài</button>
          </>
        )}

        {status === 'loading' && <LoadingScreen />}

        {status === 'error' && (
          <>
            <p className="text-red-500">{error}</p>
            <button onClick={reset}>Quay lại</button>
            <button onClick={() => setIsSettingsOpen(true)}>Nhập API Key</button>
          </>
        )}

        {status === 'success' && result && (
          <>
            <MathContent content={result.problemStatement} />
            <button onClick={saveDetailedSolutionAsImage}>Lưu lời giải</button>
            <button onClick={reset}>Giải bài khác</button>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
