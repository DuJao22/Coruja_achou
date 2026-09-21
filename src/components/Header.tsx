import React, { useState } from 'react';
import { Search, Sparkles, Flame, SlidersHorizontal, Shield, ExternalLink, X } from 'lucide-react';
import { Category } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  onOpenAdmin: () => void;
  siteName: string;
  slogan: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenAdmin,
  siteName,
  slogan
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
            onClick={() => onSelectCategory(null)}
          >
            <div className="w-13 h-13 rounded-full overflow-hidden border border-white/20 shadow-md group-hover:border-white transition-all bg-black shrink-0">
              <img 
                src="/logo.jpg" 
                alt="Coruja Achou" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white uppercase transition-colors">
                  {siteName || 'CORUJA ACHOU'}
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-white text-black">
                  Radar
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium line-clamp-1 hidden sm:block">
                {slogan || 'A coruja encontrou. Agora é sua vez.'}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar achadinhos, produtos inteligentes, ofertas..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-full pl-11 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-all"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3.5 top-3 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onSelectCategory(null)}
              className={`hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === null 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Todos os Achados
            </button>

            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 transition-all hover:border-zinc-700"
              title="Acessar Painel de Controle"
            >
              <Shield className="w-3.5 h-3.5 text-zinc-400" />
              <span>Painel Admin</span>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar produtos e achadinhos..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-full pl-10 pr-10 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
