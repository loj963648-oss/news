import React from 'react';
import { X, Moon, Sun, Monitor, BookOpen, Coffee } from 'lucide-react';
import { Category, Theme } from '../types';

interface NavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect: (cat: Category | 'All') => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const CATEGORIES: Category[] = ['World', 'Business', 'Technology', 'Science', 'Culture', 'Economics'];

const NavMenu: React.FC<NavMenuProps> = ({ isOpen, onClose, onCategorySelect, currentTheme, onThemeChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Drawer */}
      <div className="relative w-[300px] md:w-[400px] h-full bg-brand-bg text-brand-text shadow-2xl animate-slide-in flex flex-col border-r border-brand-border">
        <div className="p-6 flex justify-between items-center border-b border-brand-border">
          <h2 className="font-sans font-bold text-xl tracking-tight">Menu</h2>
          <button onClick={onClose} className="p-2 hover:bg-brand-surface rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto py-6 px-6">
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-4">Sections</h3>
            <ul className="space-y-4">
              <li>
                <button 
                  onClick={() => { onCategorySelect('All'); onClose(); }}
                  className="text-2xl font-serif font-medium hover:text-brand-primary transition-colors text-left w-full"
                >
                  Latest News
                </button>
              </li>
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => { onCategorySelect(cat); onClose(); }}
                    className="text-2xl font-serif font-medium hover:text-brand-primary transition-colors text-left w-full"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8 border-t border-brand-border pt-8">
             <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-4">Appearance</h3>
             <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => onThemeChange('light')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${currentTheme === 'light' ? 'border-brand-primary bg-brand-surface text-brand-primary' : 'border-brand-border hover:bg-brand-surface'}`}
                >
                    <Sun size={18} /> Light
                </button>
                <button 
                    onClick={() => onThemeChange('dark')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${currentTheme === 'dark' ? 'border-brand-primary bg-brand-surface text-brand-primary' : 'border-brand-border hover:bg-brand-surface'}`}
                >
                    <Moon size={18} /> Dark
                </button>
                <button 
                    onClick={() => onThemeChange('sepia')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${currentTheme === 'sepia' ? 'border-brand-primary bg-brand-surface text-brand-primary' : 'border-brand-border hover:bg-brand-surface'}`}
                >
                    <Coffee size={18} /> Sepia
                </button>
                <button 
                    onClick={() => onThemeChange('system')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${currentTheme === 'system' ? 'border-brand-primary bg-brand-surface text-brand-primary' : 'border-brand-border hover:bg-brand-surface'}`}
                >
                    <Monitor size={18} /> System
                </button>
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-brand-border bg-brand-surface text-xs text-brand-muted text-center">
            &copy; 2024 The Daily Insight. <br/> Sourcing from NYT, Economist & More.
        </div>
      </div>
    </div>
  );
};

export default NavMenu;