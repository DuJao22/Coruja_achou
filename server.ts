import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Default initial data
const DEFAULT_DATA = {
  categories: [
    { id: 1, name: "🔥 Em Alta", slug: "em-alta", description: "Os produtos que estão viralizando agora nas redes sociais e marketplaces", icon: "🔥", image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80", active: 1 },
    { id: 2, name: "🏠 Casa", slug: "casa", description: "Achados inteligentes de organização, decoração e bem-estar para seu lar", icon: "🏠", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80", active: 1 },
    { id: 3, name: "📱 Tecnologia", slug: "tecnologia", description: "Gadgets inovadores, acessórios para smartphone e eletrônicos imperdíveis", icon: "📱", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80", active: 1 },
    { id: 4, name: "💪 Fitness", slug: "fitness", description: "Equipamentos, garrafas térmicas e acessórios para sua rotina de treinos", icon: "💪", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80", active: 1 },
    { id: 5, name: "💄 Beleza", slug: "beleza", description: "Cuidados com a pele, maquiagem e itens virais de autocuidado", icon: "💄", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80", active: 1 },
    { id: 6, name: "👗 Moda", slug: "moda", description: "Roupas, acessórios funcionais e tendências de estilo com ótimo custo-benefício", icon: "👗", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80", active: 1 },
    { id: 7, name: "🐶 Pets", slug: "pets", description: "Brinquedos, comedouros e novidades para o conforto do seu pet", icon: "🐶", image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80", active: 1 },
    { id: 8, name: "🍳 Cozinha", slug: "cozinha", description: "Utensílios práticos, organizadores e facilitadores culinários", icon: "🍳", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80", active: 1 },
    { id: 9, name: "🎮 Games", slug: "games", description: "Acessórios gamer, iluminação e setups que elevam sua jogabilidade", icon: "🎮", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80", active: 1 },
    { id: 10, name: "🚗 Automotivo", slug: "automotivo", description: "Suportes inteligentes, organizadores e acessórios essenciais para seu carro", icon: "🚗", image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80", active: 1 }
  ],
  products: [
    {
      id: 1,
      name: "Mini Projetor Portátil 4K Smart Cinema",
      slug: "mini-projetor-portatil-4k-smart-cinema",
      short_description: "Transforme qualquer parede em uma tela de cinema de até 130 polegadas com Wi-Fi e Bluetooth.",
      description: "O Mini Projetor Portátil 4K Smart Cinema é um dos achadinhos mais desejados do momento. Com rotação de 180°, ele permite projetar em paredes ou até no teto do quarto.\n\nEquipado com sistema operacional integrado, suporta espelhamento rápido via celular Android e iOS, além de conexões HDMI e USB. Possui correção trapezoidal automática e alto-falante integrado.",
      category_id: 3,
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
      additional_images: [
        "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80"
      ],
      price: 279.90,
      old_price: 499.00,
      discount: 44,
      rating: 4.9,
      sales_count: 3420,
      trend_score: 98,
      affiliate_url: "https://shopee.com.br",
      featured: 1,
      trending: 1,
      active: 1,
      clicks: 142
    },
    {
      id: 2,
      name: "Fone de Ouvido Bluetooth TWS com Display LED",
      slug: "fone-bluetooth-tws-display-led",
      short_description: "Cancelamento de ruído passivo, graves potentes e estojo com visor de bateria digital.",
      description: "Fone intra-auricular com tecnologia Bluetooth 5.3, latência ultra-baixa ideal para jogos e vídeos, e case carregador com visor digital que indica a porcentagem exata de bateria de cada lado.\n\nAutonomia de até 6 horas contínuas de reprodução e mais 24 horas no case. Resistente a suor e respingos.",
      category_id: 3,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
      additional_images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80"
      ],
      price: 68.50,
      old_price: 129.90,
      discount: 47,
      rating: 4.8,
      sales_count: 8950,
      trend_score: 95,
      affiliate_url: "https://shopee.com.br",
      featured: 1,
      trending: 1,
      active: 1,
      clicks: 310
    },
    {
      id: 3,
      name: "Garrafa Térmica Fitness Inteligente com Sensor de Temperatura",
      slug: "garrafa-termica-fitness-inteligente-sensor",
      short_description: "Mantém sua bebida gelada por 24 horas ou quente por 12 horas com visor digital na tampa.",
      description: "Feita em aço inoxidável 304 de parede dupla com isolamento a vácuo premium. Basta tocar suavemente no topo da tampa para verificar a temperatura do líquido instantaneamente.\n\nCapacidade de 500ml, design minimalista à prova de vazamentos, livre de BPA.",
      category_id: 4,
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
      additional_images: [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80"
      ],
      price: 49.90,
      old_price: 89.00,
      discount: 44,
      rating: 4.7,
      sales_count: 2150,
      trend_score: 91,
      affiliate_url: "https://mercadolivre.com.br",
      featured: 1,
      trending: 0,
      active: 1,
      clicks: 89
    },
    {
      id: 4,
      name: "Luminária LED Sunset RGB com Controle e App",
      slug: "luminaria-led-sunset-rgb-controle-app",
      short_description: "Efeito pôr do sol ultra realista para fotos estéticas, vídeos e iluminação aconchegante.",
      description: "A luminária queridinha dos criadores de conteúdo do Instagram e TikTok. Projetor com lente de cristal óptico que simula o calor do entardecer com 16 variações de cores e múltiplos modos de iluminação.\n\nCabeça com giro 360° articulado em liga de alumínio reforçado.",
      category_id: 2,
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
      additional_images: [],
      price: 54.90,
      old_price: 99.90,
      discount: 45,
      rating: 4.9,
      sales_count: 5600,
      trend_score: 96,
      affiliate_url: "https://amazon.com.br",
      featured: 1,
      trending: 1,
      active: 1,
      clicks: 220
    },
    {
      id: 5,
      name: "Organizador Giratório 360° Multiuso para Cozinha",
      slug: "organizador-giratorio-360-cozinha",
      short_description: "Acesso rápido a temperos, molhos e potes sem bagunça nos armários ou na bancada.",
      description: "Prato giratório com rolamentos de esferas em aço inoxidável que garantem rotação ultra suave. Base antiderrapante e bordas elevadas que impedem a queda de frascos ao girar.\n\nFabricado em acrílico resistente livre de BPA, lavável e transparente.",
      category_id: 8,
      image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
      additional_images: [],
      price: 39.90,
      old_price: 65.00,
      discount: 39,
      rating: 4.6,
      sales_count: 1840,
      trend_score: 87,
      affiliate_url: "https://shopee.com.br",
      featured: 0,
      trending: 0,
      active: 1,
      clicks: 65
    },
    {
      id: 6,
      name: "Pistola Massageadora Muscular Fascial Profissional",
      slug: "pistola-massageadora-muscular-fascial-profissional",
      short_description: "Alívio imediato de dores, nódulos musculares e tensão pós-treino com 6 níveis de velocidade.",
      description: "Equipamento indispensável para fisioterapia e atletas. Com motor silencioso de alto torque, atinge tecidos profundos liberando a fáscia muscular e acelerando a recuperação física.\n\nAcompanha 4 ponteiras anatômicas intercambiáveis e bateria recarregável de lítio.",
      category_id: 4,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
      additional_images: [],
      price: 89.90,
      old_price: 189.90,
      discount: 53,
      rating: 4.8,
      sales_count: 4120,
      trend_score: 93,
      affiliate_url: "https://mercadolivre.com.br",
      featured: 0,
      trending: 1,
      active: 1,
      clicks: 198
    },
    {
      id: 7,
      name: "Organizador de Cabos Magnético de Mesa",
      slug: "organizador-de-cabos-magnetico-mesa",
      short_description: "Diga adeus a fios caídos e embolados no chão com fixação magnética estilosa.",
      description: "Base elegante com fita adesiva que não danifica a mesa e clips magnéticos compatíveis com cabos USB-C, Lightning e Micro-USB. Mantém sua estação de trabalho limpa e moderna.",
      category_id: 3,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      additional_images: [],
      price: 24.90,
      old_price: 49.90,
      discount: 50,
      rating: 4.7,
      sales_count: 6700,
      trend_score: 89,
      affiliate_url: "https://shopee.com.br",
      featured: 0,
      trending: 0,
      active: 1,
      clicks: 112
    },
    {
      id: 8,
      name: "Suporte Articulado para Celular e Tablet 360°",
      slug: "suporte-articulado-celular-tablet-360",
      short_description: "Braço flexível reforçado para prender na cabeceira da cama, mesa ou bancada da cozinha.",
      description: "Assista a vídeos, filmes ou faça chamadas de vídeo sem cansar os braços. Grampo firme com proteção de silicone e mola helicoidal de alta resistência.",
      category_id: 3,
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80",
      additional_images: [],
      price: 38.00,
      old_price: 69.90,
      discount: 46,
      rating: 4.6,
      sales_count: 3100,
      trend_score: 85,
      affiliate_url: "https://mercadolivre.com.br",
      featured: 0,
      trending: 0,
      active: 1,
      clicks: 74
    },
    {
      id: 9,
      name: "Comedouro Lento Interativo para Pets Anti-Engasgo",
      slug: "comedouro-lento-interativo-pets",
      short_description: "Evita vômitos, engasgos e obesidade fazendo seu cão comer até 10x mais devagar e de forma lúdica.",
      description: "Labirinto alimentar com design veterinário que estimula o raciocínio e transforma a hora da refeição em uma brincadeira saudável. Material atóxico e fácil de higienizar.",
      category_id: 7,
      image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80",
      additional_images: [],
      price: 32.50,
      old_price: 55.00,
      discount: 41,
      rating: 4.9,
      sales_count: 1490,
      trend_score: 92,
      affiliate_url: "https://shopee.com.br",
      featured: 0,
      trending: 0,
      active: 1,
      clicks: 53
    },
    {
      id: 10,
      name: "Suporte Veicular Magnético com Carregador por Indução 15W",
      slug: "suporte-veicular-magnetico-por-inducao-15w",
      short_description: "Compatível com MagSafe e encaixe automático na grade de ar do automóvel com fixação extrema.",
      description: "Basta aproximar o telefone para fixação magnética firme mesmo em ruas esburacadas. Carregamento por indução rápido de 15W com dissipação térmica avançada.",
      category_id: 10,
      image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80",
      additional_images: [],
      price: 84.90,
      old_price: 149.00,
      discount: 43,
      rating: 4.8,
      sales_count: 2780,
      trend_score: 94,
      affiliate_url: "https://amazon.com.br",
      featured: 1,
      trending: 1,
      active: 1,
      clicks: 165
    },
    {
      id: 11,
      name: "Barra de Luz LED para Monitor com Sensor de Toque",
      slug: "barra-de-luz-led-monitor-sensor-toque",
      short_description: "Iluminação assimétrica que não reflete na tela do computador e reduz o cansaço visual.",
      description: "Perfeita para home office, programadores e designers. Controle de temperatura da cor (branco frio, neutro e quente) e intensidade através de toque capacitivo no topo da barra. Fixação sem parafusos.",
      category_id: 3,
      image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80",
      additional_images: [],
      price: 119.90,
      old_price: 219.00,
      discount: 45,
      rating: 4.9,
      sales_count: 1980,
      trend_score: 97,
      affiliate_url: "https://shopee.com.br",
      featured: 1,
      trending: 1,
      active: 1,
      clicks: 210
    },
    {
      id: 12,
      name: "Escova Secadora e Modeladora Cerâmica Ionizada 4 em 1",
      slug: "escova-secadora-modeladora-ceramica-4em1",
      short_description: "Seca, alisa, modela e dá volume com revestimento cerâmico e gerador de íons anti-frizz.",
      description: "Cerdas mistas macias e flexíveis com pontas arredondadas que deslizam suavemente sem quebrar os fios. 3 ajustes de temperatura e potência de 1200W para resultados de salão no conforto de casa.",
      category_id: 5,
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
      additional_images: [],
      price: 79.90,
      old_price: 160.00,
      discount: 50,
      rating: 4.8,
      sales_count: 7300,
      trend_score: 93,
      affiliate_url: "https://shopee.com.br",
      featured: 0,
      trending: 1,
      active: 1,
      clicks: 180
    }
  ],
  banners: [
    {
      id: 1,
      title: "Transforme sua Sala em Cinema 4K",
      subtitle: "Mini Projetor Smart 180° com Wi-Fi 6, espelhamento rápido e som integrado para noites inesquecíveis.",
      tag: "🔥 ACHADINHO VIRAL DO MÊS",
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=85",
      product_id: 1,
      cta_text: "GARANTIR COM 44% OFF",
      cta_url: "https://shopee.com.br",
      active: 1,
      order: 1
    },
    {
      id: 2,
      title: "Fones TWS Bluetooth 5.3 com Display LED",
      subtitle: "Cancelamento de ruído passivo, graves profundos e estojo com visor da bateria em tempo real.",
      tag: "🎧 CAMPEÃO DE VENDAS",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1600&auto=format&fit=crop&q=85",
      product_id: 2,
      cta_text: "APROVEITAR OFERTA POR R$ 68,50",
      cta_url: "https://shopee.com.br",
      active: 1,
      order: 2
    },
    {
      id: 3,
      title: "Hidratação Inteligente com Sensor Digital",
      subtitle: "Garrafa térmica com termômetro touch em tempo real que mantém sua água gelada por até 24 horas.",
      tag: "💪 FITNESS & ROTINA",
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1600&auto=format&fit=crop&q=85",
      product_id: 3,
      cta_text: "CONFERIR AGORA",
      cta_url: "https://mercadolivre.com.br",
      active: 1,
      order: 3
    }
  ],
  settings: {
    site_name: "CORUJA ACHOU",
    slogan: "A coruja encontrou. Agora é sua vez.",
    description: "Uma plataforma que reúne produtos interessantes, achados, ofertas e produtos em alta garimpados especialmente para você.",
    currency: "R$",
    logo: "/logo.jpg",
    instagram: "https://instagram.com/corujaachou",
    tiktok: "https://tiktok.com/@corujaachou",
    whatsapp: "https://wa.me/5511999999999",
    footer_text: "© 2026 CORUJA ACHOU. Todos os direitos reservados. Vitrine editorial independente com curadoria manual de achadinhos. Os links compartilhados podem gerar comissão de afiliado sem qualquer custo adicional para você."
  },
  admin: {
    username: "Layon",
    password: "30031936"
  }
};

function getStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      const data = { ...DEFAULT_DATA, ...parsed };
      if (!Array.isArray(data.banners) || data.banners.length === 0) {
        data.banners = DEFAULT_DATA.banners;
      }
      return data;
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
    return DEFAULT_DATA;
  } catch (err) {
    console.error("Error reading store:", err);
    return DEFAULT_DATA;
  }
}

function saveStore(data: typeof DEFAULT_DATA) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error saving store:", err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static assets from public and static folders
  app.use('/static', express.static(path.join(__dirname, 'static')));
  app.use('/public', express.static(path.join(__dirname, 'public')));

  // --- API Routes ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    const store = getStore();
    res.json(store.settings);
  });

  app.post('/api/settings', (req, res) => {
    const store = getStore();
    store.settings = { ...store.settings, ...req.body };
    saveStore(store);
    res.json({ success: true, settings: store.settings });
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    const store = getStore();
    const categories = store.categories.map(c => {
      const count = store.products.filter(p => p.category_id === c.id && p.active === 1).length;
      return { ...c, product_count: count };
    });
    res.json(categories);
  });

  app.post('/api/categories', (req, res) => {
    const store = getStore();
    const { name, slug, description, icon, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório' });

    const newId = store.categories.length > 0 ? Math.max(...store.categories.map(c => c.id)) + 1 : 1;
    const cleanSlug = slug || name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const newCat = {
      id: newId,
      name,
      slug: cleanSlug,
      description: description || '',
      icon: icon || '📦',
      image: image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80',
      active: 1
    };
    store.categories.push(newCat);
    saveStore(store);
    res.json({ success: true, category: newCat });
  });

  app.put('/api/categories/:id', (req, res) => {
    const store = getStore();
    const id = parseInt(req.params.id, 10);
    const index = store.categories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Categoria não encontrada' });

    store.categories[index] = { ...store.categories[index], ...req.body, id };
    saveStore(store);
    res.json({ success: true, category: store.categories[index] });
  });

  app.delete('/api/categories/:id', (req, res) => {
    const store = getStore();
    const id = parseInt(req.params.id, 10);
    const hasProducts = store.products.some(p => p.category_id === id);
    if (hasProducts) {
      return res.status(400).json({ error: 'Não é possível excluir uma categoria que possui produtos vinculados.' });
    }
    store.categories = store.categories.filter(c => c.id !== id);
    saveStore(store);
    res.json({ success: true });
  });

  // Products
  app.get('/api/products', (req, res) => {
    const store = getStore();
    const { category, search, sort, all, featured, trending } = req.query;

    let list = [...store.products];

    // Filter active unless admin specifically requests all
    if (all !== 'true') {
      list = list.filter(p => p.active === 1);
    }

    if (category) {
      const cat = store.categories.find(c => c.slug === category || String(c.id) === category);
      if (cat) {
        list = list.filter(p => p.category_id === cat.id);
      }
    }

    if (featured === 'true' || featured === '1') {
      list = list.filter(p => p.featured === 1);
    }

    if (trending === 'true' || trending === '1') {
      list = list.filter(p => p.trending === 1);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.short_description && p.short_description.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Attach category details
    const catMap = new Map(store.categories.map(c => [c.id, c]));
    const enriched = list.map(p => {
      const c = catMap.get(p.category_id);
      return {
        ...p,
        category_name: c ? c.name : 'Geral',
        category_slug: c ? c.slug : 'geral'
      };
    });

    // Sorting
    if (sort === 'score') {
      enriched.sort((a, b) => (b.trend_score || 0) - (a.trend_score || 0));
    } else if (sort === 'price_asc') {
      enriched.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      enriched.sort((a, b) => b.price - a.price);
    } else if (sort === 'discount') {
      enriched.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else if (sort === 'sales') {
      enriched.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
    } else {
      // Default: newest or highest trend_score
      enriched.sort((a, b) => b.id - a.id);
    }

    res.json(enriched);
  });

  app.get('/api/products/:idOrSlug', (req, res) => {
    const store = getStore();
    const param = req.params.idOrSlug;
    const product = store.products.find(p => String(p.id) === param || p.slug === param);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    const cat = store.categories.find(c => c.id === product.category_id);
    const related = store.products
      .filter(p => p.id !== product.id && p.active === 1 && p.category_id === product.category_id)
      .slice(0, 4);

    res.json({
      ...product,
      category_name: cat ? cat.name : 'Geral',
      category_slug: cat ? cat.slug : 'geral',
      related
    });
  });

  app.post('/api/products', (req, res) => {
    const store = getStore();
    const {
      name,
      description,
      short_description,
      category_id,
      image,
      additional_images,
      price,
      old_price,
      rating,
      sales_count,
      trend_score,
      affiliate_url,
      video_url,
      featured,
      trending,
      active
    } = req.body;

    if (!name || !price || !category_id || !image) {
      return res.status(400).json({ error: 'Nome, categoria, preço e imagem são obrigatórios' });
    }

    const newId = store.products.length > 0 ? Math.max(...store.products.map(p => p.id)) + 1 : 1;
    const baseSlug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (store.products.some(p => p.slug === slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const numPrice = parseFloat(price);
    const numOldPrice = old_price ? parseFloat(old_price) : undefined;
    const calculatedDiscount = (numOldPrice && numOldPrice > numPrice) 
      ? Math.round(((numOldPrice - numPrice) / numOldPrice) * 100) 
      : 0;

    const newProduct = {
      id: newId,
      name,
      slug,
      description: description || name,
      short_description: short_description || (description ? description.slice(0, 120) + '...' : name),
      category_id: parseInt(category_id, 10),
      image,
      additional_images: Array.isArray(additional_images) ? additional_images : [],
      video_url: video_url || '',
      price: numPrice,
      old_price: numOldPrice,
      discount: calculatedDiscount,
      rating: rating ? parseFloat(rating) : 5.0,
      sales_count: sales_count ? parseInt(sales_count, 10) : 0,
      trend_score: trend_score ? parseInt(trend_score, 10) : 90,
      affiliate_url: affiliate_url || '#',
      featured: featured ? 1 : 0,
      trending: trending ? 1 : 0,
      active: active !== undefined ? (active ? 1 : 0) : 1,
      clicks: 0,
      created_at: new Date().toISOString()
    };

    store.products.unshift(newProduct);
    saveStore(store);
    res.json({ success: true, product: newProduct });
  });

  app.put('/api/products/:id', (req, res) => {
    const store = getStore();
    const id = parseInt(req.params.id, 10);
    const index = store.products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Produto não encontrado' });

    const existing = store.products[index];
    const updateData = { ...req.body };

    if (updateData.price !== undefined) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.old_price !== undefined) {
      updateData.old_price = updateData.old_price ? parseFloat(updateData.old_price) : undefined;
    }
    if (updateData.price && updateData.old_price && updateData.old_price > updateData.price) {
      updateData.discount = Math.round(((updateData.old_price - updateData.price) / updateData.old_price) * 100);
    } else if (updateData.discount === undefined && !updateData.old_price) {
      updateData.discount = 0;
    }

    store.products[index] = {
      ...existing,
      ...updateData,
      id,
      updated_at: new Date().toISOString()
    };

    saveStore(store);
    res.json({ success: true, product: store.products[index] });
  });

  app.post('/api/products/:id/toggle-status', (req, res) => {
    const store = getStore();
    const id = parseInt(req.params.id, 10);
    const product = store.products.find(p => p.id === id);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

    product.active = product.active === 1 ? 0 : 1;
    saveStore(store);
    res.json({ success: true, active: product.active });
  });

  app.delete('/api/products/:id', (req, res) => {
    const store = getStore();
    const id = parseInt(req.params.id, 10);
    store.products = store.products.filter(p => p.id !== id);
    saveStore(store);
    res.json({ success: true });
  });

  // Track product click
  app.post('/api/track-click/:id', (req, res) => {
    const store = getStore();
    const id = parseInt(req.params.id, 10);
    const product = store.products.find(p => p.id === id);
    if (product) {
      product.clicks = (product.clicks || 0) + 1;
      saveStore(store);
    }
    res.json({ success: true });
  });

  // --- Banners API ---
  app.get('/api/banners', (req, res) => {
    const store = getStore();
    const all = req.query.all === 'true';
    let banners = store.banners || [];
    if (!all) {
      banners = banners.filter(b => b.active === 1);
    }
    banners.sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json(banners);
  });

  app.post('/api/banners', (req, res) => {
    const store = getStore();
    const {
      title,
      subtitle,
      tag,
      image,
      mobile_image,
      video_url,
      product_id,
      cta_text,
      cta_url,
      active,
      order
    } = req.body;

    if (!title || !image) {
      return res.status(400).json({ error: 'Título e imagem do banner são obrigatórios' });
    }

    if (!store.banners) {
      store.banners = [];
    }

    const newId = store.banners.length > 0 ? Math.max(...store.banners.map(b => b.id)) + 1 : 1;
    const newBanner = {
      id: newId,
      title,
      subtitle: subtitle || '',
      tag: tag || '',
      image,
      mobile_image: mobile_image || '',
      video_url: video_url || '',
      product_id: product_id ? parseInt(product_id, 10) : undefined,
      cta_text: cta_text || 'VER OFERTA',
      cta_url: cta_url || '',
      active: active !== undefined ? (active ? 1 : 0) : 1,
      order: order ? parseInt(order, 10) : store.banners.length + 1
    };

    store.banners.push(newBanner);
    saveStore(store);
    res.json({ success: true, banner: newBanner });
  });

  app.put('/api/banners/:id', (req, res) => {
    const store = getStore();
    const id = parseInt(req.params.id, 10);
    if (!store.banners) store.banners = [];
    const index = store.banners.findIndex(b => b.id === id);
    if (index === -1) return res.status(404).json({ error: 'Banner não encontrado' });

    const existing = store.banners[index];
    const updateData = { ...req.body };
    if (updateData.product_id !== undefined) {
      updateData.product_id = updateData.product_id ? parseInt(updateData.product_id, 10) : undefined;
    }
    if (updateData.order !== undefined) {
      updateData.order = parseInt(updateData.order, 10);
    }
    if (updateData.active !== undefined) {
      updateData.active = updateData.active ? 1 : 0;
    }

    store.banners[index] = {
      ...existing,
      ...updateData,
      id
    };

    saveStore(store);
    res.json({ success: true, banner: store.banners[index] });
  });

  app.post('/api/banners/:id/toggle-status', (req, res) => {
    const store = getStore();
    const id = parseInt(req.params.id, 10);
    if (!store.banners) store.banners = [];
    const banner = store.banners.find(b => b.id === id);
    if (!banner) return res.status(404).json({ error: 'Banner não encontrado' });

    banner.active = banner.active === 1 ? 0 : 1;
    saveStore(store);
    res.json({ success: true, active: banner.active });
  });

  app.delete('/api/banners/:id', (req, res) => {
    const store = getStore();
    const id = parseInt(req.params.id, 10);
    if (!store.banners) store.banners = [];
    store.banners = store.banners.filter(b => b.id !== id);
    saveStore(store);
    res.json({ success: true });
  });

  // Dashboard stats
  app.get('/api/stats', (req, res) => {
    const store = getStore();
    const activeProducts = store.products.filter(p => p.active === 1);
    const totalClicks = store.products.reduce((acc, p) => acc + (p.clicks || 0), 0);
    const avgDiscount = activeProducts.length > 0 
      ? Math.round(activeProducts.reduce((acc, p) => acc + (p.discount || 0), 0) / activeProducts.length) 
      : 0;

    res.json({
      total_products: store.products.length,
      active_products: activeProducts.length,
      featured_products: store.products.filter(p => p.featured === 1).length,
      trending_products: store.products.filter(p => p.trending === 1).length,
      total_categories: store.categories.length,
      total_banners: (store.banners || []).length,
      total_clicks: totalClicks,
      avg_discount: avgDiscount
    });
  });

  // Admin login
  app.post('/api/auth/login', (req, res) => {
    const store = getStore();
    const { username, password } = req.body;
    const adminUser = store.admin || { username: 'Layon', password: '30031936' };

    const isMatchUser = (username || '').trim().toLowerCase() === (adminUser.username || 'Layon').trim().toLowerCase();
    const isMatchPass = String(password || '') === String(adminUser.password || '30031936');

    if (isMatchUser && isMatchPass) {
      res.json({ success: true, token: 'coruja-admin-session-token', username: adminUser.username });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas. Verifique usuário e senha.' });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    console.log("Iniciando Vite em modo desenvolvimento...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Iniciando modo produção com arquivos estáticos...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🦉 CORUJA ACHOU rodando com sucesso na porta ${PORT}`);
  });
}

startServer();
