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
