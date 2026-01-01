
import React, { useState, useCallback } from 'react';
import { Relationship, Tone, Festival, GreetingConfig, GeneratedGreeting } from './types';
import { generateGreetingData, generateGreetingImage } from './services/geminiService';
import { Sparkles, Send, Download, RefreshCw, User, PenTool, Image as ImageIcon, Calendar, Edit3, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<GreetingConfig>({
    recipientName: '',
    senderName: '',
    relationship: Relationship.PEER,
    tone: Tone.SINCERE,
    festival: Festival.SPRING_FESTIVAL,
    keywords: '',
    year: '2026'
  });
  const [result, setResult] = useState<GeneratedGreeting | null>(null);

  const handleGenerate = async () => {
    if (!config.recipientName || !config.senderName) {
      alert("请填写收信人和发信人姓名");
      return;
    }

    setLoading(true);
    try {
      const greetingData = await generateGreetingData(config);
      const imageUrl = await generateGreetingImage(greetingData, config.festival, config.tone, config.relationship);
      setResult({ ...greetingData, imageUrl });
    } catch (error: any) {
      console.error("Failed", error);
      alert("生成过程中遇到一点小麻烦，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!result?.imageUrl) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 1600;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 加深蒙层
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.15, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.35, 'rgba(0,0,0,0.6)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.98)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawText = (text: string, x: number, y: number, font: string, color: string, align: 'left' | 'right' | 'center' = 'left', maxWidth?: number) => {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 15;
        
        if (maxWidth) {
          const lines: string[] = [];
          let currentLine = '';
          const chars = text.split('');
          
          for (const char of chars) {
            const testLine = currentLine + char;
            if (ctx.measureText(testLine).width > maxWidth) {
              lines.push(currentLine);
              currentLine = char;
            } else {
              currentLine = testLine;
            }
          }
          lines.push(currentLine);

          lines.forEach((line, i) => {
            ctx.fillText(line, x, y + (i * 70)); // 行高 70
          });
          return lines.length * 70;
        } else {
          ctx.fillText(text, x, y);
          return 0;
        }
      };

      // 绘制逻辑
      drawText(result.title, 80, canvas.height - 750, 'bold 38px "Noto Serif SC", serif', '#FFD700');
      drawText(`致：${config.recipientName}`, 80, canvas.height - 670, 'bold 68px "Noto Serif SC", serif', '#FFFFFF');
      
      // 正文区域采用动态高度计算
      drawText(result.content, 80, canvas.height - 560, '300 46px "Noto Serif SC", serif', '#F5F5F5', 'left', 1040);
      
      // 装饰分割线
      ctx.strokeStyle = 'rgba(255,215,0,0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(80, canvas.height - 200);
      ctx.lineTo(1120, canvas.height - 200);
      ctx.stroke();

      drawText(result.shortBlessing, 80, canvas.height - 70, '900 120px "Noto Serif SC", serif', '#FF3D3D');
      drawText(`—— ${config.senderName} 敬贺`, 1120, canvas.height - 85, 'italic 40px "Noto Serif SC", serif', '#FFFFFF', 'right');

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png', 1.0);
      link.download = `2026贺卡_${config.recipientName}.png`;
      link.click();
    };
    img.src = result.imageUrl;
  }, [result, config]);

  const updateResultField = (field: keyof GeneratedGreeting, value: string) => {
    if (!result) return;
    setResult({ ...result, [field]: value });
  };

  const inputClass = "w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none text-gray-900 text-base font-medium shadow-sm transition-all placeholder:text-gray-300";
  const labelClass = "text-sm font-bold text-gray-700 mb-2 block ml-1 flex items-center gap-1";

  return (
    <div className="min-h-screen pb-20 bg-[#faf8f6]">
      <header className="bg-white border-b border-gray-100 py-12 px-4 mb-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-red-50 rounded-full blur-[80px] opacity-60"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-4 shadow-lg shadow-red-200">2026 丙午马年</div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4">
            龙马精神 <span className="text-red-600">万福临门</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium tracking-[0.3em] uppercase">AI-Powered Premium Greeting Cards</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 左侧配置 */}
        <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">定制您的祝福</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}><Calendar className="w-3 h-3 text-red-500" /> 节日</label>
                <select className={inputClass} value={config.festival} onChange={(e) => setConfig({ ...config, festival: e.target.value as Festival })}>
                  {Object.values(Festival).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}><Sparkles className="w-3 h-3 text-red-500" /> 语气</label>
                <select className={inputClass} value={config.tone} onChange={(e) => setConfig({ ...config, tone: e.target.value as Tone })}>
                  {Object.values(Tone).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}><User className="w-3 h-3 text-red-500" /> 收信人</label>
                <input type="text" className={inputClass} placeholder="如：林老师" value={config.recipientName} onChange={(e) => setConfig({ ...config, recipientName: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}><User className="w-3 h-3 text-red-500" /> 您的署名</label>
                <input type="text" className={inputClass} placeholder="如：您的名字" value={config.senderName} onChange={(e) => setConfig({ ...config, senderName: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClass}><Heart className="w-3 h-3 text-red-500" /> 称呼关系</label>
                <select className={inputClass} value={config.relationship} onChange={(e) => setConfig({ ...config, relationship: e.target.value as Relationship })}>
                  {Object.values(Relationship).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}><Edit3 className="w-3 h-3 text-red-500" /> 关键词</label>
                <input type="text" className={inputClass} placeholder="如：身体健康、金榜题名" value={config.keywords} onChange={(e) => setConfig({ ...config, keywords: e.target.value })} />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-100 disabled:opacity-50 mt-4 active:scale-95 group"
            >
              {loading ? <RefreshCw className="animate-spin w-6 h-6" /> : <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
              <span className="text-xl tracking-tight">{loading ? 'AI 匠心创作中...' : `一键开启 AI 祝福`}</span>
            </button>
          </div>
        </section>

        {/* 右侧预览 */}
        <section className="flex flex-col items-center">
          {!result && !loading && (
            <div className="w-full aspect-[3/4] bg-white rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 p-12 text-center shadow-inner">
              <ImageIcon className="w-20 h-20 mb-6 opacity-5" />
              <p className="text-lg font-bold text-gray-300">填写配置，AI 瞬息为您出片</p>
            </div>
          )}

          {loading && (
            <div className="w-full aspect-[3/4] bg-white rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12 border border-red-50 overflow-hidden relative">
              <div className="relative">
                <div className="w-24 h-24 border-b-4 border-red-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-50 rounded-full animate-ping"></div>
                </div>
              </div>
              <p className="text-red-700 font-black text-2xl mt-10 animate-pulse text-center tracking-widest uppercase">
                {config.relationship === Relationship.LOVER ? '心有灵犀 · 情意绵绵' : '骏马奔腾 · 福至万家'}
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-10 duration-700">
              <p className="text-[10px] text-center text-gray-400 mb-6 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <Edit3 className="w-3 h-3" /> 点击下方预览文字区域可直接手动修辞
              </p>
              <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-white group">
                <img src={result.imageUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" alt="贺卡" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-10 flex flex-col justify-end text-white">
                  <div className="mb-4">
                    <input className="bg-transparent border-none focus:ring-1 focus:ring-yellow-400/50 rounded text-sm font-bold text-yellow-500 mb-1 tracking-[0.4em] uppercase drop-shadow-sm w-full outline-none" value={result.title} onChange={(e) => updateResultField('title', e.target.value)} />
                    <h3 className="text-4xl font-black drop-shadow-2xl">致：{config.recipientName}</h3>
                  </div>
                  
                  <textarea 
                    rows={5}
                    className="bg-transparent border-none focus:ring-1 focus:ring-white/20 rounded text-xl leading-relaxed mb-8 font-light drop-shadow-xl text-gray-100 w-full resize-none outline-none overflow-y-auto custom-scrollbar"
                    value={result.content}
                    onChange={(e) => updateResultField('content', e.target.value)}
                  />
                  
                  <div className="flex justify-between items-end border-t border-white/10 pt-8">
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <input className="bg-transparent border-none focus:ring-1 focus:ring-red-600/50 rounded text-6xl font-black text-red-600 italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,0,0,0.5)] w-full outline-none" value={result.shortBlessing} onChange={(e) => updateResultField('shortBlessing', e.target.value)} />
                      <span className="text-[10px] font-bold opacity-30 mt-3 tracking-widest uppercase italic">Anno Domini 2026</span>
                    </div>
                    <p className="text-sm font-black italic opacity-80 pb-3 whitespace-nowrap pl-4 tracking-tighter">—— {config.senderName} 敬贺</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mt-12">
                <button onClick={handleDownload} className="flex items-center justify-center gap-3 bg-gray-900 text-white py-5 rounded-3xl font-bold text-base hover:bg-black transition-all shadow-xl active:scale-95">
                  <Download className="w-5 h-5" /> 下载贺卡图片
                </button>
                <button onClick={() => { navigator.clipboard.writeText(`${config.recipientName}，${result.content}\n\n${result.shortBlessing}！\n—— ${config.senderName} 敬贺`); alert("金句已入剪贴板！"); }} className="flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-700 py-5 rounded-3xl font-bold text-base hover:bg-gray-50 transition-all shadow-sm active:scale-95">
                  <Send className="w-5 h-5" /> 复制纯文字
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-32 text-center">
        <div className="inline-flex items-center gap-6 bg-white px-10 py-5 rounded-full border border-gray-100 shadow-xl shadow-gray-100/50">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
          <p className="text-gray-400 text-xs font-bold tracking-[0.4em] uppercase">
            Designed by 孙延才 · AI Engine V2.3
          </p>
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
