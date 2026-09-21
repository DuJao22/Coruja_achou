"""
Database configuration, connection management, and initial schema seeding
for CORUJA ACHOU.
"""
import os
import sqlite3
import json
from datetime import datetime
from werkzeug.security import generate_password_hash

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "coruja.db")

def get_db_connection():
    """Creates a database connection with dict-like row access."""
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    """Initializes tables and seeds initial data if empty."""
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Categories table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            icon TEXT,
            image TEXT,
            active INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 2. Products table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            short_description TEXT,
            category_id INTEGER NOT NULL,
            image TEXT NOT NULL,
            additional_images TEXT DEFAULT '[]',
            price REAL NOT NULL,
            old_price REAL,
            discount INTEGER DEFAULT 0,
            rating REAL DEFAULT 5.0,
            sales_count INTEGER DEFAULT 0,
            trend_score INTEGER DEFAULT 85,
            affiliate_url TEXT NOT NULL,
            featured INTEGER DEFAULT 0,
            trending INTEGER DEFAULT 0,
            active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT
        )
    """)

    # 3. Users table (Admin auth)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # 4. Settings table (Brand and social links)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)

    conn.commit()

    # Seed Admin User if not exists
    cursor.execute("SELECT COUNT(*) AS count FROM users")
    if cursor.fetchone()["count"] == 0:
        admin_user = os.environ.get("ADMIN_USERNAME", "admin")
        admin_pass = os.environ.get("ADMIN_PASSWORD", "coruja123")
        admin_email = os.environ.get("ADMIN_EMAIL", "admin@corujaachou.com.br")
        cursor.execute(
            "INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)",
            (admin_user, generate_password_hash(admin_pass), admin_email)
        )
        conn.commit()

    # Seed Settings if not exists
    cursor.execute("SELECT COUNT(*) AS count FROM settings")
    if cursor.fetchone()["count"] == 0:
        default_settings = {
            "site_name": "CORUJA ACHOU",
            "slogan": "A coruja encontrou. Agora é sua vez.",
            "description": "Uma plataforma que reúne produtos interessantes, achados, ofertas e produtos em alta garimpados especialmente para você.",
            "logo": "/static/images/coruja-logo.svg",
            "instagram": "https://instagram.com/corujaachou",
            "tiktok": "https://tiktok.com/@corujaachou",
            "whatsapp": "https://wa.me/5511999999999",
            "footer_text": "© 2026 CORUJA ACHOU. Todos os direitos reservados. Vitrine editorial independente com curadoria manual de achadinhos. Os links compartilhados podem gerar comissão de afiliado sem qualquer custo adicional para você."
        }
        for k, v in default_settings.items():
            cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, v))
        conn.commit()

    # Seed Categories if not exists
    cursor.execute("SELECT COUNT(*) AS count FROM categories")
    if cursor.fetchone()["count"] == 0:
        seed_categories = [
            ("🔥 Em Alta", "em-alta", "Os produtos que estão viralizando agora nas redes sociais e marketplaces", "🔥", "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80"),
            ("🏠 Casa", "casa", "Achados inteligentes de organização, decoração e bem-estar para seu lar", "🏠", "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80"),
            ("📱 Tecnologia", "tecnologia", "Gadgets inovadores, acessórios para smartphone e eletrônicos imperdíveis", "📱", "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80"),
            ("💪 Fitness", "fitness", "Equipamentos, garrafas térmicas e acessórios para sua rotina de treinos", "💪", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"),
            ("💄 Beleza", "beleza", "Cuidados com a pele, maquiagem e itens virais de autocuidado", "💄", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80"),
            ("👗 Moda", "moda", "Roupas, acessórios funcionais e tendências de estilo com ótimo custo-benefício", "👗", "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80"),
            ("🐶 Pets", "pets", "Brinquedos, comedouros e novidades para o conforto do seu pet", "🐶", "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80"),
            ("🍳 Cozinha", "cozinha", "Utensílios práticos, organizadores e facilitadores culinários", "🍳", "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80"),
            ("🎮 Games", "games", "Acessórios gamer, iluminação e setups que elevam sua jogabilidade", "🎮", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80"),
            ("🚗 Automotivo", "automotivo", "Suportes inteligentes, organizadores e acessórios essenciais para seu carro", "🚗", "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80"),
        ]
        for name, slug, desc, icon, img in seed_categories:
            cursor.execute(
                "INSERT INTO categories (name, slug, description, icon, image, active) VALUES (?, ?, ?, ?, ?, 1)",
                (name, slug, desc, icon, img)
            )
        conn.commit()

    # Seed Products if not exists
    cursor.execute("SELECT COUNT(*) AS count FROM products")
    if cursor.fetchone()["count"] == 0:
        # Fetch category IDs map
        cursor.execute("SELECT id, slug FROM categories")
        cat_map = {row["slug"]: row["id"] for row in cursor.fetchall()}

        demo_products = [
            {
                "name": "Mini Projetor Portátil 4K Smart Cinema",
                "slug": "mini-projetor-portatil-4k-smart-cinema",
                "short_description": "Transforme qualquer parede em uma tela de cinema de até 130 polegadas com conexão Wi-Fi e Bluetooth.",
                "description": """O Mini Projetor Portátil 4K Smart Cinema é um dos achadinhos mais desejados do momento. Com rotação de 180°, ele permite projetar em paredes ou até no teto do quarto. 

Equipado com sistema operacional integrado, suporta espelhamento rápido via celular Android e iOS, além de conexões HDMI e USB. Possui correção trapezoidal automática e alto-falante integrado com excelente acústica para noites de filmes, séries e partidas de videogame com os amigos.""",
                "category_slug": "tecnologia",
                "image": "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([
                    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&auto=format&fit=crop&q=80"
                ]),
                "price": 279.90,
                "old_price": 499.00,
                "discount": 44,
                "rating": 4.9,
                "sales_count": 3420,
                "trend_score": 98,
                "affiliate_url": "https://exemplo.com/afiliado/demo-mini-projetor-4k",
                "featured": 1,
                "trending": 1
            },
            {
                "name": "Fone de Ouvido Bluetooth TWS com Display LED",
                "slug": "fone-bluetooth-tws-display-led",
                "short_description": "Cancelamento de ruído passivo, graves potentes e estojo com mostrador de bateria digital.",
                "description": """Fone intra-auricular com tecnologia Bluetooth 5.3, latência ultra-baixa ideal para jogos e vídeos, e case carregador com visor digital que indica a porcentagem exata de bateria de cada lado.

Autonomia de até 6 horas contínuas de reprodução e mais 24 horas no case. Resistente a suor e respingos (certificação IPX5), perfeito para treinos intensos e uso diário no transporte.""",
                "category_slug": "tecnologia",
                "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([
                    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80"
                ]),
                "price": 68.50,
                "old_price": 129.90,
                "discount": 47,
                "rating": 4.8,
                "sales_count": 8950,
                "trend_score": 95,
                "affiliate_url": "https://exemplo.com/afiliado/demo-fone-bluetooth-tws",
                "featured": 1,
                "trending": 1
            },
            {
                "name": "Garrafa Térmica Fitness Inteligente com Sensor de Temperatura",
                "slug": "garrafa-termica-fitness-inteligente-sensor",
                "short_description": "Mantém sua bebida gelada por 24 horas ou quente por 12 horas com visor digital na tampa.",
                "description": """Feita em aço inoxidável 304 de parede dupla com isolamento a vácuo premium. Basta tocar suavemente no topo da tampa para verificar a temperatura do líquido instantaneamente.

Capacidade de 500ml, design minimalista à prova de vazamentos, livre de BPA e com pintura eletrostática fosca de alta durabilidade.""",
                "category_slug": "fitness",
                "image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([
                    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80"
                ]),
                "price": 49.90,
                "old_price": 89.00,
                "discount": 44,
                "rating": 4.7,
                "sales_count": 2150,
                "trend_score": 91,
                "affiliate_url": "https://exemplo.com/afiliado/demo-garrafa-termica-fitness",
                "featured": 1,
                "trending": 0
            },
            {
                "name": "Luminária LED Sunset RGB com Controle e App",
                "slug": "luminaria-led-sunset-rgb-controle-app",
                "short_description": "Efeito pôr do sol ultra realista para fotos estéticas, vídeos e iluminação aconchegante.",
                "description": """A luminária queridinha dos criadores de conteúdo do Instagram e TikTok. Projetor com lente de cristal óptico que simula o calor do entardecer com 16 variações de cores e múltiplos modos de iluminação.

Cabeça com giro 360° articulado em liga de alumínio reforçado, alimentada via cabo USB padrão.""",
                "category_slug": "casa",
                "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([]),
                "price": 54.90,
                "old_price": 99.90,
                "discount": 45,
                "rating": 4.9,
                "sales_count": 5600,
                "trend_score": 96,
                "affiliate_url": "https://exemplo.com/afiliado/demo-luminaria-sunset-rgb",
                "featured": 1,
                "trending": 1
            },
            {
                "name": "Organizador Giratório 360° Multiuso para Cozinha",
                "slug": "organizador-giratorio-360-cozinha",
                "short_description": "Acesso rápido a temperos, molhos e potes sem bagunça nos armários ou na bancada.",
                "description": """Prato giratório com rolamentos de esferas em aço inoxidável que garantem rotação ultra suave. Base antiderrapante e bordas elevadas que impedem a queda de frascos ao girar.

Fabricado em acrílico resistente livre de BPA, lavável e transparente para máxima visibilidade.""",
                "category_slug": "cozinha",
                "image": "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([]),
                "price": 39.90,
                "old_price": 65.00,
                "discount": 39,
                "rating": 4.8,
                "sales_count": 1840,
                "trend_score": 88,
                "affiliate_url": "https://exemplo.com/afiliado/demo-organizador-giratorio",
                "featured": 0,
                "trending": 1
            },
            {
                "name": "Pistola Massageadora Muscular Fascial Profissional",
                "slug": "pistola-massageadora-muscular-fascial-profissional",
                "short_description": "Alívio imediato de dores musculares, tensão cervical e recuperação pós-treino acelerada.",
                "description": """Pistola de massagem percussiva de alta frequência com 6 velocidades ajustáveis e 4 ponteiras intercambiáveis anatômicas para diferentes grupos musculares.

Motor ultra silencioso Brushless com bateria recarregável de longa duração (até 4h de uso contínuo).""",
                "category_slug": "fitness",
                "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([]),
                "price": 119.90,
                "old_price": 219.00,
                "discount": 45,
                "rating": 4.9,
                "sales_count": 4210,
                "trend_score": 93,
                "affiliate_url": "https://exemplo.com/afiliado/demo-pistola-massageadora",
                "featured": 1,
                "trending": 1
            },
            {
                "name": "Organizador de Cabos Magnético de Mesa",
                "slug": "organizador-de-cabos-magnetico-mesa",
                "short_description": "Mantenha todos os cabos de carregamento no lugar sem cair atrás da mesa de trabalho.",
                "description": """Base adesiva reutilizável com ímãs potentes de neodímio que fixam firmemente os clipes de cabo. Compatível com cabos Lightning, USB-C, Micro-USB e cabos trançados de até 5mm.

Design elegante e discreto que valoriza qualquer setup de home office ou mesa de cabeceira.""",
                "category_slug": "tecnologia",
                "image": "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([]),
                "price": 29.90,
                "old_price": 49.90,
                "discount": 40,
                "rating": 4.6,
                "sales_count": 1290,
                "trend_score": 86,
                "affiliate_url": "https://exemplo.com/afiliado/demo-organizador-cabos",
                "featured": 0,
                "trending": 0
            },
            {
                "name": "Suporte Articulado para Celular e Tablet 360°",
                "slug": "suporte-articulado-celular-tablet-360",
                "short_description": "Braço mecânico em liga metálica com fixação firme em mesas, balcões e cabeceiras de cama.",
                "description": """Perfeito para chamadas de vídeo, gravação de conteúdo, assistir tutoriais na cozinha ou relaxar na cama. Garras revestidas em silicone que protegem os aparelhos de arranhões.

Ajuste preciso de ângulo e altura sem trepidação.""",
                "category_slug": "tecnologia",
                "image": "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([]),
                "price": 45.00,
                "old_price": 79.90,
                "discount": 44,
                "rating": 4.7,
                "sales_count": 3100,
                "trend_score": 89,
                "affiliate_url": "https://exemplo.com/afiliado/demo-suporte-articulado",
                "featured": 0,
                "trending": 1
            },
            {
                "name": "Comedouro Lento Interativo para Pets Anti-Engasgo",
                "slug": "comedouro-lento-interativo-pets",
                "short_description": "Promove alimentação saudável, estimula o raciocínio e evita indigestão em cães e gatos.",
                "description": """Labirinto inteligente de alimentação que reduz a velocidade de ingestão em até 10 vezes. Base antiderrapante emborrachada que não desliza pelo chão.

Fabricado em polipropileno atóxico de grau alimentício, fácil de higienizar e adequado para ração seca ou alimentos úmidos.""",
                "category_slug": "pets",
                "image": "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([]),
                "price": 38.90,
                "old_price": 59.90,
                "discount": 35,
                "rating": 4.8,
                "sales_count": 1420,
                "trend_score": 87,
                "affiliate_url": "https://exemplo.com/afiliado/demo-comedouro-lento-pets",
                "featured": 0,
                "trending": 0
            },
            {
                "name": "Suporte Veicular Magnético com Carregador por Indução 15W",
                "slug": "suporte-veicular-magnetico-por-inducao-15w",
                "short_description": "Fixação MagSafe ultra forte na saída de ar com carregamento rápido sem fios no carro.",
                "description": """Alinhamento magnético automático potente que mantém o smartphone seguro mesmo nas pistas mais esburacadas. Carregamento rápido inteligente de 15W com proteção contra sobreaquecimento.

Giro esférico de 360° para visualização perfeita de GPS na vertical ou horizontal.""",
                "category_slug": "automotivo",
                "image": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([]),
                "price": 84.90,
                "old_price": 149.00,
                "discount": 43,
                "rating": 4.9,
                "sales_count": 2730,
                "trend_score": 92,
                "affiliate_url": "https://exemplo.com/afiliado/demo-suporte-veicular-magsafe",
                "featured": 1,
                "trending": 1
            },
            {
                "name": "Barra de Luz LED para Monitor com Sensor de Toque",
                "slug": "barra-de-luz-led-monitor-sensor-toque",
                "short_description": "Ilumina sua área de trabalho sem reflexos na tela, reduzindo a fadiga ocular em 80%.",
                "description": """Barra óptica assimétrica que foca a iluminação exclusivamente na mesa de trabalho, mantendo o monitor totalmente livre de reflexos incômodos.

Ajuste contínuo de brilho e temperatura de cor (luz quente, neutra e fria) através de sensores sensíveis ao toque. Alimentação direta na porta USB do monitor ou PC.""",
                "category_slug": "games",
                "image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([]),
                "price": 139.90,
                "old_price": 249.00,
                "discount": 44,
                "rating": 4.9,
                "sales_count": 3890,
                "trend_score": 97,
                "affiliate_url": "https://exemplo.com/afiliado/demo-barra-luz-monitor",
                "featured": 1,
                "trending": 1
            },
            {
                "name": "Escova Secadora e Modeladora Cerâmica Ionizada 4 em 1",
                "slug": "escova-secadora-modeladora-ceramica-4em1",
                "short_description": "Seca, alisa, modela e dá volume com cerdas flexíveis e gerador de íons anti-frizz.",
                "description": """Revestimento cerâmico com óleo de argan que distribui o calor uniformemente e sela a cutícula capilar. Possui 3 níveis de temperatura e 2 velocidades com fluxo de ar potente.

Cabo giratório 360° ergonômico que proporciona praticidade de salão em casa em poucos minutos.""",
                "category_slug": "beleza",
                "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
                "additional_images": json.dumps([]),
                "price": 99.90,
                "old_price": 189.90,
                "discount": 47,
                "rating": 4.8,
                "sales_count": 6430,
                "trend_score": 94,
                "affiliate_url": "https://exemplo.com/afiliado/demo-escova-secadora-4em1",
                "featured": 0,
                "trending": 1
            }
        ]

        for p in demo_products:
            cat_id = cat_map.get(p["category_slug"])
            if not cat_id:
                # default to first category if not found
                cat_id = list(cat_map.values())[0]

            cursor.execute("""
                INSERT INTO products (
                    name, slug, description, short_description, category_id,
                    image, additional_images, price, old_price, discount,
                    rating, sales_count, trend_score, affiliate_url,
                    featured, trending, active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                p["name"], p["slug"], p["description"], p["short_description"], cat_id,
                p["image"], p["additional_images"], p["price"], p["old_price"], p["discount"],
                p["rating"], p["sales_count"], p["trend_score"], p["affiliate_url"],
                p["featured"], p["trending"], 1
            ))
        conn.commit()

    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_PATH)
