import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Star, 
  Flame, 
  ShieldCheck, 
  Share2, 
  Check, 
  Sparkles,
  TrendingUp,
  Percent,
  Play,
  Image as ImageIcon
} from 'lucide-react';
import { Product } from '../types';
import { VideoPlayer } from './VideoPlayer';

interface ProductModalProps {
  product: Product | null;
  currency?: string;
  onClose: () => void;
  onTrackClick: (productId: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  currency = 'R$',
  onClose,
  onTrackClick,
  onSelectProduct,
}) => {
  if (!product) return null;

  const [mediaMode, setMediaMode] = useState<'image' | 'video'>('image');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const images = [
    product.image,
    ...(product.additional_images || [])
  ].filter(Boolean);

  const currentImage = images[activeImageIndex] || product.image;

  const formattedPrice = Number(product.price).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedOldPrice = product.old_price 
    ? Number(product.old_price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null;

  const savings = product.old_price && product.old_price > product.price
    ? Number(product.old_price - product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : null;

  const handleBuy = () => {
    onTrackClick(product.id);
    window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Olha esse achadinho que encontrei no CORUJA ACHOU: ${product.name} por apenas ${currency} ${formattedPrice}! Acesse: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div 
        className="relative w-full max-w-4xl bg-black border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-800"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Media Column */}
          <div className="p-6 bg-zinc-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800">
            <div>
              {/* Media Mode Tabs (Photos vs Video) */}
              {product.video_url && (
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setMediaMode('image')}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                      mediaMode === 'image'
                        ? 'bg-white border-white text-black shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Fotos ({images.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaMode('video')}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                      mediaMode === 'video'
                        ? 'bg-white border-white text-black shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Ver Vídeo Demonstrativo</span>
                  </button>
                </div>
              )}

              {/* Main Media Viewport */}
              {mediaMode === 'video' && product.video_url ? (
                <div className="w-full">
                  <VideoPlayer
                    url={product.video_url}
                    title={product.name}
                    className="w-full aspect-square rounded-2xl overflow-hidden border border-zinc-800"
                    autoPlay={true}
                    controls={true}
                  />
                  <p className="text-[11px] text-zinc-500 text-center mt-2">
                    Demonstração em vídeo do produto
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white text-black text-xs font-black shadow-md">
                        -{product.discount}% OFF
                      </div>
                    )}
                    {product.video_url && (
                      <button
                        onClick={() => setMediaMode('video')}
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-white hover:text-black text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20 backdrop-blur-md transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Ver Vídeo</span>
                      </button>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveImageIndex(idx);
                            setMediaMode('image');
                          }}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                            activeImageIndex === idx && mediaMode === 'image'
                              ? 'border-white scale-95'
                              : 'border-zinc-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Score da Coruja Box */}
            <div className="mt-6 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🦉</span>
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">Score da Coruja</span>
                    <span className="text-[11px] text-zinc-400">Algoritmo de relevância e custo-benefício</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-white flex items-baseline gap-0.5">
                  <span>{product.trend_score}</span>
                  <span className="text-xs text-zinc-400">/100</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(product.trend_score, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-zinc-300 text-center">
                <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Viralidade</span>
                  <span className="font-bold text-white">Alta</span>
                </div>
                <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Custo x Benefício</span>
                  <span className="font-bold text-white">Excelente</span>
                </div>
                <div className="bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Garantia</span>
                  <span className="font-bold text-white">Segura</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-black">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 text-xs font-semibold">
                  {product.category_name || 'Achadinho'}
                </span>

                <div className="flex items-center gap-1 text-sm bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
                  <Star className="w-4 h-4 text-white fill-white" />
                  <span className="font-bold text-white">{product.rating ? Number(product.rating).toFixed(1) : '4.8'}</span>
                  {product.sales_count > 0 && (
                    <span className="text-zinc-500 text-xs">({product.sales_count} vendidos)</span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                {product.name}
              </h2>

              {/* Price card */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                <div className="flex items-baseline gap-3">
                  <div className="flex items-baseline">
                    <span className="text-sm font-bold text-zinc-400 mr-1.5">{currency}</span>
                    <span className="text-3xl sm:text-4xl font-black text-white">{formattedPrice}</span>
                  </div>
                  {formattedOldPrice && (
                    <span className="text-sm text-zinc-500 line-through">
                      {currency} {formattedOldPrice}
                    </span>
                  )}
                </div>

                {savings && (
                  <p className="text-xs font-semibold text-zinc-300 flex items-center gap-1 pt-1">
                    <Percent className="w-3.5 h-3.5 text-white" />
                    Você economiza {currency} {savings} nesta oferta
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Sobre este achadinho
                </h4>
                <div className="text-sm text-zinc-400 leading-relaxed max-h-48 overflow-y-auto pr-2 scrollbar-thin whitespace-pre-line">
                  {product.description || product.short_description || 'Produto garimpado e testado pela curadoria Coruja Achou.'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <button
                onClick={handleBuy}
                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.01]"
              >
                <span>VER NA LOJA / COMPRAR</span>
                <ExternalLink className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Mandar no WhatsApp</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>

              <p className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                Compra direta e segura no marketplace parceiro
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
