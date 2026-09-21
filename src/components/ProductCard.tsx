import React from 'react';
import { Star, ExternalLink, Flame, Eye, Sparkles, Play } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  currency?: string;
  onOpenDetails: (product: Product) => void;
  onTrackClick: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency = 'R$',
  onOpenDetails,
  onTrackClick,
}) => {
  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTrackClick(product.id);
    window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
  };

  const formattedPrice = Number(product.price).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedOldPrice = product.old_price 
    ? Number(product.old_price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null;

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col cursor-pointer relative"
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 flex-wrap max-w-[70%]">
          {product.discount > 0 && (
            <span className="px-2 py-0.5 rounded-lg bg-white text-black text-[11px] font-black tracking-tight shadow-md">
              -{product.discount}%
            </span>
          )}
          {product.trending === 1 && (
            <span className="px-2 py-0.5 rounded-lg bg-zinc-900/90 text-white border border-white/20 text-[10px] font-bold flex items-center gap-0.5 shadow-md">
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
              EM ALTA
            </span>
          )}
          {Boolean(product.video_url) && (
            <span className="px-2 py-0.5 rounded-lg bg-black/80 text-white border border-white/20 text-[10px] font-bold flex items-center gap-1 shadow-md backdrop-blur-md">
              <Play className="w-2.5 h-2.5 fill-white" />
              VÍDEO
            </span>
          )}
        </div>

        {/* Score da Coruja Pill */}
        <div 
          className="px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md border border-zinc-700 text-zinc-200 text-[11px] font-bold flex items-center gap-1 shadow-md"
          title={`Score da Coruja: ${product.trend_score}/100`}
        >
          <span className="text-xs">🦉</span>
          <span>{product.trend_score}</span>
        </div>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-50 group-hover:opacity-10 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400 mb-1.5">
            <span className="uppercase font-semibold tracking-wider text-zinc-400">
              {product.category_name || 'Achadinho'}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-white fill-white" />
              <span className="font-semibold text-zinc-200">{product.rating ? Number(product.rating).toFixed(1) : '4.8'}</span>
              {product.sales_count > 0 && (
                <span className="text-zinc-500 text-[10px]">({product.sales_count})</span>
              )}
            </div>
          </div>

          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-zinc-200 transition-colors">
            {product.name}
          </h3>

          {product.short_description && (
            <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
              {product.short_description}
            </p>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-zinc-800 space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="flex items-baseline">
              <span className="text-xs font-bold text-zinc-400 mr-1">{currency}</span>
              <span className="text-lg font-black text-white">{formattedPrice}</span>
            </div>
            {formattedOldPrice && (
              <span className="text-xs text-zinc-500 line-through">
                {currency} {formattedOldPrice}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(product);
              }}
              className="py-2 px-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-800"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Detalhes</span>
            </button>

            <button
              onClick={handleBuyClick}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
            >
              <span>Ver Oferta</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
