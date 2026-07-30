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
  streaming: ['Netflix', 'Spotify', 'Disney+', 'HBO Max', 'Crunchyroll', 'Prime Video'],
  accounts: ['Gaming', 'Streaming', 'Redes Sociales', 'Software'],
  giftcards: ['PlayStation', 'Xbox', 'Nintendo', 'Steam', 'Apple', 'Google Play', 'Amazon'],
  software: ['Licencias Windows', 'Office', 'Antivirus', 'VPN', 'Herramientas'],
  subscriptions: ['Spotify', 'YouTube Premium', 'Discord Nitro', 'Twitch', 'Cloud Gaming'],
};

// Real product images from web search
const IMG = {
  vbucks: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c79881560ec7.jpg',
  robux: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dbb49835219f.png',
  netflix: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/14a1c5f6ed2d.png',
  spotify: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3312f51c5e60.jpg',
  steam: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/efc9767063ba.jpg',
  win11: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f63eb6ade27c.jpg',
  office: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9f61712fdd94.png',
  ps: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3a5a508c433c.jpg',
  gamepass: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a0d7be63ee69.jpg',
  yt: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ddf35ebe2f5d.png',
  valorant: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/4009745d48c8.jpg',
  minecraft: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/faf7b38ef295.jpg',
  genshin: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/58ef7ddeeaec.png',
  disney: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/71cbd03b93ff.jpg',
  discord: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/06243c250de4.png',
  vpn: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/37500ba95dd2.jpg',
  hbo: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a852ed51ceb1.jpg',
  crunchyroll: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2c5ad4448d66.jpg',
  xbox: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/dc54dedbc1e6.jpg',
};

export const PRODUCTS: Product[] = [
  // GAMING - Precios reales de reventa barata
  {
    id: 'g1', name: '1000 V-Bucks - Fortnite', description: 'Moneda virtual para Fortnite. Compra skins, pases de batalla y más.', price: 4.99, originalPrice: 9.99, category: 'gaming', subcategory: 'V-Bucks', image: IMG.vbucks, rating: 4.8, reviews: 12500, sold: 89000, deliveryTime: 'Entrega instantánea', platform: 'Fortnite', region: 'Global', tags: ['popular', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 'g2', name: '800 Robux - Roblox', description: 'Robux para Roblox. Personaliza tu avatar y compra game passes.', price: 3.99, originalPrice: 9.99, category: 'gaming', subcategory: 'Robux', image: IMG.robux, rating: 4.7, reviews: 9800, sold: 72000, deliveryTime: 'Entrega instantánea', platform: 'Roblox', region: 'Global', tags: ['popular', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 'g3', name: 'Pase de Batalla - Temporada Actual', description: '100 niveles de premios exclusivos durante toda la temporada.', price: 5.99, originalPrice: 9.99, category: 'gaming', subcategory: 'Pases de Batalla', image: IMG.vbucks, rating: 4.6, reviews: 5600, sold: 45000, deliveryTime: 'Entrega instantánea', platform: 'Multi-plataforma', region: 'Global', tags: ['tendencia'], stock: 999, featured: true,
  },
  {
    id: 'g4', name: '2800 Monedas FIFA/EA FC', description: 'Monedas para FIFA / EA FC Ultimate Team. Construye tu equipo soñado.', price: 9.99, originalPrice: 24.99, category: 'gaming', subcategory: 'Monedas', image: IMG.valorant, rating: 4.5, reviews: 3400, sold: 28000, deliveryTime: '5-30 minutos', platform: 'EA FC 25', region: 'Global', tags: ['oferta'], stock: 500, featured: false,
  },
  {
    id: 'g5', name: 'Skin Legendaria - Valorant', description: 'Skin premium con efectos especiales y animación única.', price: 7.99, originalPrice: 19.99, category: 'gaming', subcategory: 'Skins', image: IMG.valorant, rating: 4.9, reviews: 2100, sold: 15000, deliveryTime: 'Entrega instantánea', platform: 'Valorant', region: 'Global', tags: ['premium'], stock: 200, featured: true,
  },
  {
    id: 'g6', name: 'Cuenta Premium Minecraft', description: 'Cuenta premium de Minecraft Java Edition con acceso completo.', price: 4.99, originalPrice: 26.95, category: 'gaming', subcategory: 'Cuentas', image: IMG.minecraft, rating: 4.4, reviews: 7800, sold: 62000, deliveryTime: '1-24 horas', platform: 'Minecraft', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 150, featured: false,
  },
  {
    id: 'g7', name: 'RP League of Legends - 1380', description: 'Riot Points para League of Legends. Compra campeones y skins.', price: 5.49, originalPrice: 9.99, category: 'gaming', subcategory: 'Monedas', image: IMG.valorant, rating: 4.6, reviews: 4200, sold: 35000, deliveryTime: 'Entrega instantánea', platform: 'League of Legends', region: 'Global', tags: ['popular'], stock: 999, featured: false,
  },
  {
    id: 'g8', name: 'Genesis Crystal Pack - Genshin Impact', description: 'Paquete de cristales genesis. Obtén personajes y armas.', price: 7.99, originalPrice: 19.99, category: 'gaming', subcategory: 'Monedas', image: IMG.genshin, rating: 4.8, reviews: 6100, sold: 48000, deliveryTime: 'Entrega instantánea', platform: 'Genshin Impact', region: 'Global', tags: ['oferta', 'tendencia'], stock: 999, featured: true,
  },
  // STREAMING - Precios de reventa reales ($3-5 por cuenta)
  {
    id: 's1', name: 'Netflix Premium - 1 Mes', description: 'Cuenta premium Netflix. Calidad 4K, 4 pantallas simultáneas y sin anuncios.', price: 3.99, originalPrice: 22.99, category: 'streaming', subcategory: 'Netflix', image: IMG.netflix, rating: 4.7, reviews: 15200, sold: 120000, deliveryTime: 'Entrega instantánea', platform: 'Netflix', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 's2', name: 'Spotify Premium - 3 Meses', description: '3 meses de Spotify Premium. Sin anuncios, descarga ilimitada.', price: 4.99, originalPrice: 14.97, category: 'streaming', subcategory: 'Spotify', image: IMG.spotify, rating: 4.8, reviews: 18900, sold: 195000, deliveryTime: 'Entrega instantánea', platform: 'Spotify', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 's3', name: 'Disney+ Premium - 1 Mes', description: 'Contenido de Marvel, Star Wars, Pixar y más. Calidad 4K UHD.', price: 3.49, originalPrice: 13.99, category: 'streaming', subcategory: 'Disney+', image: IMG.disney, rating: 4.6, reviews: 8900, sold: 67000, deliveryTime: 'Entrega instantánea', platform: 'Disney+', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 's4', name: 'Crunchyroll Premium - 1 Mes', description: 'Anime sin anuncios, todos los títulos y estrenos simultáneos con Japón.', price: 2.99, originalPrice: 9.99, category: 'streaming', subcategory: 'Crunchyroll', image: IMG.crunchyroll, rating: 4.5, reviews: 5400, sold: 38000, deliveryTime: 'Entrega instantánea', platform: 'Crunchyroll', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 's5', name: 'HBO Max - 1 Mes', description: 'Todas las series de HBO, películas de Warner Bros y contenido exclusivo.', price: 3.49, originalPrice: 15.49, category: 'streaming', subcategory: 'HBO Max', image: IMG.hbo, rating: 4.5, reviews: 6200, sold: 42000, deliveryTime: 'Entrega instantánea', platform: 'HBO Max', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  // GIFT CARDS - Margen bajo pero volumen alto
  {
    id: 'gc1', name: 'Tarjeta Steam - $50 USD', description: 'Gift card Steam. Compra juegos, DLC y más en la tienda.', price: 46.99, originalPrice: 50.00, category: 'giftcards', subcategory: 'Steam', image: IMG.steam, rating: 4.9, reviews: 22000, sold: 185000, deliveryTime: 'Entrega instantánea', platform: 'Steam', region: 'Global', tags: ['mas vendido'], stock: 999, featured: true,
  },
  {
    id: 'gc2', name: 'Tarjeta PlayStation - $25 USD', description: 'Gift card PlayStation Store para PS4/PS5.', price: 23.49, originalPrice: 25.00, category: 'giftcards', subcategory: 'PlayStation', image: IMG.ps, rating: 4.8, reviews: 16500, sold: 142000, deliveryTime: 'Entrega instantánea', platform: 'PlayStation', region: 'Americas', tags: ['popular'], stock: 999, featured: false,
  },
  {
    id: 'gc3', name: 'Tarjeta Xbox - $50 USD', description: 'Gift card Xbox para Xbox Store y Game Pass.', price: 45.99, originalPrice: 50.00, category: 'giftcards', subcategory: 'Xbox', image: IMG.xbox, rating: 4.7, reviews: 9800, sold: 78000, deliveryTime: 'Entrega instantánea', platform: 'Xbox', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'gc4', name: 'Tarjeta Google Play - $25 USD', description: 'Gift card Google Play para apps, juegos y películas.', price: 23.49, originalPrice: 25.00, category: 'giftcards', subcategory: 'Google Play', image: IMG.steam, rating: 4.6, reviews: 11200, sold: 95000, deliveryTime: 'Entrega instantánea', platform: 'Google Play', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'gc5', name: 'Tarjeta Nintendo eShop - $35 USD', description: 'Gift card Nintendo eShop para juegos de Switch.', price: 32.49, originalPrice: 35.00, category: 'giftcards', subcategory: 'Nintendo', image: IMG.steam, rating: 4.8, reviews: 7600, sold: 54000, deliveryTime: 'Entrega instantánea', platform: 'Nintendo', region: 'Americas', tags: ['oferta'], stock: 500, featured: false,
  },
  // SOFTWARE - Mejor margen (costo $2-5, venta $8-15)
  {
    id: 'sw1', name: 'Licencia Windows 11 Pro - Clave Digital', description: 'Licencia original Windows 11 Pro. Clave 32/64 bits, activación online.', price: 8.99, originalPrice: 199.99, category: 'software', subcategory: 'Licencias Windows', image: IMG.win11, rating: 4.7, reviews: 28500, sold: 245000, deliveryTime: 'Entrega instantánea', platform: 'Windows', region: 'Global', tags: ['mas vendido', 'oferta', 'mejor margen'], stock: 999, featured: true,
  },
  {
    id: 'sw2', name: 'Microsoft Office 2024 - Clave Digital', description: 'Office 2024 completo: Word, Excel, PowerPoint, Outlook. Licencia perpetua.', price: 12.49, originalPrice: 249.99, category: 'software', subcategory: 'Office', image: IMG.office, rating: 4.6, reviews: 19800, sold: 178000, deliveryTime: 'Entrega instantánea', platform: 'Microsoft', region: 'Global', tags: ['mas vendido', 'oferta', 'mejor margen'], stock: 999, featured: true,
  },
  {
    id: 'sw3', name: 'VPN Premium - Suscripción 2 Años', description: 'Suscripción VPN 2 años. 5500+ servidores en 60 países, sin registros.', price: 29.99, originalPrice: 286.56, category: 'software', subcategory: 'VPN', image: IMG.vpn, rating: 4.8, reviews: 14200, sold: 98000, deliveryTime: 'Entrega instantánea', platform: 'VPN', region: 'Global', tags: ['oferta', 'mejor margen'], stock: 999, featured: false,
  },
  // SUBSCRIPTIONS
  {
    id: 'sub1', name: 'YouTube Premium - 3 Meses', description: 'Sin anuncios, descarga de videos, YouTube Music incluido.', price: 5.99, originalPrice: 17.97, category: 'subscriptions', subcategory: 'YouTube Premium', image: IMG.yt, rating: 4.7, reviews: 13600, sold: 112000, deliveryTime: 'Entrega instantánea', platform: 'YouTube', region: 'Global', tags: ['popular', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 'sub2', name: 'Discord Nitro - 3 Meses', description: 'Emojis personalizados, stickers de cualquier servidor, mejor calidad.', price: 6.99, originalPrice: 29.97, category: 'subscriptions', subcategory: 'Discord Nitro', image: IMG.discord, rating: 4.8, reviews: 8900, sold: 68000, deliveryTime: 'Entrega instantánea', platform: 'Discord', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'sub3', name: 'Xbox Game Pass Ultimate - 1 Mes', description: 'Cientos de juegos para consola, PC y cloud. Incluye EA Play.', price: 4.99, originalPrice: 16.99, category: 'subscriptions', subcategory: 'Cloud Gaming', image: IMG.gamepass, rating: 4.9, reviews: 16400, sold: 135000, deliveryTime: 'Entrega instantánea', platform: 'Xbox', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: true,
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
