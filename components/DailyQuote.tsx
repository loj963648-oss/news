
import React, { useEffect, useState } from 'react';
import { DailyQuote as DailyQuoteType } from '../types';
import { fetchDailyQuote } from '../services/geminiService';
import { Sparkles } from 'lucide-react';

const DailyQuote: React.FC = () => {
  const [quote, setQuote] = useState<DailyQuoteType | null>(null);

  useEffect(() => {
    fetchDailyQuote().then(setQuote);
  }, []);

  if (!quote) return null;

  return (
    <div className="relative w-full h-[500px] mb-20 rounded-[3rem] overflow-hidden apple-card-shadow group apple-in">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[15s] ease-out group-hover:scale-110"
        style={{ backgroundImage: `url(${quote.imageUrl})` }}
      ></div>
      
      {/* Dynamic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20"></div>

      <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-20 max-w-5xl">
        <div className="flex items-center gap-3 text-white/70 mb-6 apple-in" style={{ animationDelay: '200ms' }}>
           <div className="p-2 bg-white/10 apple-blur rounded-xl">
               <Sparkles size={16} className="text-brand-primary" />
           </div>
           <span className="text-xs font-bold uppercase tracking-[0.2em]">Insight of the day • {quote.category}</span>
        </div>
        
        <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white leading-[1.15] mb-8 italic apple-in" style={{ animationDelay: '400ms' }}>
          "{quote.en}"
        </h2>
        
        <div className="flex flex-col md:flex-row md:items-center gap-8 apple-in" style={{ animationDelay: '600ms' }}>
            <p className="text-lg md:text-xl text-white/80 font-medium border-l-2 border-brand-primary pl-6 max-w-2xl">
              {quote.cn}
            </p>
            <div className="text-white/60 font-semibold tracking-widest text-sm uppercase flex items-center gap-4">
                <div className="h-px w-8 bg-white/30"></div>
                {quote.author}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuote;
