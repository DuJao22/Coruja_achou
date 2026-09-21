import React from 'react';
import { Sparkles, Flame, CheckCircle2, ArrowRight } from 'lucide-react';

interface HeroProps {
  totalProducts: number;
  onExploreTrending: () => void;
  onExploreFeatured: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  totalProducts,
  onExploreTrending,
  onExploreFeatured,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-10 bg-black border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>Curadoria editorial diária de achadinhos virais</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            A coruja encontrou. <br />
            <span className="text-zinc-400">
              Agora é sua vez de aproveitar.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Reunimos os produtos mais inteligentes, utilitários indispensáveis e ofertas imperdíveis garimpados nos maiores marketplaces, avaliados com o rigor do nosso <strong>Score da Coruja</strong>.
          </p>

          {/* Quick CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onExploreTrending}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-sm"
            >
              <Flame className="w-4 h-4 text-black fill-black" />
              Ver Produtos em Alta
            </button>
            <button
              onClick={onExploreFeatured}
              className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold border border-zinc-800 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-zinc-400" />
              Achados do Dia
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-6 grid grid-cols-3 gap-2 max-w-lg mx-auto border-t border-zinc-850 text-left">
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>Links 100% seguros</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>{totalProducts}+ Achadinhos</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>Ofertas reais</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
