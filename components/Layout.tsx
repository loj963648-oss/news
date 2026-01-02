
import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { Menu, Search, User as UserIcon, LogOut, X } from 'lucide-react';
import { User, Theme, Category } from '../types';
import NavMenu from './NavMenu';

interface LayoutProps {
  children: ReactNode;
  onHomeClick: () => void;
  user: User | null;
  onAuthClick: () => void;
  onLogout: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onCategorySelect: (cat: Category | 'All') => void;
  onSearch: (query: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, onHomeClick, user, onAuthClick, onLogout,
  currentTheme, onThemeChange, onCategorySelect, onSearch
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(inputValue);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-brand-bg text-brand-text">
      
      <NavMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onCategorySelect={onCategorySelect}
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
      />

      {/* Apple-style Navigation */}
      <header className="sticky top-0 z-40 bg-brand-bg/70 apple-blur border-b border-brand-border">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
             <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center hover:bg-brand-border/40 rounded-full transition-colors"
             >
              <Menu size={22} />
            </button>
            <button onClick={onHomeClick} className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-brand-text text-brand-bg rounded-lg flex items-center justify-center font-bold text-lg transform group-hover:scale-110 transition-transform">
                I
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block">Insight</span>
            </button>
          </div>

          <div className="flex-grow max-w-xl mx-8 hidden md:block">
            <div className="relative group" ref={searchRef}>
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
               <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search stories, topics, and ideas" 
                  className="w-full pl-12 pr-4 py-2.5 bg-brand-border/30 border border-transparent rounded-2xl text-sm focus:bg-brand-bg focus:border-brand-primary/30 outline-none transition-all"
               />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
               <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-brand-text text-brand-bg flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <button onClick={onLogout} className="text-brand-muted hover:text-brand-text transition-colors">
                    <LogOut size={18} />
                  </button>
               </div>
            ) : (
               <button 
                  onClick={onAuthClick}
                  className="px-6 py-2 bg-brand-text text-brand-bg rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-md shadow-black/5"
               >
                  Sign In
               </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-brand-bg border-t border-brand-border py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-2xl mb-6">Insight</h3>
            <p className="text-brand-muted max-w-sm leading-relaxed font-medium">
              Curated English journalism for the modern intellectual. <br/>
              Bilingual, beautiful, and boundaryless.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-brand-muted">Explore</h4>
            <ul className="space-y-4 text-sm font-semibold">
              <li className="hover:text-brand-primary cursor-pointer transition-colors">Latest Feed</li>
              <li className="hover:text-brand-primary cursor-pointer transition-colors">Trending Topics</li>
              <li className="hover:text-brand-primary cursor-pointer transition-colors">Archive</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-brand-muted">Legal</h4>
            <ul className="space-y-4 text-sm font-semibold">
              <li className="hover:text-brand-primary cursor-pointer transition-colors">Privacy</li>
              <li className="hover:text-brand-primary cursor-pointer transition-colors">Terms</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
