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
  searchQuery: string;
  selectedCategory: string;
  selectedSubcategory: string;
  sortBy: string;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
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

export const PRODUCTS: Product[] = [
  // GAMING
  {
    id: 'g1', name: '1000 V-Bucks - Fortnite', description: 'Moneda virtual para Fortnite. Compra skins, pases de batalla y más en la tienda de Fortnite.', price: 7.99, originalPrice: 9.99, category: 'gaming', subcategory: 'V-Bucks', image: '/products/vbucks.png', rating: 4.8, reviews: 12500, sold: 89000, deliveryTime: 'Entrega instantánea', platform: 'Fortnite', region: 'Global', tags: ['popular', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 'g2', name: '800 Robux - Roblox', description: 'Robux para Roblox. Personaliza tu avatar, compra game passes y accede a contenido premium.', price: 6.99, originalPrice: 9.99, category: 'gaming', subcategory: 'Robux', image: '/products/robux.png', rating: 4.7, reviews: 9800, sold: 72000, deliveryTime: 'Entrega instantánea', platform: 'Roblox', region: 'Global', tags: ['popular', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 'g3', name: 'Pase de Batalla - Temporada Actual', description: 'Desbloquea recompensas exclusivas durante toda la temporada. Incluye 100 niveles de premios.', price: 9.99, category: 'gaming', subcategory: 'Pases de Batalla', image: '/products/battlepass.png', rating: 4.6, reviews: 5600, sold: 45000, deliveryTime: 'Entrega instantánea', platform: 'Multi-plataforma', region: 'Global', tags: ['tendencia'], stock: 999, featured: true,
  },
  {
    id: 'g4', name: '2800 Monedas FIFA/EA FC', description: 'Monedas para FIFA / EA FC Ultimate Team. Construye tu equipo soñado con los mejores jugadores.', price: 19.99, originalPrice: 24.99, category: 'gaming', subcategory: 'Monedas', image: '/products/fifacoins.png', rating: 4.5, reviews: 3400, sold: 28000, deliveryTime: '5-30 minutos', platform: 'EA FC 25', region: 'Global', tags: ['oferta'], stock: 500, featured: false,
  },
  {
    id: 'g5', name: 'Skin Legendaria - Valorant', description: 'Skin premium para Valorant. Diseño exclusivo con efectos especiales de disparo y animación única.', price: 14.99, category: 'gaming', subcategory: 'Skins', image: '/products/valskin.png', rating: 4.9, reviews: 2100, sold: 15000, deliveryTime: 'Entrega instantánea', platform: 'Valorant', region: 'Global', tags: ['premium'], stock: 200, featured: true,
  },
  {
    id: 'g6', name: 'Cuenta Premium Minecraft', description: 'Cuenta premium de Minecraft Java Edition con acceso completo a todos los servidores y skins.', price: 12.99, originalPrice: 26.95, category: 'gaming', subcategory: 'Cuentas', image: '/products/minecraft.png', rating: 4.4, reviews: 7800, sold: 62000, deliveryTime: '1-24 horas', platform: 'Minecraft', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 150, featured: false,
  },
  {
    id: 'g7', name: 'RP League of Legends - 1380', description: 'Riot Points para League of Legends. Compra campeones, skins y chromas en la tienda.', price: 9.99, category: 'gaming', subcategory: 'Monedas', image: '/products/lolrp.png', rating: 4.6, reviews: 4200, sold: 35000, deliveryTime: 'Entrega instantánea', platform: 'League of Legends', region: 'Global', tags: ['popular'], stock: 999, featured: false,
  },
  {
    id: 'g8', name: 'Genesis Crystal Pack - Genshin Impact', description: 'Paquete de cristales genesis para Genshin Impact. Usa para deseos y obtener personajes y armas.', price: 14.99, originalPrice: 19.99, category: 'gaming', subcategory: 'Monedas', image: '/products/genshin.png', rating: 4.8, reviews: 6100, sold: 48000, deliveryTime: 'Entrega instantánea', platform: 'Genshin Impact', region: 'Global', tags: ['oferta', 'tendencia'], stock: 999, featured: true,
  },
  // STREAMING
  {
    id: 's1', name: 'Netflix Premium - 1 Mes', description: 'Suscripción premium de Netflix por 1 mes. Calidad 4K, 4 pantallas simultáneas y sin anuncios.', price: 8.99, originalPrice: 22.99, category: 'streaming', subcategory: 'Netflix', image: '/products/netflix.png', rating: 4.7, reviews: 15200, sold: 120000, deliveryTime: 'Entrega instantánea', platform: 'Netflix', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 's2', name: 'Spotify Premium - 3 Meses', description: '3 meses de Spotify Premium. Sin anuncios, descarga ilimitada y calidad de audio superior.', price: 9.99, originalPrice: 14.97, category: 'streaming', subcategory: 'Spotify', image: '/products/spotify.png', rating: 4.8, reviews: 18900, sold: 195000, deliveryTime: 'Entrega instantánea', platform: 'Spotify', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 's3', name: 'Disney+ Premium - 1 Mes', description: 'Suscripción Disney+ con contenido de Marvel, Star Wars, Pixar y más. Calidad 4K UHD.', price: 6.99, originalPrice: 13.99, category: 'streaming', subcategory: 'Disney+', image: '/products/disney.png', rating: 4.6, reviews: 8900, sold: 67000, deliveryTime: 'Entrega instantánea', platform: 'Disney+', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 's4', name: 'Crunchyroll Premium - 1 Mes', description: 'Acceso completo a anime en Crunchyroll. Sin anuncios, todos los títulos y estrenos simultáneos con Japón.', price: 4.99, originalPrice: 9.99, category: 'streaming', subcategory: 'Crunchyroll', image: '/products/crunchyroll.png', rating: 4.5, reviews: 5400, sold: 38000, deliveryTime: 'Entrega instantánea', platform: 'Crunchyroll', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 's5', name: 'HBO Max - 1 Mes', description: 'Suscripción HBO Max. Acceso a todas las series de HBO, películas de Warner Bros y contenido exclusivo.', price: 7.99, originalPrice: 15.49, category: 'streaming', subcategory: 'HBO Max', image: '/products/hbo.png', rating: 4.5, reviews: 6200, sold: 42000, deliveryTime: 'Entrega instantánea', platform: 'HBO Max', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  // GIFT CARDS
  {
    id: 'gc1', name: 'Tarjeta Steam - $50 USD', description: 'Tarjeta de regalo de Steam por $50 USD. Canjea en tu cuenta de Steam y compra juegos, DLC y más.', price: 44.99, originalPrice: 50.00, category: 'giftcards', subcategory: 'Steam', image: '/products/steam50.png', rating: 4.9, reviews: 22000, sold: 185000, deliveryTime: 'Entrega instantánea', platform: 'Steam', region: 'Global', tags: ['mas vendido'], stock: 999, featured: true,
  },
  {
    id: 'gc2', name: 'Tarjeta PlayStation - $25 USD', description: 'Tarjeta de regalo PlayStation Store. Compra juegos, add-ons y suscripciones para tu PS4/PS5.', price: 21.99, originalPrice: 25.00, category: 'giftcards', subcategory: 'PlayStation', image: '/products/ps25.png', rating: 4.8, reviews: 16500, sold: 142000, deliveryTime: 'Entrega instantánea', platform: 'PlayStation', region: 'Americas', tags: ['popular'], stock: 999, featured: false,
  },
  {
    id: 'gc3', name: 'Tarjeta Xbox - $50 USD', description: 'Gift card de Xbox por $50 USD. Válida para Xbox Store, Game Pass y contenido digital.', price: 43.99, originalPrice: 50.00, category: 'giftcards', subcategory: 'Xbox', image: '/products/xbox50.png', rating: 4.7, reviews: 9800, sold: 78000, deliveryTime: 'Entrega instantánea', platform: 'Xbox', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'gc4', name: 'Tarjeta Google Play - $25 USD', description: 'Tarjeta de regalo Google Play. Compra apps, juegos, libros y películas en la Play Store.', price: 22.49, originalPrice: 25.00, category: 'giftcards', subcategory: 'Google Play', image: '/products/google25.png', rating: 4.6, reviews: 11200, sold: 95000, deliveryTime: 'Entrega instantánea', platform: 'Google Play', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'gc5', name: 'Tarjeta Nintendo eShop - $35 USD', description: 'Tarjeta de regalo Nintendo eShop. Compra juegos de Switch, DLC y contenido digital de Nintendo.', price: 30.99, originalPrice: 35.00, category: 'giftcards', subcategory: 'Nintendo', image: '/products/nintendo35.png', rating: 4.8, reviews: 7600, sold: 54000, deliveryTime: 'Entrega instantánea', platform: 'Nintendo', region: 'Americas', tags: ['oferta'], stock: 500, featured: false,
  },
  // SOFTWARE
  {
    id: 'sw1', name: 'Licencia Windows 11 Pro - Clave Digital', description: 'Licencia original y activable de Windows 11 Professional. Clave de 32/64 bits, activación online.', price: 14.99, originalPrice: 199.99, category: 'software', subcategory: 'Licencias Windows', image: '/products/win11.png', rating: 4.7, reviews: 28500, sold: 245000, deliveryTime: 'Entrega instantánea', platform: 'Windows', region: 'Global', tags: ['mas vendido', 'oferta', 'mejor margen'], stock: 999, featured: true,
  },
  {
    id: 'sw2', name: 'Microsoft Office 2024 - Clave Digital', description: 'Paquete completo de Office 2024: Word, Excel, PowerPoint, Outlook. Licencia perpetua para 1 PC.', price: 19.99, originalPrice: 249.99, category: 'software', subcategory: 'Office', image: '/products/office.png', rating: 4.6, reviews: 19800, sold: 178000, deliveryTime: 'Entrega instantánea', platform: 'Microsoft', region: 'Global', tags: ['mas vendido', 'oferta', 'mejor margen'], stock: 999, featured: true,
  },
  {
    id: 'sw3', name: 'NordVPN - Suscripción 2 Años', description: 'Suscripción premium de NordVPN por 2 años. Más de 5500 servidores en 60 países, sin registros.', price: 59.99, originalPrice: 286.56, category: 'software', subcategory: 'VPN', image: '/products/nordvpn.png', rating: 4.8, reviews: 14200, sold: 98000, deliveryTime: 'Entrega instantánea', platform: 'NordVPN', region: 'Global', tags: ['oferta', 'mejor margen'], stock: 999, featured: false,
  },
  // SUBSCRIPTIONS
  {
    id: 'sub1', name: 'YouTube Premium - 3 Meses', description: '3 meses de YouTube Premium. Sin anuncios, descarga de videos, YouTube Music incluido y reproducción en segundo plano.', price: 11.99, originalPrice: 17.97, category: 'subscriptions', subcategory: 'YouTube Premium', image: '/products/ytpremium.png', rating: 4.7, reviews: 13600, sold: 112000, deliveryTime: 'Entrega instantánea', platform: 'YouTube', region: 'Global', tags: ['popular', 'oferta'], stock: 999, featured: true,
  },
  {
    id: 'sub2', name: 'Discord Nitro - 3 Meses', description: '3 meses de Discord Nitro. Emojis personalizados, uso de stickers de cualquier servidor, mejor calidad de stream y más.', price: 14.99, originalPrice: 29.97, category: 'subscriptions', subcategory: 'Discord Nitro', image: '/products/discord.png', rating: 4.8, reviews: 8900, sold: 68000, deliveryTime: 'Entrega instantánea', platform: 'Discord', region: 'Global', tags: ['oferta'], stock: 999, featured: false,
  },
  {
    id: 'sub3', name: 'Xbox Game Pass Ultimate - 1 Mes', description: 'Acceso a cientos de juegos de alta calidad para consola, PC y cloud. Incluye EA Play.', price: 8.99, originalPrice: 16.99, category: 'subscriptions', subcategory: 'Cloud Gaming', image: '/products/gamepass.png', rating: 4.9, reviews: 16400, sold: 135000, deliveryTime: 'Entrega instantánea', platform: 'Xbox', region: 'Global', tags: ['mas vendido', 'oferta'], stock: 999, featured: true,
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
    { product: 'Licencias Windows/Office', cost: '$2-5', sellPrice: '$15-25', margin: '80-92%', reason: 'Demanda masiva global, costo de adquisición extremadamente bajo' },
    { product: 'Suscripciones Netflix/Spotify', cost: '$1-3', sellPrice: '$7-12', margin: '70-85%', reason: 'Alta rotación, los usuarios renuevan mensualmente' },
    { product: 'V-Bucks / Robux', cost: '$3-5', sellPrice: '$7-12', margin: '50-65%', reason: 'Mercado infantil/juvenil enorme, compra impulsiva frecuente' },
    { product: 'Gift Cards Steam/PlayStation', cost: '$42-46', sellPrice: '$45-50', margin: '5-15%', reason: 'Volumen altísimo, confianza del consumidor, regalo ideal' },
    { product: 'Discord Nitro / YT Premium', cost: '$4-7', sellPrice: '$10-18', margin: '55-65%', reason: 'Crecimiento explosivo en comunidad gamer' },
    { product: 'Cuentas Minecraft Premium', cost: '$3-5', sellPrice: '$10-15', margin: '65-80%', reason: 'Uno de los juegos más vendidos de la historia' },
    { product: 'VPN Suscripciones', cost: '$15-25', sellPrice: '$40-70', margin: '50-65%', reason: 'Demanda creciente por privacidad y acceso geo-restringido' },
  ],
};
