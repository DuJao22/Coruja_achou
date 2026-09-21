import React from 'react';
import { SiteSettings, Category } from '../types';
import { ShieldCheck, ArrowUp } from 'lucide-react';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onSelectCategory: (slug: string | null) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories,
  onSelectCategory,
  onOpenAdmin,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-zinc-800 text-white mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-white/20 shadow-md shrink-0 bg-black">
                <img 
                  src="/logo.jpg" 
                  alt="Coruja Achou" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xl font-black tracking-tight uppercase">
                {settings.site_name || 'CORUJA ACHOU'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
              {settings.description || 'Uma vitrine independente dedicada a descobrir, testar e selecionar as melhores oportunidades, produtos inovadores e achados com excelente custo-benefício.'}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                >
                  Instagram
                </a>
              )}
              {settings.tiktok && (
                <a
                  href={settings.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
                >
                  TikTok
                </a>
              )}
              {settings.whatsapp && (
                <a
                  href={settings.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-800 transition-colors"
                >
                  Grupo VIP WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Categorias Populares
            </h4>
            <div className="flex flex-col space-y-2 text-xs text-zinc-400">
              {categories.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCategory(c.slug);
                    scrollToTop();
                  }}
                  className="text-left hover:text-white transition-colors"
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Links & Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Segurança & Acesso
            </h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 text-white font-medium">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Links Verificados</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-400">
                Não realizamos cobranças diretas. Todas as compras são finalizadas com segurança nos marketplaces oficiais.
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="text-zinc-500 hover:text-white text-[11px] underline transition-colors"
                >
                  Acesso Administrativo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="text-center sm:text-left text-[11px] max-w-2xl leading-relaxed">
            {settings.footer_text || '© 2026 CORUJA ACHOU. Todos os direitos reservados. Vitrine editorial independente.'}
          </p>

          <button
            onClick={scrollToTop}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors shrink-0"
            title="Voltar ao topo"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
