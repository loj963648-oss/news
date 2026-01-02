
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Feed from './components/Feed';
import ArticleReader from './components/ArticleReader';
import AuthModal from './components/AuthModal';
import { ArticlePreview, User, Theme, Category } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'feed' | 'article'>('feed');
  const [selectedArticle, setSelectedArticle] = useState<ArticlePreview | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // 核心优化：将文章数据保存在顶层，避免重复刷新
  const [articles, setArticles] = useState<ArticlePreview[]>([]);
  const [isPushingFull, setIsPushingFull] = useState(false); 
  
  const [theme, setTheme] = useState<Theme>('system');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedCategory, setFeedCategory] = useState<Category | 'All' | 'For You'>('All');

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (t: Theme) => {
      root.removeAttribute('data-theme');
      root.classList.remove('dark');
      if (t === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
           root.setAttribute('data-theme', 'dark');
           root.classList.add('dark');
        }
      } else {
        root.setAttribute('data-theme', t);
        if (t === 'dark') root.classList.add('dark');
      }
    };
    applyTheme(theme);
  }, [theme]);

  const handleArticleSelect = (article: ArticlePreview) => {
    setSelectedArticle(article);
    setView('article');
  };

  const handleBackToFeed = () => {
    setView('feed');
    setSelectedArticle(null);
    // 注意：这里不再清空 articles，从而实现“不重新抓取”
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setArticles([]); // 搜索时需要刷新列表
    setIsPushingFull(true); // 搜索通常需要返回多个结果
    setView('feed');
    if (query) setFeedCategory('All');
  };

  const handleCategorySelect = (cat: Category | 'All') => {
    setFeedCategory(cat);
    setSearchQuery('');
    setArticles([]); // 切换分类需刷新
    setIsPushingFull(false); // 重置为精简模式
    handleBackToFeed();
  }

  return (
    <>
      <Layout 
        onHomeClick={handleBackToFeed} 
        user={user} 
        onAuthClick={() => setIsAuthOpen(true)}
        onLogout={() => setUser(null)}
        currentTheme={theme}
        onThemeChange={setTheme}
        onCategorySelect={handleCategorySelect}
        onSearch={handleSearch}
      >
        {view === 'feed' ? (
          <Feed 
            articles={articles}
            setArticles={setArticles}
            isPushingFull={isPushingFull}
            setIsPushingFull={setIsPushingFull}
            onArticleSelect={handleArticleSelect} 
            user={user} 
            externalCategoryRequest={feedCategory}
            onCategoryChange={setFeedCategory}
            searchQuery={searchQuery}
          />
        ) : (
          selectedArticle && (
            <ArticleReader 
              preview={selectedArticle} 
              onBack={handleBackToFeed} 
            />
          )
        )}
      </Layout>
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={setUser} 
      />
    </>
  );
};

export default App;
