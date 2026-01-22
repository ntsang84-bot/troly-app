
import React, { useState, useEffect } from 'react';

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("USER_API_KEY");
    if (savedKey) setApiKey(savedKey);
  }, [isOpen]);

  const saveKey = () => {
    if (!apiKey.trim()) {
      alert("⚠️ API key không được để trống em nhé!");
      return;
    }
    localStorage.setItem("USER_API_KEY", apiKey.trim());
    alert("✅ Đã lưu API key. AI của Thầy Sang đã sẵn sàng hỗ trợ em!");
    onClose();
  };

  const clearKey = () => {
    if (window.confirm("Em có chắc muốn xóa API key không? AI sẽ tạm ngừng hoạt động.")) {
      localStorage.removeItem("USER_API_KEY");
      setApiKey("");
      alert("🧹 Đã xóa API key thành công.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-key"></i>
            </div>
            <h3 className="text-lg font-black text-slate-800 font-heading">Cài đặt AI</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nhập API Key của em</label>
            <input
              type="password"
              placeholder="Dán API key tại đây..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-mono text-sm"
            />
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <p className="text-[11px] text-amber-700 font-bold leading-relaxed italic">
              <i className="fas fa-info-circle mr-1"></i> Key này được lưu an toàn trên máy của em (localStorage) và chỉ dùng để gọi AI hỗ trợ giải toán.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <button 
              onClick={saveKey}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              Lưu & Bật Trợ Lý AI
            </button>
            <button 
              onClick={clearKey}
              className="w-full py-4 bg-white text-rose-500 border-2 border-rose-50 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 active:scale-95 transition-all"
            >
              Xóa Key & Tắt AI
            </button>
          </div>
          
          <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-300 pt-2">
            {apiKey ? "🟢 Trạng thái: AI đang bật" : "🔴 Trạng thái: AI đang tắt"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySettings;
