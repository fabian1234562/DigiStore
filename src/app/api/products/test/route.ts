import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * GET /api/products/test
 *
 * Sirve productos de prueba para auditar el flujo de pago.
 * Estos productos existen solo para testing - el pago es simulado
 * (no requiere MercadoPago configurado).
 */

export const dynamic = 'force-static';
export const revalidate = 3600;

export interface TestProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'test';
  subcategory: string;
  price: number;
  originalPrice: number;
  currency: string;
  image: string;
  icon_emoji: string;
  rating: number;
  reviews: number;
  sold: number;
  deliveryType: 'download';
  deliveryFormat: 'zip' | 'html';
  fileName: string;
  fileSize: string;
  deliveryTime: string;
  platform: string;
  region: string;
  tags: string[];
  featured: boolean;
  badge: string;
  features: string[];
  isTestProduct: boolean; // Flag para que el frontend sepa que use /api/payments/demo-create
}

export async function GET() {
  const products: TestProduct[] = [
    {
      id: 'test-premium-snake',
      name: 'Snake Premium',
      tagline: 'Juego HTML5 clásico - Producto de prueba',
      description: 'Juego Snake en HTML5. Producto de prueba para auditar el flujo de compra → pago → entrega → descarga de DigiStore. Si puedes jugar este juego después de pasar por todo el flujo de compra, significa que el sistema de entrega automática funciona correctamente.',
      category: 'test',
      subcategory: 'game',
      price: 0.99,
      originalPrice: 4.99,
      currency: 'USD',
      image: '/images/security/general.jpg',
      icon_emoji: '🐍',
      rating: 5.0,
      reviews: 1,
      sold: 0,
      deliveryType: 'download',
      deliveryFormat: 'zip',
      fileName: 'test-premium-snake.zip',
      fileSize: '4.2 KB',
      deliveryTime: 'Instantáneo (demo)',
      platform: 'Cualquier navegador',
      region: 'Mundial',
      tags: ['test', 'demo', 'juego', 'html5', 'prueba'],
      featured: true,
      badge: 'TEST - FLUJO DE PAGO',
      features: [
        'Juego Snake clásico en HTML5',
        'Funciona en cualquier navegador',
        'Sin dependencias externas',
        'Modo demo: pago simulado (sin MercadoPago)',
        'Ideal para auditar el flujo de compra',
      ],
      isTestProduct: true,
    },
  ];

  return NextResponse.json(
    { success: true, products, total: products.length },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
