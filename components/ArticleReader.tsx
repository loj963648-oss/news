
import React, { useEffect, useState } from 'react';
import { ArticlePreview, ArticleContent, VocabItem } from '../types';
import { generateFullArticle, explainWordInContext, fetchWordAudio } from '../services/geminiService';
import { ArrowLeft, Languages, Loader2, Volume2, Info, ChevronUp, Book, Clock, GraduationCap } from 'lucide-react';

interface ArticleReaderProps {
  preview: ArticlePreview;
  onBack: () => void;
}

// 辅助函数：解码 Base64
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// 辅助函数：解码 PCM 音频数据
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const ArticleReader: React.FC<ArticleReaderProps> = ({ preview, onBack }) => {
  const [content, setContent] = useState<ArticleContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  const [activeParagraphs, setActiveParagraphs] = useState<number[]>([]);
  const [selectedWord, setSelectedWord] = useState<VocabItem | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [sessionVocab, setSessionVocab] = useState<VocabItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const data = await generateFullArticle(preview.title, preview.category, preview.source);
      setContent(data);
      setLoading(false);
    };
    loadContent();
    window.scrollTo(0, 0);
  }, [preview]);

  /**
   * 播放单词发音
   */
  const playAudio = async (word: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const base64Audio = await fetchWordAudio(word);
      if (!base64Audio) throw new Error("Audio not found");

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioCtx, 24000, 1);
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } catch (e) {
      console.error("音频播放失败", e);
      setIsPlaying(false);
    }
  };

  /**
   * 单词查询核心
   */
  const handleWordClick = async (word: string, sentence: string) => {
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    if (!cleanWord || cleanWord.length < 2) return;

    setLookupLoading(true);
    const localStore = JSON.parse(localStorage.getItem('user_vocabulary') || '{}');
    const existing = localStore[cleanWord.toLowerCase()];

    try {
      const result = await explainWordInContext(cleanWord, sentence);
      if (result) {
        const updatedCount = (existing?.queryCount || 0) + 1;
        const finalWord = { ...result, queryCount: updatedCount };
        setSelectedWord(finalWord);
        
        localStore[cleanWord.toLowerCase()] = finalWord;
        localStorage.setItem('user_vocabulary', JSON.stringify(localStore));
        
        if (!sessionVocab.find(v => v.word.toLowerCase() === cleanWord.toLowerCase())) {
          setSessionVocab(prev => [finalWord, ...prev]);
        }
        
        // 自动播放刚查询的单词发音
        playAudio(cleanWord);
      }
    } catch (e) {
      console.error("查词失败:", e);
    } finally {
      setLookupLoading(false);
    }
  };

  const togglePara = (idx: number) => {
    setActiveParagraphs(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const renderInteractiveText = (text: string) => {
    const words = text.split(/(\s+)/);
    return words.map((part, i) => {
      if (/\s+/.test(part)) return part;
      return (
        <span 
          key={i} 
          onClick={() => handleWordClick(part, text)}
          className="cursor-pointer hover:bg-brand-primary/10 hover:text-brand-primary rounded px-0.5 transition-all active:scale-95 inline-block"
        >
          {part}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 bg-brand-bg text-brand-text">
        <div className="max-w-md w-full text-center space-y-6">
          <Loader2 className="animate-spin text-brand-primary mx-auto mb-4" size={48} />
          <h2 className="font-sans font-bold text-2xl animate-pulse">正在为你深度解析译文...</h2>
          <p className="text-brand-muted">AI 正在根据文章语境挑选核心考点词汇</p>
        </div>
      </div>
    );
  }

  if (!content) return <div className="p-10 text-center text-brand-text">文章加载失败，请重试。</div>;

  return (
    <div className="bg-brand-bg min-h-screen pb-20 relative">
      {lookupLoading && (
        <div className="fixed top-24 right-8 z-[120] bg-brand-primary text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs font-bold">正在分析语境释义...</span>
        </div>
      )}

      {selectedWord && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6" onClick={() => setSelectedWord(null)}>
            <div className="absolute inset-0 bg-black/10 backdrop-blur-md"></div>
            <div 
                className="relative bg-brand-surface apple-blur border border-brand-border w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-apple-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h4 className="text-3xl font-bold text-brand-text">{selectedWord.word}</h4>
                            {selectedWord.queryCount && selectedWord.queryCount > 1 && (
                                <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock size={10} /> 查询过 {selectedWord.queryCount} 次
                                </span>
                            )}
                        </div>
                        <p className="text-brand-primary font-medium mt-1">{selectedWord.type} · {selectedWord.pronunciation || '/.../'}</p>
                    </div>
                    <button 
                      onClick={() => playAudio(selectedWord.word)} 
                      className={`p-3 rounded-full transition-all ${isPlaying ? 'bg-brand-primary text-white scale-110' : 'bg-brand-border/40 text-brand-muted hover:text-brand-primary hover:scale-105'}`}
                    >
                        <Volume2 size={24} className={isPlaying ? 'animate-pulse' : ''} />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-2">基础释义</p>
                        <p className="text-lg text-brand-text font-medium leading-snug">{selectedWord.definition}</p>
                    </div>
                    <div className="pt-4 border-t border-brand-border">
                        <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">语境精准译文</p>
                        <p className="text-brand-text italic leading-relaxed">"{selectedWord.context_translation}"</p>
                    </div>
                </div>
                <button 
                    onClick={() => setSelectedWord(null)}
                    className="w-full mt-8 py-4 bg-brand-text text-brand-bg rounded-2xl font-bold active:scale-95 transition-transform"
                >
                    学到了
                </button>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-16">
          <article className="lg:w-[65%] max-w-3xl mx-auto lg:mx-0">
            <div className="flex items-center justify-between mb-10">
                <button onClick={onBack} className="group flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-colors text-sm font-bold">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    返回列表
                </button>
                <button 
                    onClick={() => setShowAllTranslations(!showAllTranslations)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${showAllTranslations ? 'bg-brand-primary text-white shadow-lg' : 'bg-brand-border/40 text-brand-muted hover:bg-brand-border/60'}`}
                >
                    <Languages size={14} />
                    {showAllTranslations ? '关闭对照' : '开启双语对照'}
                </button>
            </div>

            <header className="mb-16">
              <div className="flex items-center gap-3 mb-4">
                  <span className="bg-brand-primary text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <GraduationCap size={12} /> {content.difficulty}
                  </span>
                  <span className="text-brand-muted text-[10px] font-bold uppercase tracking-[0.1em]">{content.readTimeMin} 分钟阅读 · {preview.source}</span>
              </div>
              <h1 className="font-sans font-bold text-4xl md:text-5xl text-brand-text mb-8 leading-tight tracking-tight">{content.title}</h1>
              <p className="font-serif text-xl md:text-2xl text-brand-muted italic leading-relaxed border-l-4 border-brand-primary/20 pl-6">{content.subtitle}</p>
            </header>

            <div className="font-serif text-xl md:text-2xl text-brand-text leading-[1.8] space-y-12">
              {content.paragraphs.map((para, idx) => {
                const isExpanded = showAllTranslations || activeParagraphs.includes(idx);
                return (
                    <div key={idx} className="group relative">
                        <div className="flex gap-4">
                            <div className="flex-grow">
                                <p className="transition-all duration-300">
                                    {renderInteractiveText(para.en)}
                                </p>
                            </div>
                            <button 
                                onClick={() => togglePara(idx)} 
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 self-start text-brand-muted hover:text-brand-primary bg-brand-border/20 rounded-full"
                            >
                                {isExpanded ? <ChevronUp size={20} /> : <Languages size={20} />}
                            </button>
                        </div>
                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0 -translate-y-4'}`}>
                            <div className="text-lg md:text-xl text-brand-muted font-sans bg-brand-surface/60 p-8 rounded-[2rem] border border-brand-border shadow-inner leading-relaxed">
                                {para.cn}
                            </div>
                        </div>
                    </div>
                );
              })}
            </div>
          </article>

          <aside className="hidden lg:block lg:w-[30%]">
            <div className="sticky top-32 space-y-8">
                <div className="bg-brand-surface border border-brand-border p-8 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Book className="text-brand-primary" size={20} />
                            <h3 className="font-bold text-xs uppercase tracking-widest text-brand-text">本次阅读生词</h3>
                        </div>
                        <span className="text-[10px] bg-brand-primary text-white font-bold px-2 py-0.5 rounded-full">{sessionVocab.length}</span>
                    </div>
                    {sessionVocab.length > 0 ? (
                        <div className="space-y-6">
                            {sessionVocab.slice(0, 12).map((vocab, i) => (
                                <div key={i} className="group/item flex items-center justify-between gap-2">
                                    <div onClick={() => setSelectedWord(vocab)} className="flex-grow cursor-pointer">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-bold text-brand-text group-hover/item:text-brand-primary transition-colors">{vocab.word}</p>
                                            <span className="text-[10px] text-brand-muted bg-brand-border/30 px-1 rounded">{vocab.type}</span>
                                        </div>
                                        <p className="text-sm text-brand-muted line-clamp-1">{vocab.definition}</p>
                                    </div>
                                    <button 
                                      onClick={() => playAudio(vocab.word)}
                                      className="p-1.5 hover:bg-brand-primary/10 rounded-full text-brand-muted hover:text-brand-primary transition-colors"
                                    >
                                      <Volume2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-sm text-brand-muted italic">点击文中单词，AI 将提供精准语境翻译和真人发音。</p>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-brand-primary/5 rounded-[2rem] border border-brand-primary/10">
                    <div className="flex items-center gap-2 text-brand-primary mb-4">
                        <Info size={16} />
                        <h4 className="font-bold text-xs uppercase tracking-widest">多听多读</h4>
                    </div>
                    <p className="text-xs text-brand-muted leading-relaxed font-medium">
                        利用 AI 语音反复跟读。听觉记忆是语言学习中最被低估的高效手段。点击单词即可随时重听。
                    </p>
                </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ArticleReader;
