
import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { Menu, Search, User as UserIcon, LogOut, X, Info, ShieldCheck, FileText } from 'lucide-react';
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
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [legalView, setLegalView] = useState<'privacy' | 'terms' | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(inputValue);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

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

      {/* Footer Area */}
      <footer className="bg-brand-bg border-t border-brand-border py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-brand-text text-brand-bg rounded-lg flex items-center justify-center font-bold text-lg">I</div>
                <h3 className="font-bold text-2xl tracking-tight">Insight</h3>
              </div>
              <p className="text-brand-muted max-w-sm leading-relaxed font-medium">
                Curated English journalism for the modern intellectual. <br/>
                Bilingual, beautiful, and boundaryless. Powered by Gemini.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-[10px] mb-8 uppercase tracking-[0.2em] text-brand-muted opacity-60">Explore</h4>
              <ul className="space-y-5 text-sm font-bold">
                <li onClick={scrollToTop} className="text-brand-text hover:text-brand-primary cursor-pointer transition-all hover:translate-x-1 duration-300">Latest Feed</li>
                <li onClick={() => triggerToast("Trending section coming soon...")} className="text-brand-text hover:text-brand-primary cursor-pointer transition-all hover:translate-x-1 duration-300">Trending Topics</li>
                <li onClick={() => triggerToast("Archive is being prepared...")} className="text-brand-text hover:text-brand-primary cursor-pointer transition-all hover:translate-x-1 duration-300">Archive</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-[10px] mb-8 uppercase tracking-[0.2em] text-brand-muted opacity-60">Legal</h4>
              <ul className="space-y-5 text-sm font-bold">
                <li onClick={() => setLegalView('privacy')} className="text-brand-text hover:text-brand-primary cursor-pointer transition-all hover:translate-x-1 duration-300">Privacy Policy</li>
                <li onClick={() => setLegalView('terms')} className="text-brand-text hover:text-brand-primary cursor-pointer transition-all hover:translate-x-1 duration-300">Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-[11px] font-bold tracking-widest text-brand-muted uppercase">
               &copy; {currentYear} The Daily Insight. All Rights Reserved.
             </p>
             <div className="flex items-center gap-6">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[11px] font-bold text-brand-muted uppercase tracking-widest">Global Status: Operational</span>
             </div>
          </div>
        </div>
      </footer>

      {/* Global Toast Notification */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-apple-in">
           <div className="bg-brand-text text-brand-bg px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 apple-blur border border-brand-border/10">
              <Info size={16} className="text-brand-primary" />
              <span className="text-sm font-bold">{toastMessage}</span>
           </div>
        </div>
      )}

      {/* Legal Modal */}
      {legalView && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setLegalView(null)}></div>
            <div className="relative bg-brand-bg border border-brand-border w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-apple-in max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        {legalView === 'privacy' ? <ShieldCheck className="text-brand-primary" size={32} /> : <FileText className="text-brand-primary" size={32} />}
                        <h2 className="text-3xl font-bold tracking-tight">
                            {legalView === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                        </h2>
                    </div>
                    <button onClick={() => setLegalView(null)} className="p-3 hover:bg-brand-border/40 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-4 space-y-8 font-serif text-brand-muted leading-relaxed">
                    <section>
                        <h3 className="text-brand-text font-bold text-lg mb-3">Last Updated: {currentYear}</h3>
                        <p>Welcome to The Daily Insight. Your privacy and trust are paramount to us. This document outlines how we process information in our commitment to delivering high-quality English journalism.</p>
                    </section>
                    
                    <section>
                        <h4 className="text-brand-text font-bold mb-2">1. Information We Collect</h4>
                        <p>We collect minimal data necessary for personalizing your reading experience. This includes reading preferences and basic account information if you choose to sign in.</p>
                    </section>
                    
                    <section>
                        <h4 className="text-brand-text font-bold mb-2">2. AI & Data Usage</h4>
                        <p>Our bilingual translations and vocabulary analysis are powered by Gemini. Content is generated in real-time to assist your English learning journey. We do not sell your personal data to third parties.</p>
                    </section>
                    
                    <section>
                        <h4 className="text-brand-text font-bold mb-2">3. Intellectual Property</h4>
                        {/* Fix: changed closing tag from </psection> to </p></section> to correctly close paragraph and section elements. */}
                        <p>The articles presented on this platform are curated from global sources including The Economist, NYT, and more. Our platform acts as a reading aid and educational interface.</p>
                    </section>

                    <p className="pt-10 italic">If you have any questions regarding these terms, please contact our support team at legal@dailyinsight.ai</p>
                </div>
                
                <button 
                  onClick={() => setLegalView(null)}
                  className="w-full mt-10 py-5 bg-brand-text text-brand-bg rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                  I Understand
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
