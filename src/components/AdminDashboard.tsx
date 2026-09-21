import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  MousePointerClick, 
  Package, 
  Tag, 
  Settings as SettingsIcon, 
  LogOut, 
  ArrowLeft,
  ExternalLink,
  Save,
  Flame,
  Sparkles,
  AlertCircle,
  Video,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import { Product, Category, SiteSettings, DashboardStats, Banner } from '../types';

interface AdminDashboardProps {
  onClose: () => void;
  categories: Category[];
  products: Product[];
  banners?: Banner[];
  settings: SiteSettings;
  onRefreshData: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  categories,
  products,
  banners = [],
  settings,
  onRefreshData,
}) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'banners' | 'categories' | 'settings'>('products');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Products filtering & modal
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    short_description: '',
    description: '',
    category_id: categories[0]?.id || 1,
    image: '',
    additional_images: '',
    video_url: '',
    price: '',
    old_price: '',
    trend_score: '90',
    rating: '5.0',
    sales_count: '150',
    affiliate_url: '',
    featured: false,
    trending: false,
    active: true,
  });

  // Banner modal & state
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    tag: '',
    image: '',
    mobile_image: '',
    video_url: '',
    product_id: '',
    cta_text: 'VER OFERTA',
    cta_url: '',
    order: '1',
    active: true,
  });

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    icon: '🏷️',
    description: '',
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  // Fetch stats on mount
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
    // Check if previously logged in
    if (localStorage.getItem('coruja_admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('coruja_admin_auth', 'true');
        fetchStats();
      } else {
        const data = await res.json();
        setAuthError(data.error || 'Credenciais inválidas.');
      }
    } catch (err) {
      setAuthError('Erro ao conectar ao servidor.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setUsername('Layon');
    setPassword('30031936');
    setIsAuthenticated(true);
    localStorage.setItem('coruja_admin_auth', 'true');
    fetchStats();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('coruja_admin_auth');
  };

  // Product actions
  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      short_description: '',
      description: '',
      category_id: categories[0]?.id || 1,
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80',
      additional_images: '',
      video_url: '',
      price: '',
      old_price: '',
      trend_score: '92',
      rating: '4.8',
      sales_count: '240',
      affiliate_url: '',
      featured: true,
      trending: true,
      active: true,
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      short_description: p.short_description || '',
      description: p.description || '',
      category_id: p.category_id,
      image: p.image,
      additional_images: (p.additional_images || []).join('\n'),
      video_url: p.video_url || '',
      price: String(p.price),
      old_price: p.old_price ? String(p.old_price) : '',
      trend_score: String(p.trend_score || 90),
      rating: String(p.rating || 5.0),
      sales_count: String(p.sales_count || 0),
      affiliate_url: p.affiliate_url || '',
      featured: p.featured === 1,
      trending: p.trending === 1,
      active: p.active === 1,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const additionalImagesArray = productForm.additional_images
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      ...productForm,
      additional_images: additionalImagesArray,
      price: parseFloat(productForm.price),
      old_price: productForm.old_price ? parseFloat(productForm.old_price) : null,
      trend_score: parseInt(productForm.trend_score, 10),
      rating: parseFloat(productForm.rating),
      sales_count: parseInt(productForm.sales_count, 10),
      category_id: parseInt(String(productForm.category_id), 10),
    };

    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      await onRefreshData();
      await fetchStats();
      setIsProductModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar produto.');
    }
  };

  const handleToggleProductStatus = async (id: number) => {
    try {
      await fetch(`/api/products/${id}/toggle-status`, { method: 'POST' });
      await onRefreshData();
      await fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      await onRefreshData();
      await fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  // Banner actions
  const handleOpenNewBanner = () => {
    setEditingBanner(null);
    setBannerForm({
      title: '',
      subtitle: '',
      tag: '🔥 NOVO DESTAQUE',
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=85',
      mobile_image: '',
      video_url: '',
      product_id: products[0]?.id ? String(products[0].id) : '',
      cta_text: 'VER OFERTA',
      cta_url: '',
      order: String(banners.length + 1),
      active: true,
    });
    setIsBannerModalOpen(true);
  };

  const handleEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setBannerForm({
      title: b.title,
      subtitle: b.subtitle || '',
      tag: b.tag || '',
      image: b.image,
      mobile_image: b.mobile_image || '',
      video_url: b.video_url || '',
      product_id: b.product_id ? String(b.product_id) : '',
      cta_text: b.cta_text || 'VER OFERTA',
      cta_url: b.cta_url || '',
      order: String(b.order || 1),
      active: b.active === 1,
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...bannerForm,
      order: parseInt(bannerForm.order, 10) || 1,
      product_id: bannerForm.product_id ? parseInt(bannerForm.product_id, 10) : undefined,
    };

    try {
      if (editingBanner) {
        await fetch(`/api/banners/${editingBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      await onRefreshData();
      await fetchStats();
      setIsBannerModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar banner.');
    }
  };

  const handleToggleBannerStatus = async (id: number) => {
    try {
      await fetch(`/api/banners/${id}/toggle-status`, { method: 'POST' });
      await onRefreshData();
      await fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBanner = async (id: number, title: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o banner "${title}"?`)) return;
    try {
      await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      await onRefreshData();
      await fetchStats();
    } catch (e) {
      console.error(e);
    }
  };

  // Category actions
  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '', icon: '🏷️', description: '' });
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (c: Category) => {
    setEditingCategory(c);
    setCategoryForm({ name: c.name, slug: c.slug, icon: c.icon || '🏷️', description: c.description || '' });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm),
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryForm),
        });
      }
      await onRefreshData();
      await fetchStats();
      setIsCategoryModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar categoria.');
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!window.confirm(`Deseja excluir a categoria "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Erro ao excluir categoria.');
        return;
      }
      await onRefreshData();
      await fetchStats();
    } catch (err) {
      alert('Erro ao excluir categoria.');
    }
  };

  // Settings action
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      await onRefreshData();
      setSaveSettingsSuccess(true);
      setTimeout(() => setSaveSettingsSuccess(false), 3000);
    } catch (e) {
      alert('Erro ao salvar configurações.');
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.short_description && p.short_description.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCat = selectedProductCategory === 'all' || String(p.category_id) === selectedProductCategory;
    return matchesSearch && matchesCat;
  });

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4 text-white">
        <div className="w-full max-w-md bg-black border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 shadow-md mx-auto bg-black">
              <img 
                src="/logo.jpg" 
                alt="Coruja Achou" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h2 className="text-2xl font-black text-white">Acesso Administrativo</h2>
            <p className="text-xs text-zinc-400">
              Painel de Gestão da Vitrine e Achadinhos CORUJA ACHOU
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Layon"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-sm transition-all shadow-md"
            >
              {isLoggingIn ? 'Verificando...' : 'Entrar no Painel'}
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800 text-center space-y-3">
            <button
              onClick={handleQuickDemoLogin}
              type="button"
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-colors"
            >
              ⚡ Entrar com Layon / 30031936
            </button>

            <button
              onClick={onClose}
              type="button"
              className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a Vitrine</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <div className="h-16 px-6 bg-black border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar à Vitrine</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-black">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-white tracking-tight">Painel de Controle</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-bold">
              Admin Ativo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-900/30 hover:text-rose-300 text-zinc-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-zinc-950/60 border-b md:border-b-0 md:border-r border-zinc-800 p-4 space-y-1 shrink-0 flex md:flex-col overflow-x-auto">
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'products'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Gerenciar Produtos</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'banners'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Fullbanners Iniciais</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'stats'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Métricas & Cliques</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'categories'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Categorias</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'settings'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Configurações Vitrine</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {/* TAB: STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-xl font-bold text-white">Desempenho da Vitrine</h2>
                <p className="text-xs text-zinc-400">Resumo de tráfego, produtos cadastrados e cliques nos links de afiliados.</p>
              </div>

              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-medium">Total de Produtos</span>
                      <Package className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-2xl font-black text-white">{stats.total_products}</div>
                    <span className="text-[11px] text-emerald-400">{stats.active_products} ativos na vitrine</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-medium">Cliques nos Afiliados</span>
                      <MousePointerClick className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-black text-amber-400">{stats.total_clicks}</div>
                    <span className="text-[11px] text-zinc-400">Cliques rastreados</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-medium">Categorias Ativas</span>
                      <Tag className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-black text-white">{stats.total_categories}</div>
                    <span className="text-[11px] text-zinc-400">departamentos configurados</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span className="text-xs font-medium">Desconto Médio</span>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-emerald-400">-{stats.avg_discount}%</div>
                    <span className="text-[11px] text-zinc-400">economia média para o cliente</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Catálogo de Produtos</h2>
                  <p className="text-xs text-zinc-400">Adicione, edite e gerencie o status dos achadinhos exibidos na vitrine.</p>
                </div>

                <button
                  onClick={handleOpenNewProduct}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Produto</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filtrar por nome ou descrição..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500"
                />

                <select
                  value={selectedProductCategory}
                  onChange={(e) => setSelectedProductCategory(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                      <tr>
                        <th className="p-4">Produto</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4">Preço</th>
                        <th className="p-4">Score</th>
                        <th className="p-4">Cliques</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {filteredProducts.map((p) => {
                        const cat = categories.find(c => c.id === p.category_id);
                        return (
                          <tr key={p.id} className="hover:bg-zinc-850/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.image}
                                  alt=""
                                  className="w-12 h-12 rounded-xl object-cover bg-zinc-950 shrink-0"
                                />
                                <div className="space-y-0.5">
                                  <div className="font-bold text-white line-clamp-1">{p.name}</div>
                                  <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                                    {p.featured === 1 && <span className="text-purple-400 font-semibold">★ Destaque</span>}
                                    {p.trending === 1 && <span className="text-amber-400 font-semibold">🔥 Em Alta</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-zinc-300 font-medium">
                              {cat ? `${cat.icon} ${cat.name}` : 'Geral'}
                            </td>
                            <td className="p-4 font-bold text-white">
                              R$ {Number(p.price).toFixed(2)}
                              {p.discount > 0 && (
                                <span className="ml-1 text-[10px] text-emerald-400 font-bold">
                                  (-{p.discount}%)
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-black text-amber-400">
                              🦉 {p.trend_score}
                            </td>
                            <td className="p-4 text-zinc-300">
                              {p.clicks || 0}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => handleToggleProductStatus(p.id)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-colors ${
                                  p.active === 1
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                }`}
                              >
                                {p.active === 1 ? 'ATIVO' : 'PAUSADO'}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleEditProduct(p)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                                  title="Editar"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-300"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BANNERS */}
          {activeTab === 'banners' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Fullbanners da Página Inicial</h2>
                  <p className="text-xs text-zinc-400">Configure os banners rotativos em tela cheia com direcionamento direto para achadinhos específicos.</p>
                </div>

                <button
                  onClick={handleOpenNewBanner}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Banner</span>
                </button>
              </div>

              {/* Banners List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b) => {
                  const linkedProduct = products.find(p => p.id === b.product_id);
                  return (
                    <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between group">
                      <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                        <img 
                          src={b.image} 
                          alt={b.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                            Ordem: #{b.order || 1}
                          </span>
                          {b.video_url && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-600/90 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                              <Video className="w-3 h-3" /> Vídeo
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3 right-3">
                          <button
                            onClick={() => handleToggleBannerStatus(b.id)}
                            className={`p-1.5 rounded-xl backdrop-blur-md text-xs font-semibold ${
                              b.active === 1 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                                : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700'
                            }`}
                            title="Alternar Ativo/Inativo"
                          >
                            {b.active === 1 ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3">
                          {b.tag && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                              {b.tag}
                            </span>
                          )}
                          <h4 className="font-bold text-sm text-white line-clamp-1">{b.title}</h4>
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{b.subtitle || 'Sem descrição secundária'}</p>
                          
                          <div className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between text-xs">
                            <span className="text-zinc-400">Produto Vinculado:</span>
                            <span className="font-bold text-purple-300 truncate max-w-[180px]">
                              {linkedProduct ? linkedProduct.name : (b.product_id ? `ID #${b.product_id}` : 'Nenhum')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                          <span className={`text-[11px] font-semibold ${b.active === 1 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {b.active === 1 ? '● Visível no Início' : '○ Oculto'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditBanner(b)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                              title="Editar Banner"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(b.id, b.title)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-300"
                              title="Excluir Banner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {banners.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6">
                    <p className="text-xs text-zinc-400 mb-3">Nenhum fullbanner cadastrado no momento.</p>
                    <button
                      onClick={handleOpenNewBanner}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                    >
                      Criar Primeiro Banner
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Categorias da Vitrine</h2>
                  <p className="text-xs text-zinc-400">Organize os produtos em departamentos com ícones e descrições.</p>
                </div>

                <button
                  onClick={handleOpenNewCategory}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Categoria</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((c) => {
                  const pCount = products.filter(p => p.category_id === c.id).length;
                  return (
                    <div key={c.id} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                          {c.icon || '🏷️'}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-white">{c.name}</h4>
                          <p className="text-xs text-zinc-400 line-clamp-1">{c.description || 'Sem descrição'}</p>
                          <span className="inline-block text-[11px] font-semibold text-purple-400">
                            {pCount} produto(s)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditCategory(c)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/40 text-zinc-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Configurações Gerais da Vitrine</h2>
                <p className="text-xs text-zinc-400">Personalize o nome da marca, moeda, slogan e links para suas redes sociais.</p>
              </div>

              {saveSettingsSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Configurações atualizadas com sucesso!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Nome do Site</label>
                    <input
                      type="text"
                      value={settingsForm.site_name}
                      onChange={(e) => setSettingsForm({ ...settingsForm, site_name: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Símbolo da Moeda</label>
                    <input
                      type="text"
                      value={settingsForm.currency}
                      onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Slogan Principal</label>
                  <input
                    type="text"
                    value={settingsForm.slogan}
                    onChange={(e) => setSettingsForm({ ...settingsForm, slogan: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Link Instagram</label>
                    <input
                      type="text"
                      value={settingsForm.instagram}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagram: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Link TikTok</label>
                    <input
                      type="text"
                      value={settingsForm.tiktok}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tiktok: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Canal VIP WhatsApp</label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Texto do Rodapé / Isenção Legal</label>
                  <textarea
                    rows={3}
                    value={settingsForm.footer_text}
                    onChange={(e) => setSettingsForm({ ...settingsForm, footer_text: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/30"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Configurações</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* PRODUCT MODAL (Create/Edit) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ex: Mini Projetor Portátil 4K"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Categoria *</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: parseInt(e.target.value, 10) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Score da Coruja (0-100) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={productForm.trend_score}
                    onChange={(e) => setProductForm({ ...productForm, trend_score: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Preço Atual (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="99.90"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Preço Antigo / Comparativo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.old_price}
                    onChange={(e) => setProductForm({ ...productForm, old_price: e.target.value })}
                    placeholder="189.90"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Vídeo Demonstrativo (YouTube, TikTok, Vimeo ou MP4)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={productForm.video_url}
                    onChange={(e) => setProductForm({ ...productForm, video_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=... ou https://www.youtube.com/shorts/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white"
                  />
                  <Video className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  💡 Os produtos com vídeo ganham destaque visual e player integrado para aumentar as conversões.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Link de Afiliado (URL da Oferta) *</label>
                <input
                  type="url"
                  value={productForm.affiliate_url}
                  onChange={(e) => setProductForm({ ...productForm, affiliate_url: e.target.value })}
                  placeholder="https://shopee.com.br/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Imagem Principal (URL) *</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Imagens Adicionais (1 por linha)</label>
                <textarea
                  rows={2}
                  value={productForm.additional_images}
                  onChange={(e) => setProductForm({ ...productForm, additional_images: e.target.value })}
                  placeholder="https://...\nhttps://..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Descrição Curta</label>
                <input
                  type="text"
                  value={productForm.short_description}
                  onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                  placeholder="Resumo em 1 frase para o card"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Descrição Completa</label>
                <textarea
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600"
                  />
                  <span>★ Destaque na Página Inicial</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={productForm.trending}
                    onChange={(e) => setProductForm({ ...productForm, trending: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>🔥 Produto em Alta</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={productForm.active}
                    onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <span>Ativo na Vitrine</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Ex: Eletrônicos"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Ícone / Emoji</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  placeholder="⚡"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BANNER MODAL (Create/Edit) */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingBanner ? 'Editar Fullbanner' : 'Cadastrar Novo Fullbanner'}
                </h3>
                <p className="text-xs text-zinc-400">
                  Destaque rotativo da tela inicial conectado a um achadinho específico.
                </p>
              </div>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Título do Banner *</label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="Ex: Mini Projetor Smart Cinema 4K"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Subtítulo / Descrição Rápida</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="Ex: Transforme sua sala em uma sessão de cinema com 44% de desconto."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Tag / Selo do Banner</label>
                  <input
                    type="text"
                    value={bannerForm.tag}
                    onChange={(e) => setBannerForm({ ...bannerForm, tag: e.target.value })}
                    placeholder="Ex: 🔥 ACHADINHO VIRAL"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={bannerForm.order}
                    onChange={(e) => setBannerForm({ ...bannerForm, order: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Vincular a um Produto Específico</label>
                <select
                  value={bannerForm.product_id}
                  onChange={(e) => setBannerForm({ ...bannerForm, product_id: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Nenhum produto específico (apenas link externo)</option>
                  {products.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      #{p.id} - {p.name} ({settings.currency} {p.price.toFixed(2)})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Ao clicar no banner, a janela com detalhes, vídeo e link de afiliado do produto será aberta automaticamente.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Imagem do Banner (Desktop) *</label>
                <input
                  type="url"
                  value={bannerForm.image}
                  onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/... (resolução recomendada: 1600x600)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Vídeo de Fundo ou Demonstração (Opcional - YouTube/MP4)
                </label>
                <input
                  type="url"
                  value={bannerForm.video_url}
                  onChange={(e) => setBannerForm({ ...bannerForm, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Texto do Botão CTA</label>
                  <input
                    type="text"
                    value={bannerForm.cta_text}
                    onChange={(e) => setBannerForm({ ...bannerForm, cta_text: e.target.value })}
                    placeholder="VER OFERTA"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Link Alternativo (Opcional)</label>
                  <input
                    type="url"
                    value={bannerForm.cta_url}
                    onChange={(e) => setBannerForm({ ...bannerForm, cta_url: e.target.value })}
                    placeholder="https://shopee.com.br/..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={bannerForm.active}
                    onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500"
                  />
                  <span>Banner Ativo na Página Inicial</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30"
                >
                  Salvar Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
