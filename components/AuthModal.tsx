import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Category, User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const CATEGORIES: Category[] = ['World', 'Business', 'Technology', 'Science', 'Culture', 'Economics'];

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Preferences (only for register)
  const [name, setName] = useState('');
  const [selectedCats, setSelectedCats] = useState<Category[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && step === 1) {
      setStep(2);
      return;
    }
    
    // Simulate login
    const user: User = {
      name: name || 'Reader',
      email: 'user@example.com',
      preferences: selectedCats
    };
    onLogin(user);
    onClose();
  };

  const toggleCat = (cat: Category) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      if (selectedCats.length < 3) {
        setSelectedCats([...selectedCats, cat]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="font-sans font-bold text-2xl text-slate-900 mb-2">
              {step === 2 ? 'Personalize Feed' : (isRegister ? 'Join The Daily Insight' : 'Welcome Back')}
            </h2>
            <p className="text-sm text-slate-500">
              {step === 2 
                ? 'Select up to 3 topics you care about.' 
                : 'Access premium articles and build your vocabulary.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                {isRegister && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" placeholder="name@example.com" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                  <input type="password" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" placeholder="••••••••" required />
                </div>
              </>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCat(cat)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                      selectedCats.includes(cat)
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-primary'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {cat}
                    {selectedCats.includes(cat) && <Check size={16} />}
                  </button>
                ))}
              </div>
            )}

            <button type="submit" className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
              {step === 1 ? (isRegister ? 'Continue' : 'Sign In') : 'Finish Setup'}
            </button>
          </form>

          {step === 1 && (
            <div className="mt-6 text-center text-sm">
              <span className="text-slate-500">{isRegister ? 'Already have an account?' : 'New here?'} </span>
              <button 
                onClick={() => setIsRegister(!isRegister)} 
                className="text-brand-primary font-bold hover:underline"
              >
                {isRegister ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;