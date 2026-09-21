export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image?: string;
  active: number;
  product_count?: number;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  tag?: string;
  image: string;
  mobile_image?: string;
  video_url?: string;
  product_id?: number;
  cta_text?: string;
  cta_url?: string;
  active: number;
  order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  image: string;
  additional_images?: string[];
  video_url?: string;
  price: number;
  old_price?: number;
  discount: number;
  rating: number;
  sales_count: number;
  trend_score: number;
  affiliate_url: string;
  featured: number;
  trending: number;
  active: number;
  clicks?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettings {
  site_name: string;
  slogan: string;
  description: string;
  currency: string;
  logo?: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  footer_text: string;
}

export interface DashboardStats {
  total_products: number;
  active_products: number;
  featured_products: number;
  trending_products: number;
  total_categories: number;
  total_banners?: number;
  total_clicks: number;
  avg_discount: number;
}
