/**
 * CORUJA ACHOU - Admin Panel Interactivity & Utilities
 */

function slugify(text) {
  if (!text) return '';
  const from = "àáäâãèéëêìíïîòóöôõùúüûñç·/_,:;";
  const to   = "aaaaaeeeeiiiiooooouuuunc------";
  let str = text.trim().toLowerCase();
  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }
  return str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-')        // collapse whitespace and replace by -
    .replace(/-+/g, '-')         // collapse dashes
    .replace(/^-+/, '')          // trim - from start of text
    .replace(/-+$/, '');         // trim - from end of text
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auto slug generator
  const nameInput = document.getElementById('nameInput');
  const slugInput = document.getElementById('slugInput');
  let slugUserEdited = false;

  if (slugInput) {
    slugInput.addEventListener('input', () => {
      slugUserEdited = true;
    });
  }

  if (nameInput && slugInput) {
    nameInput.addEventListener('input', () => {
      if (!slugUserEdited || slugInput.value === '') {
        slugInput.value = slugify(nameInput.value);
      }
    });
  }

  // 2. Discount calculator
  const priceInput = document.getElementById('priceInput');
  const oldPriceInput = document.getElementById('oldPriceInput');
  const discountDisplay = document.getElementById('discountDisplay');

  function updateDiscount() {
    if (!priceInput || !oldPriceInput || !discountDisplay) return;
    const price = parseFloat(priceInput.value.replace(',', '.')) || 0;
    const oldPrice = parseFloat(oldPriceInput.value.replace(',', '.')) || 0;

    if (oldPrice > price && price > 0) {
      const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
      discountDisplay.textContent = `-${discount}%`;
      discountDisplay.parentElement.classList.remove('hidden');
    } else {
      discountDisplay.parentElement.classList.add('hidden');
    }
  }

  if (priceInput && oldPriceInput) {
    priceInput.addEventListener('input', updateDiscount);
    oldPriceInput.addEventListener('input', updateDiscount);
    updateDiscount();
  }

  // 3. Image preview handling (File Upload & URL input)
  const imageFileInput = document.getElementById('imageFileInput');
  const imageUrlInput = document.getElementById('imageUrlInput');
  const imagePreview = document.getElementById('imagePreview');
  const imagePreviewPlaceholder = document.getElementById('imagePreviewPlaceholder');

  function showPreview(src) {
    if (!imagePreview) return;
    if (src) {
      imagePreview.src = src;
      imagePreview.classList.remove('hidden');
      if (imagePreviewPlaceholder) imagePreviewPlaceholder.classList.add('hidden');
    }
  }

  if (imageFileInput) {
    imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          showPreview(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (imageUrlInput) {
    imageUrlInput.addEventListener('input', () => {
      const url = imageUrlInput.value.trim();
      if (url) {
        showPreview(url);
      }
    });
  }

  // 4. AJAX Toggle Active for Products
  const toggleButtons = document.querySelectorAll('.btn-toggle-active');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const form = btn.closest('form');
      if (!form) return;

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        const data = await res.json();
        if (data.success) {
          const badge = btn.querySelector('.status-badge');
          if (badge) {
            if (data.active === 1) {
              badge.textContent = 'Ativo';
              badge.className = 'status-badge px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            } else {
              badge.textContent = 'Inativo';
              badge.className = 'status-badge px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
            }
          }
        }
      } catch (err) {
        // Fallback to normal form submit
        form.submit();
      }
    });
  });
});
