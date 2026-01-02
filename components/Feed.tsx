
import React, { useEffect, useState, useRef } from 'react';
import { ArticlePreview, Category, User } from '../types';
import { fetchFeed } from '../services/geminiService';
import { Search, Zap, Loader2, ChevronDown } from 'lucide-react';
import DailyQuote from './DailyQuote';

interface FeedProps {
  articles: ArticlePreview[];
  setArticles: React.Dispatch<React.SetStateAction<ArticlePreview[]>>;
  isPushingFull: boolean;
  setIsPushingFull: (val: boolean) => void;
  onArticleSelect: (article: ArticlePreview) => void;
  user: User | null;
  externalCategoryRequest: Category | 'All' | 'For You';
  onCategoryChange: (cat: Category | 'All' | 'For You') => void;
  searchQuery?: string;
}

const CATEGORIES: Category[] = ['World', 'Business', 'Technology', 'Science', 'Culture', 'Economics'];

const Feed: React.FC<FeedProps> = ({ 
  articles, setArticles, isPushingFull, setIsPushingFull,
  onArticleSelect, user, externalCategoryRequest, onCategoryChange, searchQuery 
}) => {
  const [loading, setLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const observerTarget = useRef(null);

  // 核心逻辑：加载文章
  const loadContent = async (isAppend = false) => {
    // 如果已经有文章且不是追加，说明是“回退”到此页面，直接返回
    if (articles.length > 0 && !isAppend && !loading) return;
    
    if (isAppend) setMoreLoading(true);
    else setLoading(true);

    try {
      const fetchCat: Category | 'All' = (externalCategoryRequest === 'For You' || externalCategoryRequest === 'All') ? 'All' : externalCategoryRequest as Category;
      
      // 这里的逻辑：如果没有开启全量，只抓取 1 篇；否则抓取 6 篇
      const limit = isPushingFull ? 6 : 1;
      const offset = isAppend ? articles.length : 0;
      
      const data = await fetchFeed(fetchCat, limit, searchQuery, offset);
      
      if (isAppend) {
        setArticles(prev => [...prev, ...data]);
      } else {
        setArticles(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setMoreLoading(false);
    }
  };

  // 监听分类或搜索变化
  useEffect(() => {
    if (articles.length === 0) {
      loadContent();
    }
  }, [externalCategoryRequest, searchQuery]);

  // 实现无限滚动：观察者模式
  useEffect(() => {
    if (!isPushingFull) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !moreLoading && !loading && articles.length > 0) {
          loadContent(true);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isPushingFull, moreLoading, articles.length]);

  /**
   * 点击恢复推送：立即抓取 6 篇并开启无限滚动
   */
  const handleRestorePush = () => {
    setIsPushingFull(true);
    setLoading(true);
    // 清空当前仅有的 1 篇，重新获取全量
    setArticles([]); 
    // useEffect 会因 articles 为空而触发重新抓取，但这里我们主动调用一次以确保响应速度
    loadContent(); 
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      
      {!searchQuery && externalCategoryRequest === 'All' && <DailyQuote />}

      {/* 顶部导航 */}
      <div className="sticky top-[64px] z-30 bg-brand-bg/80 apple-blur py-4 mb-10 border-b border-brand-border">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {searchQuery ? (
             <div className="flex items-center gap-3">
                <Search size={20} className="text-brand-primary" />
                <h2 className="font-semibold text-brand-text">搜索结果: "{searchQuery}"</h2>
                <button onClick={() => onCategoryChange('All')} className="text-xs text-brand-primary font-bold">清除搜索</button>
             </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => { onCategoryChange('All'); }} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${externalCategoryRequest === 'All' ? 'bg-brand-text text-brand-bg shadow-lg' : 'text-brand-muted hover:bg-brand-border/40'}`}>最新资讯</button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => { onCategoryChange(cat); }} className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${externalCategoryRequest === cat ? 'bg-brand-text text-brand-bg shadow-lg' : 'text-brand-muted hover:bg-brand-border/40'}`}>{cat}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse space-y-4">
                    <div className="aspect-[16/10] bg-brand-border/40 rounded-3xl"></div>
                    <div className="h-6 bg-brand-border/40 rounded w-3/4"></div>
                </div>
            ))}
        </div>
      ) : articles.length > 0 ? (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {articles.map((article) => (
                    <div 
                        key={article.id} 
                        onClick={() => onArticleSelect(article)}
                        className="group cursor-pointer flex flex-col apple-in"
                    >
                        <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden bg-brand-border apple-card-shadow mb-6">
                            <img src={article.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="px-2">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded">{article.category}</span>
                                <span className="text-brand-muted text-[11px] font-medium">{article.source}</span>
                            </div>
                            <h3 className="font-bold text-xl text-brand-text mb-3 leading-tight group-hover:text-brand-primary transition-colors line-clamp-2">{article.title}</h3>
                            <p className="text-sm text-brand-muted leading-relaxed line-clamp-2">{article.summary}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 当处于“精简模式”时，显示恢复推送按钮 */}
            {!isPushingFull && (
                <div className="flex flex-col items-center py-20 animate-apple-in">
                    <div className="max-w-md w-full p-10 bg-brand-surface apple-blur rounded-[3rem] border border-brand-border apple-card-shadow text-center">
                        <Zap className="text-brand-primary mx-auto mb-6" size={40} />
                        <h3 className="text-2xl font-bold mb-4">想阅读更多深度外刊？</h3>
                        <p className="text-brand-muted text-sm mb-8 leading-relaxed">AI 将根据当前版块为你实时抓取 6 篇全球顶级期刊报道，开启沉浸式学习模式。</p>
                        <button 
                            onClick={handleRestorePush}
                            className="w-full py-4 bg-brand-text text-brand-bg rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                        >
                            <Zap size={18} fill="currentColor" />
                            恢复文章抓取
                        </button>
                    </div>
                </div>
            )}

            {/* 无限滚动加载指示器 */}
            {isPushingFull && (
                <div ref={observerTarget} className="h-20 flex items-center justify-center">
                    {moreLoading ? (
                        <div className="flex items-center gap-3 text-brand-muted font-bold text-sm">
                            <Loader2 className="animate-spin text-brand-primary" size={20} />
                            正在抓取更多内容...
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-brand-muted/40 animate-bounce">
                            <span className="text-[10px] font-bold uppercase tracking-widest">滑动继续探索</span>
                            <ChevronDown size={16} />
                        </div>
                    )}
                </div>
            )}
        </div>
      ) : (
        <div className="text-center py-40">
            <h3 className="text-xl font-bold text-brand-muted">暂无内容，请尝试更换分类或搜索。</h3>
        </div>
      )}
    </div>
  );
};

export default Feed;
