import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/reloadly';
import { getPricingSummary, usdToCop, formatPriceUSD, formatPriceCOP, USD_TO_COP, PRICING_EXAMPLES } from '@/lib/pricing';
import { PRODUCT_MAP } from '@/lib/reloadly';

/**
 * API DE PRECIOS DEL PROVEEDOR - MODELO DE REVENTA
 * 
 * Consulta los costos REALES de Reloadly y calcula:
 * - A qué precio vender (siempre ≤ valor facial)
 * - Cuánto ganas por venta (en USD y COP)
 * - El descuento que le das al cliente vs mercado
 * 
 * GET /api/supplier/prices?all=true       → Sincronizar todos los productos
 * GET /api/supplier/prices?productId=gc17  → Ver un producto específico
 * GET /api/supplier/prices?category=gaming → Ver por categoría
 * GET /api/supplier/prices?examples=true   → Ver ejemplos del modelo
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const productId = url.searchParams.get('productId');
    const syncAll = url.searchParams.get('all') === 'true';
    const showExamples = url.searchParams.get('examples') === 'true';

    // Mostrar ejemplos del modelo de reventa
    if (showExamples) {
      return NextResponse.json({
        success: true,
        model: 'REVENTA: Compras barato al proveedor, vendes al precio de mercado',
        tasaCambio: { usd: 1, cop: USD_TO_COP },
        examples: PRICING_EXAMPLES.map(ex => ({
          producto: ex.product,
          valorFacial: formatPriceUSD(ex.faceValue) + ` (${formatPriceCOP(usdToCop(ex.faceValue))})`,
          pagasAlProveedor: formatPriceUSD(ex.supplierCost) + ` (${formatPriceCOP(usdToCop(ex.supplierCost))})`,
          vendesA: formatPriceUSD(ex.sellPrice) + ` (${formatPriceCOP(usdToCop(ex.sellPrice))})`,
          gananciaPorUnidad: formatPriceUSD(ex.profit) + ` (${formatPriceCOP(ex.profitCOP)})`,
          margen: `${ex.margin}%`,
          descuentoProveedor: `${ex.supplierDiscount}%`,
          descuentoAlCliente: formatPriceUSD(ex.faceValue - ex.sellPrice),
        })),
      });
    }

    // Verificar que Reloadly está configurado
    if (!process.env.RELOADLY_CLIENT_ID || !process.env.RELOADLY_CLIENT_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'supplier_not_configured',
        message: 'Configura RELOADLY_CLIENT_ID y RELOADLY_CLIENT_SECRET en .env.local',
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

      const pricing = getPricingSummary(match.price, mapping.faceValue);

      return NextResponse.json({
        success: true,
        productId,
        producto: mapping.reloadlyBrand + ' $' + mapping.faceValue + ' USD',
        supplier: {
          name: mapping.reloadlyBrand,
          faceValue: mapping.faceValue,
          costPrice: match.price,
          costPriceCOP: usdToCop(match.price),
          discountPercentage: match.discountPercentage,
          supplierProductId: match.productId,
        },
        pricing: {
          vendesA: pricing.sellPrice,
          vendesACOP: pricing.sellPriceCOP,
          valorFacial: pricing.faceValue,
          valorFacialCOP: pricing.faceValueCOP,
          gananciaUSD: pricing.profit,
          gananciaCOP: pricing.profitCOP,
          margen: pricing.margin + '%',
          descuentoAlCliente: formatPriceUSD(pricing.customerSavings) + ` (${formatPriceCOP(pricing.customerSavingsCOP)})`,
        },
      });
    }

    // Sincronizar todos los productos
    if (syncAll) {
      const results: any[] = [];
      const uniqueBrands = new Map<string, { brand: string; country: string; ids: string[] }>();

      for (const [id, mapping] of Object.entries(PRODUCT_MAP)) {
        const key = `${mapping.reloadlyBrand}-${mapping.countryIso}`;
        if (!uniqueBrands.has(key)) {
          uniqueBrands.set(key, { brand: mapping.reloadlyBrand, country: mapping.countryIso, ids: [] });
        }
        uniqueBrands.get(key)!.ids.push(id);
      }

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
              const pricing = getPricingSummary(match.price, mapping.faceValue);
              results.push({
                productId: id,
                producto: mapping.reloadlyBrand + ' $' + mapping.faceValue,
                valorFacial: mapping.faceValue,
                pagasAlProveedor: match.price,
                vendesA: pricing.sellPrice,
                gananciaUSD: pricing.profit,
                gananciaCOP: pricing.profitCOP,
                margen: pricing.margin,
                descuentoProveedor: match.discountPercentage,
                disponible: true,
              });
            } else {
              results.push({
                productId: id,
                producto: mapping.reloadlyBrand + ' $' + mapping.faceValue,
                valorFacial: mapping.faceValue,
                disponible: false,
              });
            }
          }
        } catch (err: any) {
          for (const id of group.ids) {
            results.push({
              productId: id,
              producto: group.brand,
              error: err.message,
              disponible: false,
            });
          }
        }
      }

      const available = results.filter(r => r.disponible);
      const totalProfitPerSale = available.reduce((sum, r) => sum + r.gananciaUSD, 0);
      const totalProfitCOP = available.reduce((sum, r) => sum + r.gananciaCOP, 0);
      const bestProducts = [...available].sort((a, b) => b.gananciaCOP - a.gananciaCOP).slice(0, 10);

      return NextResponse.json({
        success: true,
        modelo: 'REVENTA - Compras barato, vendes a precio de mercado',
        tasaCambio: `1 USD = ${USD_TO_COP} COP`,
        resumen: {
          totalProductos: results.length,
          disponibles: available.length,
          noDisponibles: results.length - available.length,
          gananciaTotalPorVentaTodos: '$' + Math.round(totalProfitPerSale * 100) / 100 + ' USD',
          gananciaTotalCOP: '$' + totalProfitCOP.toLocaleString('es-CO') + ' COP',
          mejorMargen: bestProducts,
        },
        productos: results,
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
              const pricing = getPricingSummary(match.price, mapping.faceValue);
              results.push({
                productId: id,
                producto: brand + ' $' + mapping.faceValue,
                valorFacial: mapping.faceValue,
                pagasAlProveedor: match.price,
                vendesA: pricing.sellPrice,
                gananciaUSD: pricing.profit,
                gananciaCOP: pricing.profitCOP,
                margen: pricing.margin,
                disponible: true,
              });
            }
          }
        } catch {
          // Skip failed brand queries
        }
      }

      return NextResponse.json({ success: true, category, productos: results });
    }

    return NextResponse.json({
      success: true,
      message: 'Usa ?all=true, ?productId=gc17, ?category=gaming, o ?examples=true',
      productosMapeados: Object.keys(PRODUCT_MAP).length,
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