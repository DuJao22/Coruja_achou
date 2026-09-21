import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category, SiteSettings, Banner } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FullBanner } from './components/FullBanner';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { 
  Sparkles, 
  Flame, 
  SlidersHorizontal, 
  ArrowUpDown, 
  X, 
  Search,
  PackageOpen
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'CORUJA ACHOU',
    slogan: 'A coruja encontrou. Agora é sua vez.',
    description: 'Uma plataforma que reúne produtos interessantes, achados, ofertas e produtos em alta garimpados especialmente para você.',
    currency: 'R$',
    instagram: '',
    tiktok: '',
    whatsapp: '',
    footer_text: '© 2026 CORUJA ACHOU. Todos os direitos reservados.'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'featured' | 'trending'>('all');
  const [sortOption, setSortOption] = useState<'default' | 'score' | 'price_asc' | 'price_desc' | 'discount' | 'sales'>('default');
  
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, settingsRes, bannersRes] = await Promise.all([
        fetch('/api/products?all=true'),
        fetch('/api/categories'),
        fetch('/api/settings'),
        fetch('/api/banners?all=true'),
      ]);

      if (productsRes.ok) {
        const prodData = await productsRes.json();
        setProducts(prodData);
      }
      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        setCategories(catData);
      }
      if (settingsRes.ok) {
        const setData = await settingsRes.json();
        setSettings(setData);
      }
      if (bannersRes.ok) {
        const bannerData = await bannersRes.json();
        setBanners(bannerData);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Track product click
  const handleTrackClick = (productId: number) => {
    fetch(`/api/track-click/${productId}`, { method: 'POST' }).catch(() => {});
  };

  // Filter and sort active products for showcase
  const activeProducts = useMemo(() => {
    return products.filter(p => p.active === 1);
  }, [products]);

  // Featured highlights (Top 4)
  const featuredProducts = useMemo(() => {
    return activeProducts.filter(p => p.featured === 1).slice(0, 4);
  }, [activeProducts]);

  // Trending products (Top 4)
  const trendingProducts = useMemo(() => {
    return [...activeProducts]
      .filter(p => p.trending === 1 || p.trend_score >= 93)
      .sort((a, b) => b.trend_score - a.trend_score)
      .slice(0, 4);
  }, [activeProducts]);

  // Full Catalog filtering
  const catalogProducts = useMemo(() => {
    let list = [...activeProducts];

    // Filter by tab
    if (filterTab === 'featured') {
      list = list.filter(p => p.featured === 1);
    } else if (filterTab === 'trending') {
      list = list.filter(p => p.trending === 1 || p.trend_score >= 90);
    }

    // Filter by category
    if (selectedCategory) {
      const cat = categories.find(c => c.slug === selectedCategory);
      if (cat) {
        list = list.filter(p => p.category_id === cat.id);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.short_description && p.short_description.toLowerCase().includes(q)) ||
        (p.category_name && p.category_name.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortOption === 'score') {
      list.sort((a, b) => b.trend_score - a.trend_score);
    } else if (sortOption === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'discount') {
      list.sort((a, b) => b.discount - a.discount);
    } else if (sortOption === 'sales') {
      list.sort((a, b) => b.sales_count - a.sales_count);
    } else {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [activeProducts, filterTab, selectedCategory, searchQuery, sortOption, categories]);

  const currentCategoryObj = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          setSearchQuery('');
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        siteName={settings.site_name}
        slogan={settings.slogan}
      />

      {/* Hero Banner (Only shown when not searching and on home) */}
      {!selectedCategory && !searchQuery && (
        <>
          {/* Top FullBanner Carousel linked directly to products */}
          {banners.length > 0 && (
            <FullBanner
              banners={banners}
              products={products}
              currency={settings.currency}
              onOpenProduct={(p) => setActiveModalProduct(p)}
              onTrackClick={handleTrackClick}
            />
          )}

          <Hero
            totalProducts={activeProducts.length}
            onExploreTrending={() => {
              setFilterTab('trending');
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onExploreFeatured={() => {
              setFilterTab('featured');
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </>
      )}

      {/* Category Pills Bar */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          setSearchQuery('');
        }}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-12 w-full">
        {/* If category is selected, show category hero banner */}
        {selectedCategory && currentCategoryObj && (
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{currentCategoryObj.icon}</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{currentCategoryObj.name}</h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">{currentCategoryObj.description}</p>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Ver Todas as Categorias</span>
            </button>
          </div>
        )}

        {/* Featured Section (Shown when no search/filter is active) */}
        {!selectedCategory && !searchQuery && featuredProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                    Achados de Hoje
                  </h2>
                  <p className="text-xs text-zinc-400">Seleção editorial com descontos expressivos</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={settings.currency}
                  onOpenDetails={setActiveModalProduct}
                  onTrackClick={handleTrackClick}
                />
              ))}
            </div>
          </section>
        )}

        {/* Trending Section (Score da Coruja) */}
        {!selectedCategory && !searchQuery && trendingProducts.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-zinc-850">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-zinc-900 text-white border border-zinc-800">
                  <Flame className="w-4 h-4 text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                    Produtos em Alta & Score da Coruja
                  </h2>
                  <p className="text-xs text-zinc-400">Itens que estão viralizando com nota máxima</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={settings.currency}
                  onOpenDetails={setActiveModalProduct}
                  onTrackClick={handleTrackClick}
                />
              ))}
            </div>
          </section>
        )}

        {/* Complete Catalog Section */}
        <section id="catalogo" className="space-y-6 pt-4 border-t border-zinc-850">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>Catálogo Completo</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800">
                  {catalogProducts.length} itens
                </span>
              </h2>
              {searchQuery && (
                <p className="text-xs text-zinc-400 mt-1">
                  Resultados encontrados para: &ldquo;<strong className="text-white">{searchQuery}</strong>&rdquo;
                </p>
              )}
            </div>

            {/* Controls: Filter tabs & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-semibold">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    filterTab === 'all' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterTab('featured')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    filterTab === 'featured' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Destaques
                </button>
                <button
                  onClick={() => setFilterTab('trending')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    filterTab === 'trending' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Em Alta
                </button>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="default" className="bg-zinc-950">Mais Recentes</option>
                  <option value="score" className="bg-zinc-950">Maior Score Coruja</option>
                  <option value="discount" className="bg-zinc-950">Maior Desconto (%)</option>
                  <option value="sales" className="bg-zinc-950">Mais Vendidos</option>
                  <option value="price_asc" className="bg-zinc-950">Menor Preço</option>
                  <option value="price_desc" className="bg-zinc-950">Maior Preço</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid or Empty State */}
          {catalogProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {catalogProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={settings.currency}
                  onOpenDetails={setActiveModalProduct}
                  onTrackClick={handleTrackClick}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto bg-zinc-950 border border-zinc-800 rounded-3xl p-8">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 text-3xl flex items-center justify-center mx-auto text-zinc-400">
                🦉
              </div>
              <h3 className="text-base font-bold text-white">Nenhum achadinho encontrado</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Não localizamos produtos correspondentes aos filtros selecionados. Experimente buscar outro termo ou limpar os filtros.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setFilterTab('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black transition-all shadow-sm"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Product Details Modal */}
      {activeModalProduct && (
        <ProductModal
          product={activeModalProduct}
          currency={settings.currency}
          onClose={() => setActiveModalProduct(null)}
          onTrackClick={handleTrackClick}
          onSelectProduct={(p) => setActiveModalProduct(p)}
        />
      )}

      {/* Admin Dashboard */}
      {isAdminOpen && (
        <AdminDashboard
          onClose={() => setIsAdminOpen(false)}
          categories={categories}
          products={products}
          banners={banners}
          settings={settings}
          onRefreshData={fetchData}
        />
      )}

      {/* Footer */}
      <Footer
        settings={settings}
        categories={categories}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          setSearchQuery('');
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
    </div>
  );
}
