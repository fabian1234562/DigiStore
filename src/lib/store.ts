import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory: string;
  image: string;
  rating: number;
  reviews: number;
  sold: number;
  deliveryTime: string;
  platform: string;
  region: string;
  tags: string[];
  stock: number;
  featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  cartOpen: boolean;
  authOpen: boolean;
  selectedProduct: Product | null;
  productDetailOpen: boolean;
  user: { id: string; name: string; email: string } | null;
  searchQuery: string;
  selectedCategory: string;
  selectedSubcategory: string;
  sortBy: string;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  setAuthOpen: (open: boolean) => void;
  setSelectedProduct: (product: Product | null) => void;
  setProductDetailOpen: (open: boolean) => void;
  setUser: (user: { id: string; name: string; email: string } | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedSubcategory: (subcategory: string) => void;
  setSortBy: (sort: string) => void;
  cartTotal: () => number;
  cartCount: () => number;
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  cartOpen: false,
  authOpen: false,
  selectedProduct: null,
  productDetailOpen: false,
  user: null,
  searchQuery: '',
  selectedCategory: 'all',
  selectedSubcategory: 'all',
  sortBy: 'popular',

  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { cart: [...state.cart, { product, quantity: 1 }] };
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      cart:
        quantity <= 0
          ? state.cart.filter((item) => item.product.id !== productId)
          : state.cart.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
    })),

  clearCart: () => set({ cart: [] }),
  setCartOpen: (open) => set({ cartOpen: open }),
  setAuthOpen: (open) => set({ authOpen: open }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setProductDetailOpen: (open) => set({ productDetailOpen: open }),
  setUser: (user) => set({ user }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category, selectedSubcategory: 'all' }),
  setSelectedSubcategory: (subcategory) => set({ selectedSubcategory: subcategory }),
  setSortBy: (sort) => set({ sortBy: sort }),

  cartTotal: () =>
    get().cart.reduce((total, item) => total + item.product.price * item.quantity, 0),

  cartCount: () =>
    get().cart.reduce((count, item) => count + item.quantity, 0),
}));

export const CATEGORIES = [
  { id: 'gaming', name: 'Gaming', icon: 'Gamepad2', color: 'from-purple-500 to-pink-500' },
  { id: 'streaming', name: 'Streaming', icon: 'Tv', color: 'from-red-500 to-orange-500' },
  { id: 'accounts', name: 'Cuentas', icon: 'UserCircle', color: 'from-emerald-500 to-teal-500' },
  { id: 'giftcards', name: 'Tarjetas Regalo', icon: 'Gift', color: 'from-amber-500 to-yellow-500' },
  { id: 'software', name: 'Software', icon: 'AppWindow', color: 'from-cyan-500 to-blue-500' },
  { id: 'subscriptions', name: 'Suscripciones', icon: 'RefreshCw', color: 'from-violet-500 to-purple-500' },
];

export const SUBCATEGORIES: Record<string, string[]> = {
  gaming: ['Skins', 'V-Bucks', 'Robux', 'Monedas', 'Pases de Batalla', 'Cuentas', 'Items'],
  streaming: ['Netflix', 'Spotify', 'Disney+', 'HBO Max', 'Crunchyroll', 'Prime Video', 'Paramount+', 'Apple TV+'],
  accounts: ['Gaming', 'Streaming', 'Redes Sociales', 'Software'],
  giftcards: ['PlayStation', 'Xbox', 'Nintendo', 'Steam', 'Apple', 'Google Play', 'Amazon', 'Netflix', 'Epic Games'],
  software: ['Licencias Windows', 'Office', 'Antivirus', 'VPN', 'Herramientas'],
  subscriptions: ['Spotify', 'YouTube Premium', 'Discord Nitro', 'Twitch', 'Cloud Gaming', 'Canva Pro'],
};

// Real product images from web search
const IMG = {
  vbucks: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c79881560ec7.jpg',
  vbucks2800: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5084f9786eba.jpg',
  robux: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dbb49835219f.png',
  robux1700: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6b7dd3f93f44.jpg',
  netflix: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/14a1c5f6ed2d.png',
  netflixgc: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ba07b04351fe.jpg',
  spotify: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3312f51c5e60.jpg',
  steam: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/efc9767063ba.jpg',
  epic: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5b3496408140.png',
  win11: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f63eb6ade27c.jpg',
  office: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9f61712fdd94.png',
  adobe: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8a1cf95baa3f.jpg',
  ps: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3a5a508c433c.jpg',
  gamepass: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a0d7be63ee69.jpg',
  yt: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ddf35ebe2f5d.png',
  valorant: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4009745d48c8.jpg',
  apex: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/288b0a0084de.jpg',
  pubg: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/25da5e895239.jpg',
  warzone: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2d5cebe0bcc1.jpg',
  freefire: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a3463b0b34bc.jpg',
  amongus: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/da1445d915e0.jpg',
  minecraft: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/faf7b38ef295.jpg',
  genshin: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/58ef7ddeeaec.png',
  clashroyale: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c4b7303e38da.jpg',
  mobilelegends: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c97d7e0b8faa.jpg',
  brawlstars: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/73f142390d94.png',
  disney: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/71cbd03b93ff.jpg',
  discord: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/06243c250de4.png',
  vpn: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/37500ba95dd2.jpg',
  hbo: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a852ed51ceb1.jpg',
  crunchyroll: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2c5ad4448d66.jpg',
  xbox: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dc54dedbc1e6.jpg',
  primevideo: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/99d3658a2fd3.jpg',
  paramount: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9b1ed2b16dd7.jpg',
  appletv: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7f49aaab59d1.jpg',
  twitch: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2f6ed0137a6f.png',
  canva: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cd3fa6bc6c49.jpg',
  itunes: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d2323831542a.jpg',
  amazon: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7cbbcc16b019.jpg',
};

export const PRODUCTS: Product[] = [
  // GAMING - Juegos Populares
  {
    id: 'g1', name: '1000 V-Bucks - Fortnite', description: 'Moneda virtual para Fortnite. Compra skins, pases de batalla y mas en la tienda del juego.', price: 4.99, originalPrice: 9.99, category: 'gaming', subcategory: 'V-Bucks', image: IMG.vbucks, rating: 4.8, reviews: 12500, sold: 89000, deliveryTime: 'Entrega instantanea', platform: 'Fortnite', region: 'Global', tags: ['popular', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 'g2', name: '2800 V-Bucks - Fortnite', description: 'Paquete de 2800 V-Bucks para Fortnite. Ideal para comprar el Pase de Batalla y varias skins.', price: 12.99, originalPrice: 24.99, category: 'gaming', subcategory: 'V-Bucks', image: IMG.vbucks2800, rating: 4.8, reviews: 8200, sold: 62000, deliveryTime: 'Entrega instantanea', platform: 'Fortnite', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'g3', name: '800 Robux - Roblox', description: 'Robux para Roblox. Personaliza tu avatar, compra game passes y items exclusivos.', price: 3.99, originalPrice: 9.99, category: 'gaming', subcategory: 'Robux', image: IMG.robux, rating: 4.7, reviews: 9800, sold: 72000, deliveryTime: 'Entrega instantanea', platform: 'Roblox', region: 'Global', tags: ['popular', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 'g4', name: '1700 Robux - Roblox', description: 'Paquete de 1700 Robux. Suficiente para multiples game passes y accesorios premium.', price: 7.99, originalPrice: 19.99, category: 'gaming', subcategory: 'Robux', image: IMG.robux1700, rating: 4.7, reviews: 6500, sold: 48000, deliveryTime: 'Entrega instantanea', platform: 'Roblox', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'g5', name: 'Pase de Batalla - Temporada Actual', description: '100 niveles de premios exclusivos durante toda la temporada de Fortnite.', price: 5.99, originalPrice: 9.99, category: 'gaming', subcategory: 'Pases de Batalla', image: IMG.vbucks, rating: 4.6, reviews: 5600, sold: 45000, deliveryTime: 'Entrega instantanea', platform: 'Fortnite', region: 'Global', tags: ['tendencia'], stock: 999, featured: true,
  },
  {
    id: 'g6', name: '2800 Monedas FIFA/EA FC', description: 'Monedas para FIFA / EA FC Ultimate Team. Construye tu equipo suenado con jugadores top.', price: 9.99, originalPrice: 24.99, category: 'gaming', subcategory: 'Monedas', image: IMG.valorant, rating: 4.5, reviews: 3400, sold: 28000, deliveryTime: '5-30 minutos', platform: 'EA FC 25', region: 'Global', tags: ['oferta'], stock: 500, featured: false,
  },
  {
    id: 'g7', name: 'Skin Legendaria - Valorant', description: 'Skin premium con efectos especiales y animacion unica para tu arma favorita en Valorant.', price: 7.99, originalPrice: 19.99, category: 'gaming', subcategory: 'Skins', image: IMG.valorant, rating: 4.9, reviews: 2100, sold: 15000, deliveryTime: 'Entrega instantanea', platform: 'Valorant', region: 'Global', tags: ['premium'], stock: 200, featured: true,
  },
  {
    id: 'g8', name: 'Cuenta Premium Minecraft', description: 'Cuenta premium de Minecraft Java Edition con acceso completo a multijugador y skins.', price: 4.99, originalPrice: 26.95, category: 'gaming', subcategory: 'Cuentas', image: IMG.minecraft, rating: 4.4, reviews: 7800, sold: 62000, deliveryTime: '1-24 horas', platform: 'Minecraft', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 150, featured: false,
  },
  {
    id: 'g9', name: 'RP League of Legends - 1380', description: 'Riot Points para League of Legends. Desbloquea campeones, skins y chromas exclusivos.', price: 5.49, originalPrice: 9.99, category: 'gaming', subcategory: 'Monedas', image: IMG.valorant, rating: 4.6, reviews: 4200, sold: 35000, deliveryTime: 'Entrega instantanea', platform: 'League of Legends', region: 'Global', tags: ['popular'], stock: 999, featured: false,
  },
  {
    id: 'g10', name: 'Genesis Crystal Pack - Genshin Impact', description: 'Paquete de cristales genesis. Obtene personajes 5 estrellas y armas legendarias.', price: 7.99, originalPrice: 19.99, category: 'gaming', subcategory: 'Monedas', image: IMG.genshin, rating: 4.8, reviews: 6100, sold: 48000, deliveryTime: 'Entrega instantanea', platform: 'Genshin Impact', region: 'Global', tags: ['oferta', 'tendencia'], stock: 999, featured: true,
  },
  {
    id: 'g11', name: 'Monedas Apex Legends - 1000', description: 'Monedas para Apex Legends. Desbloquea skins de armas, legendas y objetos del pase de batalla.', price: 4.99, originalPrice: 9.99, category: 'gaming', subcategory: 'Monedas', image: IMG.apex, rating: 4.6, reviews: 3800, sold: 32000, deliveryTime: 'Entrega instantanea', platform: 'Apex Legends', region: 'Global', tags: ['popular'], stock: 999, featured: false,
  },
  {
    id: 'g12', name: 'UC PUBG Mobile - 600', description: 'Unlimited Cash para PUBG Mobile. Compra skins, armas y el Royal Pass con descuento.', price: 4.49, originalPrice: 9.99, category: 'gaming', subcategory: 'Monedas', image: IMG.pubg, rating: 4.5, reviews: 5200, sold: 41000, deliveryTime: 'Entrega instantanea', platform: 'PUBG Mobile', region: 'Global', tags: ['popular', 'oferta'], stock: 999, featured: false,
  },
  {
    id: 'g13', name: 'Cuenta Premium Warzone/CoD', description: 'Cuenta con todos los DLCs y codigos de Call of Duty Warzone desbloqueados.', price: 5.99, originalPrice: 69.99, category: 'gaming', subcategory: 'Cuentas', image: IMG.warzone, rating: 4.3, reviews: 2800, sold: 18500, deliveryTime: '1-6 horas', platform: 'Call of Duty', region: 'Global', tags: ['oferta'], stock: 100, featured: false,
  },
  {
    id: 'g14', name: 'Diamantes Free Fire - 1000', description: 'Diamantes para Free Fire. Desbloquea personajes, skins de armas y el pase de elite.', price: 3.99, originalPrice: 9.99, category: 'gaming', subcategory: 'Monedas', image: IMG.freefire, rating: 4.4, reviews: 9200, sold: 78000, deliveryTime: 'Entrega instantanea', platform: 'Free Fire', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: false,
  },
  {
    id: 'g15', name: 'Cuenta Among Us - Skins Completas', description: 'Cuenta con todas las skins, mascotas y sombreros desbloqueados de Among Us.', price: 2.99, originalPrice: 14.99, category: 'gaming', subcategory: 'Cuentas', image: IMG.amongus, rating: 4.2, reviews: 4500, sold: 22000, deliveryTime: 'Entrega instantanea', platform: 'Among Us', region: 'Global', tags: ['oferta'], stock: 200, featured: false,
  },
  {
    id: 'g16', name: 'Gemas Clash Royale - 1400', description: 'Gemas premium para Clash Royale. Desbloquea cofres magicos y mejora tus cartas.', price: 3.99, originalPrice: 9.99, category: 'gaming', subcategory: 'Monedas', image: IMG.clashroyale, rating: 4.5, reviews: 6700, sold: 55000, deliveryTime: 'Entrega instantanea', platform: 'Clash Royale', region: 'Global', tags: ['popular'], stock: 999, featured: false,
  },
  {
    id: 'g17', name: 'Diamantes Mobile Legends - 400', description: 'Diamantes para Mobile Legends Bang Bang. Compra heroes, skins y el magic wheel.', price: 3.49, originalPrice: 8.99, category: 'gaming', subcategory: 'Monedas', image: IMG.mobilelegends, rating: 4.5, reviews: 7100, sold: 58000, deliveryTime: 'Entrega instantanea', platform: 'Mobile Legends', region: 'Global', tags: ['popular', 'oferta'], stock: 999, featured: false,
  },
  {
    id: 'g18', name: 'Gemas Brawl Stars - 170', description: 'Gemas premium para Brawl Stars. Desbloquea el Brawl Pass y cajas mega de personajes.', price: 3.49, originalPrice: 8.99, category: 'gaming', subcategory: 'Monedas', image: IMG.brawlstars, rating: 4.7, reviews: 8400, sold: 67000, deliveryTime: 'Entrega instantanea', platform: 'Brawl Stars', region: 'Global', tags: ['popular', 'tendencia'], stock: 999, featured: true,
  },
  // STREAMING
  {
    id: 's1', name: 'Netflix Premium - 1 Mes', description: 'Cuenta premium Netflix. Calidad 4K, 4 pantallas simultaneas y sin anuncios.', price: 3.99, originalPrice: 22.99, category: 'streaming', subcategory: 'Netflix', image: IMG.netflix, rating: 4.7, reviews: 15200, sold: 120000, deliveryTime: 'Entrega instantanea', platform: 'Netflix', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 's2', name: 'Netflix Premium - 3 Meses', description: '3 meses de Netflix Premium full. Ahorra comprando el paquete trimestral.', price: 9.99, originalPrice: 68.97, category: 'streaming', subcategory: 'Netflix', image: IMG.netflix, rating: 4.8, reviews: 8900, sold: 72000, deliveryTime: 'Entrega instantanea', platform: 'Netflix', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 's3', name: 'Spotify Premium - 1 Mes', description: '1 mes de Spotify Premium. Sin anuncios, descarga ilimitada y calidad extrema.', price: 1.99, originalPrice: 4.99, category: 'streaming', subcategory: 'Spotify', image: IMG.spotify, rating: 4.8, reviews: 22300, sold: 210000, deliveryTime: 'Entrega instantanea', platform: 'Spotify', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: false,
  },
  {
    id: 's4', name: 'Spotify Premium - 3 Meses', description: '3 meses de Spotify Premium. Sin anuncios, descarga ilimitada, calidad maxima.', price: 4.99, originalPrice: 14.97, category: 'streaming', subcategory: 'Spotify', image: IMG.spotify, rating: 4.8, reviews: 18900, sold: 195000, deliveryTime: 'Entrega instantanea', platform: 'Spotify', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 's5', name: 'Disney+ Premium - 1 Mes', description: 'Marvel, Star Wars, Pixar, National Geographic y mas. Calidad 4K UHD HDR.', price: 3.49, originalPrice: 13.99, category: 'streaming', subcategory: 'Disney+', image: IMG.disney, rating: 4.6, reviews: 8900, sold: 67000, deliveryTime: 'Entrega instantanea', platform: 'Disney+', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 's6', name: 'Crunchyroll Premium - 1 Mes', description: 'Anime sin anuncios, todos los titulos, estrenos simultaneos con Japon y manga incluido.', price: 2.99, originalPrice: 9.99, category: 'streaming', subcategory: 'Crunchyroll', image: IMG.crunchyroll, rating: 4.5, reviews: 5400, sold: 38000, deliveryTime: 'Entrega instantanea', platform: 'Crunchyroll', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 's7', name: 'HBO Max - 1 Mes', description: 'Series de HBO, peliculas Warner Bros, contenido DC y documentales exclusivos.', price: 3.49, originalPrice: 15.49, category: 'streaming', subcategory: 'HBO Max', image: IMG.hbo, rating: 4.5, reviews: 6200, sold: 42000, deliveryTime: 'Entrega instantanea', platform: 'HBO Max', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 's8', name: 'Amazon Prime Video - 1 Mes', description: 'Peliculas, series originales de Amazon, deportes en vivo y envios Prime incluidos.', price: 3.99, originalPrice: 14.99, category: 'streaming', subcategory: 'Prime Video', image: IMG.primevideo, rating: 4.6, reviews: 7800, sold: 56000, deliveryTime: 'Entrega instantanea', platform: 'Amazon Prime', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 's9', name: 'Paramount+ - 1 Mes', description: 'Contenido de CBS, MTV, Nickelodeon, peliculas de Paramount y series exclusivas.', price: 2.49, originalPrice: 11.99, category: 'streaming', subcategory: 'Paramount+', image: IMG.paramount, rating: 4.3, reviews: 3200, sold: 24000, deliveryTime: 'Entrega instantanea', platform: 'Paramount+', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 's10', name: 'Apple TV+ - 1 Mes', description: 'Series originales galardonadas de Apple, peliculas exclusivas y documentales.', price: 2.99, originalPrice: 9.99, category: 'streaming', subcategory: 'Apple TV+', image: IMG.appletv, rating: 4.4, reviews: 4100, sold: 29000, deliveryTime: 'Entrega instantanea', platform: 'Apple TV+', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  // GIFT CARDS
  {
    id: 'gc1', name: 'Tarjeta Steam - $50 USD', description: 'Gift card Steam. Compra juegos, DLC, software y mas en la tienda mas grande de PC.', price: 46.99, originalPrice: 50.00, category: 'giftcards', subcategory: 'Steam', image: IMG.steam, rating: 4.9, reviews: 22000, sold: 185000, deliveryTime: 'Entrega instantanea', platform: 'Steam', region: 'Global', tags: ['mas vendido'], stock: 999, featured: true,
  },
  {
    id: 'gc2', name: 'Tarjeta Steam - $20 USD', description: 'Gift card Steam de $20. Perfecta para comprar juegos indie o en oferta.', price: 18.99, originalPrice: 20.00, category: 'giftcards', subcategory: 'Steam', image: IMG.steam, rating: 4.8, reviews: 18000, sold: 156000, deliveryTime: 'Entrega instantanea', platform: 'Steam', region: 'Global', tags: ['popular'], stock: 999, featured: false,
  },
  {
    id: 'gc3', name: 'Tarjeta PlayStation - $25 USD', description: 'Gift card PlayStation Store para PS4/PS5. Juegos, DLC y suscripciones.', price: 23.49, originalPrice: 25.00, category: 'giftcards', subcategory: 'PlayStation', image: IMG.ps, rating: 4.8, reviews: 16500, sold: 142000, deliveryTime: 'Entrega instantanea', platform: 'PlayStation', region: 'Americas', tags: ['popular'], stock: 999, featured: false,
  },
  {
    id: 'gc4', name: 'Tarjeta PlayStation - $50 USD', description: 'Gift card PlayStation Store de $50. Ideal para juegos AAA de lanzamiento.', price: 46.49, originalPrice: 50.00, category: 'giftcards', subcategory: 'PlayStation', image: IMG.ps, rating: 4.9, reviews: 12400, sold: 98000, deliveryTime: 'Entrega instantanea', platform: 'PlayStation', region: 'Americas', tags: ['popular', 'oferta'], stock: 999, featured: false,
  },
  {
    id: 'gc5', name: 'Tarjeta Xbox - $50 USD', description: 'Gift card Xbox para Xbox Store y Game Pass. Juegos y suscripciones.', price: 45.99, originalPrice: 50.00, category: 'giftcards', subcategory: 'Xbox', image: IMG.xbox, rating: 4.7, reviews: 9800, sold: 78000, deliveryTime: 'Entrega instantanea', platform: 'Xbox', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'gc6', name: 'Tarjeta Google Play - $25 USD', description: 'Gift card Google Play para apps, juegos, peliculas y libros en Android.', price: 23.49, originalPrice: 25.00, category: 'giftcards', subcategory: 'Google Play', image: IMG.steam, rating: 4.6, reviews: 11200, sold: 95000, deliveryTime: 'Entrega instantanea', platform: 'Google Play', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'gc7', name: 'Tarjeta Nintendo eShop - $35 USD', description: 'Gift card Nintendo eShop para juegos de Switch clasicos y nuevos lanzamientos.', price: 32.49, originalPrice: 35.00, category: 'giftcards', subcategory: 'Nintendo', image: IMG.steam, rating: 4.8, reviews: 7600, sold: 54000, deliveryTime: 'Entrega instantanea', platform: 'Nintendo', region: 'Americas', tags: ['oferta'], stock: 500, featured: false,
  },
  {
    id: 'gc8', name: 'Tarjeta Apple/iTunes - $50 USD', description: 'Gift card Apple para App Store, iTunes, Apple Music y iCloud.', price: 46.99, originalPrice: 50.00, category: 'giftcards', subcategory: 'Apple', image: IMG.itunes, rating: 4.8, reviews: 14200, sold: 118000, deliveryTime: 'Entrega instantanea', platform: 'Apple', region: 'Global', tags: ['popular'], stock: 999, featured: false,
  },
  {
    id: 'gc9', name: 'Tarjeta Amazon - $50 USD', description: 'Gift card Amazon para compras en cualquier categoria de la tienda.', price: 47.49, originalPrice: 50.00, category: 'giftcards', subcategory: 'Amazon', image: IMG.amazon, rating: 4.9, reviews: 19500, sold: 168000, deliveryTime: 'Entrega instantanea', platform: 'Amazon', region: 'Global', tags: ['mas vendido'], stock: 999, featured: false,
  },
  {
    id: 'gc10', name: 'Tarjeta Netflix - $30 USD', description: 'Gift card oficial de Netflix. Carga saldo a tu cuenta de Netflix.', price: 28.49, originalPrice: 30.00, category: 'giftcards', subcategory: 'Netflix', image: IMG.netflixgc, rating: 4.7, reviews: 8900, sold: 67000, deliveryTime: 'Entrega instantanea', platform: 'Netflix', region: 'Americas', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'gc11', name: 'Tarjeta Epic Games - $25 USD', description: 'Gift card Epic Games Store. Compra juegos exclusivos y de gran presupuesto.', price: 23.49, originalPrice: 25.00, category: 'giftcards', subcategory: 'Epic Games', image: IMG.epic, rating: 4.6, reviews: 5800, sold: 38000, deliveryTime: 'Entrega instantanea', platform: 'Epic Games', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  // SOFTWARE
  {
    id: 'sw1', name: 'Licencia Windows 11 Pro - Clave Digital', description: 'Licencia original Windows 11 Pro. Clave 32/64 bits, activacion online oficial de Microsoft.', price: 8.99, originalPrice: 199.99, category: 'software', subcategory: 'Licencias Windows', image: IMG.win11, rating: 4.7, reviews: 28500, sold: 245000, deliveryTime: 'Entrega instantanea', platform: 'Windows', region: 'Global', tags: ['mas vendido', 'oferta', 'mejor margen'], stock: 999, featured: true,
  },
  {
    id: 'sw2', name: 'Microsoft Office 2024 - Clave Digital', description: 'Office 2024 completo: Word, Excel, PowerPoint, Outlook. Licencia perpetua para 1 PC.', price: 12.49, originalPrice: 249.99, category: 'software', subcategory: 'Office', image: IMG.office, rating: 4.6, reviews: 19800, sold: 178000, deliveryTime: 'Entrega instantanea', platform: 'Microsoft', region: 'Global', tags: ['mas vendido', 'oferta', 'mejor margen'], stock: 999, featured: true,
  },
  {
    id: 'sw3', name: 'VPN Premium - Suscripcion 2 Anos', description: 'Suscripcion VPN 2 anos. 5500+ servidores en 60 paises, sin registros, velocidad maxima.', price: 29.99, originalPrice: 286.56, category: 'software', subcategory: 'VPN', image: IMG.vpn, rating: 4.8, reviews: 14200, sold: 98000, deliveryTime: 'Entrega instantanea', platform: 'VPN', region: 'Global', tags: ['oferta', 'mejor margen'], stock: 999, featured: false,
  },
  {
    id: 'sw4', name: 'Adobe Creative Cloud - 1 Ano', description: 'Suite completa Adobe: Photoshop, Illustrator, Premiere Pro, After Effects y mas.', price: 34.99, originalPrice: 659.88, category: 'software', subcategory: 'Herramientas', image: IMG.adobe, rating: 4.7, reviews: 8900, sold: 52000, deliveryTime: 'Entrega instantanea', platform: 'Adobe', region: 'Global', tags: ['mejor margen', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 'sw5', name: 'Windows 10 Pro - Clave Digital', description: 'Licencia original Windows 10 Pro. Perfecta para PCs que no soportan Windows 11.', price: 6.99, originalPrice: 139.99, category: 'software', subcategory: 'Licencias Windows', image: IMG.win11, rating: 4.6, reviews: 16400, sold: 142000, deliveryTime: 'Entrega instantanea', platform: 'Windows', region: 'Global', tags: ['oferta', 'mejor margen'], stock: 999, featured: false,
  },
  {
    id: 'sw6', name: 'Antivirus Premium - 1 Ano 3 PCs', description: 'Proteccion completa para 3 dispositivos: antivirus, firewall, anti-phishing y control parental.', price: 9.99, originalPrice: 49.99, category: 'software', subcategory: 'Antivirus', image: IMG.vpn, rating: 4.5, reviews: 7600, sold: 48000, deliveryTime: 'Entrega instantanea', platform: 'Antivirus', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  // SUBSCRIPTIONS
  {
    id: 'sub1', name: 'YouTube Premium - 3 Meses', description: 'Sin anuncios, descarga de videos, YouTube Music Premium y reproduccion en segundo plano.', price: 5.99, originalPrice: 17.97, category: 'subscriptions', subcategory: 'YouTube Premium', image: IMG.yt, rating: 4.7, reviews: 13600, sold: 112000, deliveryTime: 'Entrega instantanea', platform: 'YouTube', region: 'Global', tags: ['popular', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 'sub2', name: 'Discord Nitro - 3 Meses', description: 'Emojis personalizados, stickers globales, streaming HD, mejor calidad de voz y boost de servidor.', price: 6.99, originalPrice: 29.97, category: 'subscriptions', subcategory: 'Discord Nitro', image: IMG.discord, rating: 4.8, reviews: 8900, sold: 68000, deliveryTime: 'Entrega instantanea', platform: 'Discord', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'sub3', name: 'Xbox Game Pass Ultimate - 1 Mes', description: 'Cientos de juegos para consola, PC y cloud gaming. Incluye EA Play y day-one releases.', price: 4.99, originalPrice: 16.99, category: 'subscriptions', subcategory: 'Cloud Gaming', image: IMG.gamepass, rating: 4.9, reviews: 16400, sold: 135000, deliveryTime: 'Entrega instantanea', platform: 'Xbox', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 'sub4', name: 'Twitch Turbo - 3 Meses', description: 'Sin anuncios en Twitch, chat sin limite de emotes, color personalizado en chat y almacenamiento extra.', price: 5.99, originalPrice: 26.97, category: 'subscriptions', subcategory: 'Twitch', image: IMG.twitch, rating: 4.5, reviews: 4200, sold: 28000, deliveryTime: 'Entrega instantanea', platform: 'Twitch', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'sub5', name: 'Canva Pro - 1 Ano', description: 'Diseno grafico profesional: plantillas premium, IA generativa, fondos removidos y mas de 100M de elementos.', price: 19.99, originalPrice: 119.99, category: 'subscriptions', subcategory: 'Canva Pro', image: IMG.canva, rating: 4.7, reviews: 6800, sold: 42000, deliveryTime: 'Entrega instantanea', platform: 'Canva', region: 'Global', tags: ['oferta', 'mejor margen'], stock: 999, featured: true,
  },
  {
    id: 'sub6', name: 'Spotify Premium - 6 Meses', description: '6 meses de Spotify Premium al mejor precio. Sin anuncios, descarga ilimitada y calidad ultra.', price: 8.99, originalPrice: 59.94, category: 'subscriptions', subcategory: 'Spotify', image: IMG.spotify, rating: 4.9, reviews: 11200, sold: 89000, deliveryTime: 'Entrega instantanea', platform: 'Spotify', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: false,
  },
  {
    id: 'sub7', name: 'Xbox Game Pass Ultimate - 3 Meses', description: '3 meses de Game Pass Ultimate: consola + PC + cloud. La mejor oferta para gamers.', price: 12.99, originalPrice: 50.97, category: 'subscriptions', subcategory: 'Cloud Gaming', image: IMG.gamepass, rating: 4.9, reviews: 9800, sold: 72000, deliveryTime: 'Entrega instantanea', platform: 'Xbox', region: 'Global', tags: ['oferta', 'tendencia'], stock: 999, featured: false,
  },
];

export const MARKET_DATA = {
  totalMarketSize: '$522B',
  gamingRevenue: '$225.28B',
  streamingRevenue: '$204.77B',
  digitalProductsGrowth: '12.6%',
  profitMargins: {
    software: { min: 85, max: 95, label: 'Software y Licencias' },
    gaming: { min: 70, max: 90, label: 'Gaming Digital' },
    streaming: { min: 60, max: 85, label: 'Streaming' },
    giftcards: { min: 3, max: 12, label: 'Gift Cards' },
    subscriptions: { min: 50, max: 80, label: 'Suscripciones' },
  },
  topProducts: [
    { name: 'Cuentas de Streaming', revenue: '$47.06B', growth: '+18.2%', margin: '60-85%' },
    { name: 'Skins y V-Bucks', revenue: '$32.5B', growth: '+22.1%', margin: '70-90%' },
    { name: 'Tarjetas de Regalo', revenue: '$28.3B', growth: '+9.8%', margin: '3-12%' },
    { name: 'Licencias Software', revenue: '$45.7B', growth: '+15.3%', margin: '85-95%' },
    { name: 'Suscripciones Gaming', revenue: '$18.9B', growth: '+28.5%', margin: '50-80%' },
    { name: 'Monedas In-Game', revenue: '$15.2B', growth: '+19.7%', margin: '70-90%' },
    { name: 'Cuentas Premium', revenue: '$12.8B', growth: '+14.2%', margin: '65-85%' },
  ],
  regionalDemand: [
    { region: 'Norteamérica', share: 35, trend: 'Estable' },
    { region: 'Asia-Pacífico', share: 38, trend: '+25%' },
    { region: 'Europa', share: 18, trend: '+12%' },
    { region: 'Latinoamérica', share: 6, trend: '+35%' },
    { region: 'África/MEA', share: 3, trend: '+40%' },
  ],
  bestBuys: [
    { product: 'Licencias Windows/Office', cost: '$2-5', sellPrice: '$8-15', margin: '75-90%', reason: 'Demanda masiva global, costo de adquisición extremadamente bajo' },
    { product: 'Suscripciones Netflix/Spotify', cost: '$0.50-1.50', sellPrice: '$3-5', margin: '70-85%', reason: 'Alta rotación, los usuarios renuevan mensualmente' },
    { product: 'V-Bucks / Robux', cost: '$2-3', sellPrice: '$4-6', margin: '50-65%', reason: 'Mercado infantil/juvenil enorme, compra impulsiva frecuente' },
    { product: 'Gift Cards Steam/PlayStation', cost: '$42-46', sellPrice: '$45-50', margin: '5-15%', reason: 'Volumen altísimo, confianza del consumidor, regalo ideal' },
    { product: 'Discord Nitro / YT Premium', cost: '$3-5', sellPrice: '$5-8', margin: '55-65%', reason: 'Crecimiento explosivo en comunidad gamer' },
    { product: 'Cuentas Minecraft Premium', cost: '$2-3', sellPrice: '$4-6', margin: '65-80%', reason: 'Uno de los juegos más vendidos de la historia' },
    { product: 'VPN Suscripciones', cost: '$10-18', sellPrice: '$25-35', margin: '50-65%', reason: 'Demanda creciente por privacidad y acceso geo-restringido' },
  ],
};
