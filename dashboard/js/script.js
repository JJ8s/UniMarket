// ============================================================
//  DATOS DE EJEMPLO (simulando una API)
// ============================================================
const productsData = [
  {
    id: 1,
    title: 'Brownies de Chocolate Caseros',
    seller: 'María G.',
    category: 'snacks',
    rating: 5.0,
    price: 2.50,
    badge: 'Casero',
    imageColor: 'bg-amber-100',
    distance: 0.5,
    description: 'Deliciosos brownies artesanales...',
  },
  {
    id: 2,
    title: 'Calculadora Científica Casio',
    seller: 'Carlos R.',
    category: 'tecnologia',
    rating: 4.8,
    price: 15.00,
    badge: 'Usado',
    imageColor: 'bg-slate-200',
    distance: 1.2,
  },
  {
    id: 3,
    title: 'Chaqueta Denim Vintage',
    seller: 'Ana V.',
    category: 'ropa',
    rating: 4.9,
    price: 20.00,
    badge: '2da Mano',
    imageColor: 'bg-blue-100',
    distance: 2.5,
  },
  {
    id: 4,
    title: 'Bebida Energética Monster',
    seller: 'Kiosco Central',
    category: 'snacks',
    rating: 4.5,
    price: 3.00,
    badge: 'Nuevo',
    imageColor: 'bg-green-100',
    distance: 0.2,
  },
  {
    id: 5,
    title: 'Teclado Mecánico Keychron K2',
    seller: 'Luis M.',
    category: 'tecnologia',
    rating: 4.7,
    price: 45.00,
    badge: 'Como Nuevo',
    imageColor: 'bg-zinc-200',
    distance: 3.0,
  },
  {
    id: 6,
    title: 'Galletas de Avena y Pasas',
    seller: 'Sofía T.',
    category: 'snacks',
    rating: 5.0,
    price: 1.50,
    badge: 'Casero',
    imageColor: 'bg-orange-100',
    distance: 0.8,
  },
  {
    id: 7,
    title: 'Sudadera Universitaria Talla M',
    seller: 'Diego F.',
    category: 'ropa',
    rating: 4.6,
    price: 12.00,
    badge: 'Usado',
    imageColor: 'bg-rose-100',
    distance: 1.5,
  },
  {
    id: 8,
    title: 'Monitor Dell 24" Full HD IPS',
    seller: 'Laura P.',
    category: 'tecnologia',
    rating: 4.9,
    price: 80.00,
    badge: 'Usado',
    imageColor: 'bg-indigo-100',
    distance: 4.2,
  },
];

// ============================================================
//  CLASE PRINCIPAL: UniMarketApp (POO)
// ============================================================
class UniMarketApp {
  constructor() {
    // Estado
    this.products = productsData;
    this.cart = [];
    this.currentFilter = 'todos';
    this.radius = 5;
    this.location = null;

    // Elementos DOM
    this.grid = document.getElementById('product-grid');
    this.emptyMsg = document.getElementById('empty-message');
    this.badge = document.getElementById('badge');
    this.locationText = document.getElementById('location-text');
    this.radiusSlider = document.getElementById('radius-slider');
    this.radiusLabel = document.getElementById('radius-label');
    this.locationBadge = document.getElementById('location-badge');
    this.badgeText = document.getElementById('badge-text');

    // Inicializar
    this.init();
  }

  init() {
    this.renderProducts();
    this.setupEventListeners();
    this.updateCartBadge();
  }

  // ===================== RENDER =====================
  renderProducts() {
    const filtered = this.getFilteredProducts();
    this.grid.innerHTML = '';

    if (filtered.length === 0) {
      this.emptyMsg.classList.remove('hidden');
      return;
    }
    this.emptyMsg.classList.add('hidden');

    filtered.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.id = product.id;

      card.innerHTML = `
        <div class="product-image ${product.imageColor}">
          <span class="product-badge">${product.badge}</span>
          <span class="product-distance">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            a ${product.distance} km
          </span>
        </div>
        <div class="product-info">
          <div class="product-title">${product.title}</div>
          <div class="product-seller">${product.seller} · ${this.getCategoryLabel(product.category)}</div>
          <div class="product-footer">
            <span class="product-rating">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
              </svg>
              ${product.rating}
            </span>
            <span class="product-price">$${product.price.toFixed(2)}</span>
          </div>
        </div>
      `;

      // Evento click para ver detalle
      card.addEventListener('click', () => this.showProductDetail(product.id));

      this.grid.appendChild(card);
    });

    this.updateLocationBadge();
  }

  getCategoryLabel(cat) {
    const map = {
      snacks: 'Snacks & Comida',
      ropa: 'Ropa & Accesorios',
      tecnologia: 'Tecnología & Electrónica',
      otros: 'Otros Artículos'
    };
    return map[cat] || cat;
  }

  getFilteredProducts() {
    let filtered = this.products;

    // Filtrar por categoría
    if (this.currentFilter !== 'todos') {
      filtered = filtered.filter(p => p.category === this.currentFilter);
    }

    // Filtrar por radio (si hay ubicación)
    if (this.location) {
      filtered = filtered.filter(p => p.distance <= this.radius);
    }

    return filtered;
  }

  // ===================== EVENTOS =====================
  setupEventListeners() {
    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.renderProducts();
      });
    });

    // Radio
    this.radiusSlider.addEventListener('input', (e) => {
      this.radius = parseInt(e.target.value);
      this.radiusLabel.textContent = `${this.radius} km`;
      if (this.location) {
        this.renderProducts();
      }
      this.updateLocationBadge();
    });

    // Detectar ubicación (simulado)
    document.getElementById('detect-location').addEventListener('click', () => {
      this.location = 'Campus Central';
      this.locationText.textContent = '📍 Campus Central';
      this.renderProducts();
      this.updateLocationBadge();
    });

    // Botón publicar
    document.getElementById('publish-btn').addEventListener('click', () => {
      alert('Funcionalidad de publicación (próximamente)');
    });

    // Carrito (ejemplo)
    document.getElementById('cart-btn').addEventListener('click', () => {
      alert('Abrir carrito (próximamente)');
    });

    // Búsqueda (prevenir envío por ahora)
    document.getElementById('search-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const query = document.getElementById('search-input').value.trim();
      if (query) {
        alert(`Buscando: "${query}" (próximamente)`);
      }
    });
  }

  // ===================== CARRITO =====================
  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;
    this.cart.push(product);
    this.updateCartBadge();
  }

  updateCartBadge() {
    this.badge.textContent = this.cart.length;
  }

  // ===================== UBICACIÓN =====================
  updateLocationBadge() {
    if (this.location) {
      this.locationBadge.classList.remove('hidden');
      this.badgeText.textContent = `A menos de ${this.radius} km de ${this.location}`;
    } else {
      this.locationBadge.classList.add('hidden');
    }
  }

  // ===================== DETALLE =====================
  showProductDetail(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      alert(`Ver detalle de: ${product.title}\nPrecio: $${product.price}\nVendedor: ${product.seller}`);
    }
  }
}

// ============================================================
//  INSTANCIAR LA APLICACIÓN
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const app = new UniMarketApp();
});