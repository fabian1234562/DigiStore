'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  ShoppingCart, LogIn, Menu, X, Gamepad2, Zap, Gift, Tag, BookOpen, Download,
} from 'lucide-react';

/**
 * Premium responsive header compartido entre /tienda y /juegos-gratis
 *
 * Características:
 * - Glass effect al hacer scroll
 * - Mobile drawer premium con animaciones
 * - Logo con gradiente y glow
 * - Nav desktop con badges
 * - Tap targets mobile mínimos 44px
 * - Bloqueo de scroll cuando drawer abierto
 * - Cierre con Escape o tap fuera
 *
 * Items del menu (orden fijo):
 * 1. Inicio (violet)
 * 2. Juegos Gratis (emerald) - F2P
 * 3. Libros (amber) - clasicos de dominio publico
 * 4. Apps Open Source (blue) - software libre
 * 5. Tienda (rose/amber) - productos pagos $1-$5
 */

interface SharedHeaderProps {
  /** 'home' resalta Inicio, 'free' resalta Juegos Gratis, 'books' resalta Libros, 'apps' resalta Apps Open Source, 'store' resalta Tienda */
  activePage?: 'home' | 'free' | 'books' | 'apps' | 'store';
}

export function SharedHeader({ activePage = 'home' }: SharedHeaderProps) {
  const { setCartOpen, setAuthOpen, cartCount } = useStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  // Cerrar menu mobile con Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenu(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Bloquear scroll del body cuando menu mobile esta abierto
  useEffect(() => {
    if (mobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenu]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass shadow-premium border-b border-violet-100/50'
            : 'bg-white border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          {/* Lado izquierdo: Menu mobile + Logo */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-violet-50 transition-colors"
              onClick={() => setMobileMenu(true)}
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-105 group-hover:rotate-3 transition-transform"
              >
                <Gamepad2 className="text-white" style={{ width: '20px', height: '20px' }} />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold leading-none text-gradient-violet">
                  DigiStore
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium leading-none mt-0.5 hidden sm:block">
                  Productos Digitales
                </span>
              </div>
            </Link>
          </div>

          {/* Centro: Nav desktop con 5 items */}
          <nav className="hidden lg:flex items-center gap-0.5 text-sm font-medium">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                activePage === 'home'
                  ? 'text-violet-700 bg-violet-50 font-semibold'
                  : 'text-gray-700 hover:text-violet-700 hover:bg-violet-50'
              }`}
            >
              Inicio
            </Link>
            <Link
              href="/juegos-gratis?tab=juegos"
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activePage === 'free'
                  ? 'text-emerald-700 bg-emerald-50 font-semibold'
                  : 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Juegos
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">F2P</span>
            </Link>
            <Link
              href="/libros"
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activePage === 'books'
                  ? 'text-amber-700 bg-amber-50 font-semibold'
                  : 'text-gray-700 hover:text-amber-700 hover:bg-amber-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Libros
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">37</span>
            </Link>
            <Link
              href="/apps-open-source"
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activePage === 'apps'
                  ? 'text-blue-700 bg-blue-50 font-semibold'
                  : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Apps
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">33</span>
            </Link>
            <Link
              href="/tienda"
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                activePage === 'store'
                  ? 'text-rose-700 bg-rose-50 font-semibold'
                  : 'text-gray-700 hover:text-rose-700 hover:bg-rose-50'
              }`}
            >
              Tienda
              <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">$1+</span>
            </Link>
          </nav>

          {/* Lado derecho: Cart + Auth */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              className="relative p-2.5 rounded-xl hover:bg-violet-50 transition-colors group"
              onClick={() => setCartOpen(true)}
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-violet-700 transition-colors" />
              {cartCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-fade-in">
                  {cartCount()}
                </span>
              )}
            </button>
            <button
              className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
              onClick={() => setAuthOpen(true)}
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
            <button
              className="sm:hidden p-2.5 rounded-xl hover:bg-violet-50 transition-colors"
              onClick={() => setAuthOpen(true)}
              aria-label="Iniciar sesion"
            >
              <LogIn className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Mobile menu overlay (drawer premium) ═══ */}
      {mobileMenu && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenu(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-white shadow-premium-lg flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-extrabold text-gradient-violet">DigiStore</span>
              </div>
              <button
                onClick={() => setMobileMenu(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <Link
                href="/"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                  activePage === 'home'
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-700 hover:bg-violet-50 hover:text-violet-700'
                }`}
                onClick={() => setMobileMenu(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-600" />
                </div>
                Inicio
              </Link>
              <Link
                href="/juegos-gratis?tab=juegos"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                  activePage === 'free'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
                onClick={() => setMobileMenu(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-emerald-600" />
                </div>
                Juegos Gratis
                <span className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  F2P
                </span>
              </Link>
              <Link
                href="/libros"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                  activePage === 'books'
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                }`}
                onClick={() => setMobileMenu(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                </div>
                Libros Clásicos
                <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  37
                </span>
              </Link>
              <Link
                href="/apps-open-source"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                  activePage === 'apps'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
                onClick={() => setMobileMenu(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Download className="w-4 h-4 text-blue-600" />
                </div>
                Apps Open Source
                <span className="ml-auto bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  33
                </span>
              </Link>
              <Link
                href="/tienda"
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                  activePage === 'store'
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-gray-700 hover:bg-rose-50 hover:text-rose-700'
                }`}
                onClick={() => setMobileMenu(false)}
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-rose-600" />
                </div>
                Tienda
                <span className="ml-auto bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  $1+
                </span>
              </Link>
            </nav>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setMobileMenu(false);
                  setAuthOpen(true);
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md"
              >
                <LogIn className="w-4 h-4" /> Entrar / Registrarse
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SharedHeader;
