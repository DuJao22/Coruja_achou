import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink, Flame, Play } from 'lucide-react';
import { Banner, Product } from '../types';

interface FullBannerProps {
  banners: Banner[];
  products: Product[];
  currency?: string;
  onOpenProduct: (product: Product) => void;
  onTrackClick: (productId: number) => void;
}

export const FullBanner: React.FC<FullBannerProps> = ({
  banners,
  products,
  currency = 'R$',
  onOpenProduct,
  onTrackClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeBanners = banners.filter((b) => b.active === 1).sort((a, b) => (a.order || 0) - (b.order || 0));

  const nextSlide = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  }, [activeBanners.length]);

  const prevSlide = useCallback(() => {
    if (activeBanners.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused || activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide, activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex];
  // Linked product
  const linkedProduct = currentBanner?.product_id
    ? products.find((p) => p.id === currentBanner.product_id)
    : null;

  const handleBannerClick = () => {
    if (linkedProduct) {
      onOpenProduct(linkedProduct);
    } else if (currentBanner.cta_url) {
      window.open(currentBanner.cta_url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDirectBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (linkedProduct) {
      onTrackClick(linkedProduct.id);
      window.open(linkedProduct.affiliate_url, '_blank', 'noopener,noreferrer');
    } else if (currentBanner.cta_url) {
      window.open(currentBanner.cta_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-8 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        onClick={handleBannerClick}
        className="relative w-full h-[360px] sm:h-[440px] md:h-[480px] lg:h-[500px] rounded-3xl overflow-hidden cursor-pointer group shadow-2xl border border-zinc-800/80 bg-zinc-950"
      >
        {/* Background images for all slides */}
        {activeBanners.map((banner, idx) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            {/* Dark & Gradient Overlays for High Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 md:bg-gradient-to-r md:from-black/95 md:via-black/70 md:to-transparent" />
          </div>
        ))}

        {/* Content Box */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end md:justify-center p-6 sm:p-10 md:p-12 lg:p-16 max-w-2xl text-white">
          <div className="space-y-3 sm:space-y-4">
            {/* Tag Badge */}
            {currentBanner.tag && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black text-xs font-black tracking-wider uppercase backdrop-blur-md shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>{currentBanner.tag}</span>
              </div>
            )}

            {/* Banner Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
              {currentBanner.title}
            </h2>

            {/* Subtitle / Description */}
            {currentBanner.subtitle && (
              <p className="text-xs sm:text-sm md:text-base text-zinc-400 line-clamp-2 max-w-xl drop-shadow">
                {currentBanner.subtitle}
              </p>
            )}

            {/* Linked Product Micro-Card Preview */}
            {linkedProduct && (
              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-black/90 border border-zinc-700 backdrop-blur-md flex items-center gap-2.5">
                  <span className="text-xs">🦉 Score {linkedProduct.trend_score}</span>
                  <span className="text-zinc-600">|</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-zinc-400 font-bold">{currency}</span>
                    <span className="font-black text-white text-sm">
                      {Number(linkedProduct.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {linkedProduct.old_price && (
                    <span className="text-[11px] text-zinc-500 line-through">
                      {currency} {Number(linkedProduct.old_price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                  {linkedProduct.discount > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-white text-black text-[10px] font-black">
                      -{linkedProduct.discount}%
                    </span>
                  )}
                </div>

                {linkedProduct.video_url && (
                  <span className="px-2.5 py-1 rounded-xl bg-zinc-900 text-white border border-white/20 text-[11px] font-bold flex items-center gap-1 backdrop-blur-md">
                    <Play className="w-3 h-3 fill-white" />
                    Com Vídeo
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDirectBuy}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black text-xs sm:text-sm font-black flex items-center gap-2 shadow-xl transition-all hover:scale-105"
              >
                <span>{currentBanner.cta_text || 'VER OFERTA EXCLUSIVA'}</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              {linkedProduct && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenProduct(linkedProduct);
                  }}
                  className="px-4 py-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs sm:text-sm font-semibold transition-all backdrop-blur-md"
                >
                  Ver Ficha Completa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Arrows (only if more than 1 banner) */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/70 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-xl"
              aria-label="Banner anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/70 hover:bg-white text-white hover:text-black flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-xl"
              aria-label="Próximo banner"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Indicators */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-4 right-6 z-30 flex items-center gap-2">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-white shadow-lg'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Ir para banner ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
