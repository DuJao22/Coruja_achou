/**
 * CORUJA ACHOU - Public Client Interactivity
 */
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('hidden');
    });
  }

  // Mobile Search Toggle
  const mobileSearchBtn = document.getElementById('mobileSearchBtn');
  const mobileSearchBar = document.getElementById('mobileSearchBar');
  if (mobileSearchBtn && mobileSearchBar) {
    mobileSearchBtn.addEventListener('click', () => {
      mobileSearchBar.classList.toggle('hidden');
      const input = mobileSearchBar.querySelector('input');
      if (!mobileSearchBar.classList.contains('hidden') && input) {
        input.focus();
      }
    });
  }

  // Horizontal Category Scroll Helpers
  const catScrollContainer = document.getElementById('categoryScroll');
  const scrollLeftBtn = document.getElementById('scrollCatsLeft');
  const scrollRightBtn = document.getElementById('scrollCatsRight');

  if (catScrollContainer) {
    if (scrollLeftBtn) {
      scrollLeftBtn.addEventListener('click', () => {
        catScrollContainer.scrollBy({ left: -240, behavior: 'smooth' });
      });
    }
    if (scrollRightBtn) {
      scrollRightBtn.addEventListener('click', () => {
        catScrollContainer.scrollBy({ left: 240, behavior: 'smooth' });
      });
    }
  }

  // Product Gallery Image Switcher
  const mainProductImg = document.getElementById('mainProductImage');
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');
  if (mainProductImg && galleryThumbs.length > 0) {
    galleryThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const fullSrc = thumb.getAttribute('data-full-src');
        if (fullSrc) {
          mainProductImg.src = fullSrc;
          galleryThumbs.forEach(t => t.classList.remove('border-purple-500', 'ring-2', 'ring-purple-500/40'));
          thumb.classList.add('border-purple-500', 'ring-2', 'ring-purple-500/40');
        }
      });
    });
  }

  // Animate Owl Score Meters on scroll
  const meters = document.querySelectorAll('.owl-meter-fill');
  if ('IntersectionObserver' in window && meters.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetWidth = entry.target.getAttribute('data-width') || '85%';
          entry.target.style.width = targetWidth;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    meters.forEach(m => {
      m.style.width = '0%';
      observer.observe(m);
    });
  }
});
