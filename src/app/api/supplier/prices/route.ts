import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/reloadly';
import { calculateSellPrice, calculateProfit, calculateMargin, getPricingSummary } from '@/lib/pricing';
import { PRODUCT_MAP } from '@/lib/reloadly';

/**
 * API DE PRECIOS DEL PROVEEDOR
 * 
 * Consulta los precios REALES de Reloadly y calcula
 * el precio de venta con margen de ganancia.
 * 
 * GET /api/supplier/prices?category=gaming
 * GET /api/supplier/prices?productId=gc17
 * GET /api/supplier/prices?all=true  (sincronizar todos)
 * 
 * Retorna el costo del proveedor, precio de venta sugerido,
 * y ganancia estimada por producto.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const productId = url.searchParams.get('productId');
    const syncAll = url.searchParams.get('all') === 'true';

    // Verificar que Reloadly está configurado
    if (!process.env.RELOADLY_CLIENT_ID || !process.env.RELOADLY_CLIENT_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'supplier_not_configured',
        message: 'Configura RELOADLY_CLIENT_ID y RELOADLY_CLIENT_SECRET',
        setupUrl: 'https://www.reloadly.com',
      });
    }

    // Consultar precio de un producto específico
    if (productId) {
      const mapping = PRODUCT_MAP[productId];
      if (!mapping) {
        return NextResponse.json({ error: 'Producto no mapeado al proveedor' }, { status: 404 });
      }

      const products = await searchProducts(mapping.reloadlyBrand, mapping.countryIso);
      const match = products.find((p: any) => {
        const fv = p.displayedFaceValue || p.minRecipientDenomination;
        return Math.abs(fv - mapping.faceValue) < 1;
      });

      if (!match) {
        return NextResponse.json({ error: 'Producto no disponible en el proveedor' }, { status: 404 });
      }

      const categoryForMarkup = getCategoryFromProductId(productId);
      const pricing = getPricingSummary(match.price, categoryForMarkup);

      return NextResponse.json({
        success: true,
        productId,
        supplier: {
          name: mapping.reloadlyBrand,
          faceValue: mapping.faceValue,
          costPrice: match.price,
          currency: match.currencyCode,
          discountPercentage: match.discountPercentage,
          supplierProductId: match.productId,
        },
        pricing,
        recommendation: {
          sellPrice: pricing.sellPrice,
          originalPrice: pricing.originalPrice,
          profitPerUnit: pricing.profit,
          marginPercent: pricing.margin,
        },
      });
    }

    // Sincronizar todos los productos
    if (syncAll) {
      const results: any[] = [];
      const uniqueBrands = new Map<string, { brand: string; country: string; ids: string[] }>();

      // Agrupar por marca para minimizar llamadas API
      for (const [id, mapping] of Object.entries(PRODUCT_MAP)) {
        const key = `${mapping.reloadlyBrand}-${mapping.countryIso}`;
        if (!uniqueBrands.has(key)) {
          uniqueBrands.set(key, { brand: mapping.reloadlyBrand, country: mapping.countryIso, ids: [] });
        }
        uniqueBrands.get(key)!.ids.push(id);
      }

      // Consultar cada marca una vez
      for (const [key, group] of uniqueBrands) {
        try {
          const products = await searchProducts(group.brand, group.country);
          
          for (const id of group.ids) {
            const mapping = PRODUCT_MAP[id];
            const match = products.find((p: any) => {
              const fv = p.displayedFaceValue || p.minRecipientDenomination;
              return Math.abs(fv - mapping.faceValue) < 1;
            });

            if (match) {
              const cat = getCategoryFromProductId(id);
              const pricing = getPricingSummary(match.price, cat);
              results.push({
                productId: id,
                brand: mapping.reloadlyBrand,
                faceValue: mapping.faceValue,
                supplierCost: match.price,
                sellPrice: pricing.sellPrice,
                originalPrice: pricing.originalPrice,
                profit: pricing.profit,
                margin: pricing.margin,
                available: true,
              });
            } else {
              results.push({
                productId: id,
                brand: mapping.reloadlyBrand,
                faceValue: mapping.faceValue,
                available: false,
              });
            }
          }
        } catch (err: any) {
          for (const id of group.ids) {
            results.push({
              productId: id,
              brand: group.brand,
              error: err.message,
              available: false,
            });
          }
        }
      }

      const available = results.filter(r => r.available);
      const totalProfit = available.reduce((sum, r) => sum + r.profit, 0);
      const avgMargin = available.length > 0 
        ? available.reduce((sum, r) => sum + r.margin, 0) / available.length 
        : 0;

      return NextResponse.json({
        success: true,
        summary: {
          total: results.length,
          available: available.length,
          unavailable: results.length - available.length,
          totalPotentialProfit: Math.round(totalProfit * 100) / 100,
          averageMargin: Math.round(avgMargin * 100) / 100,
        },
        products: results,
      });
    }

    // Consultar por categoría
    if (category) {
      const categoryProducts = Object.entries(PRODUCT_MAP).filter(
        ([id]) => getCategoryFromProductId(id) === category
      );

      const results: any[] = [];
      const brands = new Map<string, string[]>();

      for (const [id, mapping] of categoryProducts) {
        const key = `${mapping.reloadlyBrand}-${mapping.countryIso}`;
        if (!brands.has(key)) brands.set(key, []);
        brands.get(key)!.push(id);
      }

      for (const [key, ids] of brands) {
        const [brand, country] = key.split('-');
        try {
          const products = await searchProducts(brand, country);
          for (const id of ids) {
            const mapping = PRODUCT_MAP[id];
            const match = products.find((p: any) => {
              const fv = p.displayedFaceValue || p.minRecipientDenomination;
              return Math.abs(fv - mapping.faceValue) < 1;
            });
            if (match) {
              const pricing = getPricingSummary(match.price, category);
              results.push({
                productId: id,
                brand,
                faceValue: mapping.faceValue,
                supplierCost: match.price,
                sellPrice: pricing.sellPrice,
                profit: pricing.profit,
                margin: pricing.margin,
                available: true,
              });
            }
          }
        } catch {
          // Skip failed brand queries
        }
      }

      return NextResponse.json({ success: true, category, products: results });
    }

    return NextResponse.json({
      success: true,
      message: 'Usa ?category=gaming, ?productId=gc17, o ?all=true',
      mappedProducts: Object.keys(PRODUCT_MAP).length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function getCategoryFromProductId(id: string): string {
  if (id.startsWith('g')) return 'gaming';
  if (id.startsWith('gc')) return 'giftcards';
  if (id.startsWith('s')) return 'streaming';
  if (id.startsWith('sub')) return 'subscriptions';
  if (id.startsWith('sw')) return 'software';
  return 'giftcards';
}