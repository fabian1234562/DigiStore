import { NextResponse } from 'next/server';
import { findBestPrice, getEnabledSuppliers } from '@/lib/suppliers';
import { PRODUCT_MAP } from '@/lib/reloadly';

/**
 * API DE COMPARACIÓN DE PRECIOS EN VIVO
 * 
 * Consulta TODOS los proveedores y muestra quién da el mejor precio.
 * 
 * GET /api/supplier/compare?productId=gc17  → Comparar un producto
 * GET /api/supplier/compare?all=true         → Comparar TODOS
 * GET /api/supplier/compare?status=true       → Ver proveedores activos
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');
  const compareAll = url.searchParams.get('all') === 'true';
  const showStatus = url.searchParams.get('status') === 'true';

  if (showStatus) {
    const enabled = getEnabledSuppliers();
    return NextResponse.json({
      success: true,
      suppliers: enabled,
      total: 4,
      configured: enabled.length,
      message: enabled.length === 0
        ? 'No hay proveedores configurados. Agrega credenciales en .env.local'
        : `${enabled.length} proveedor(es) activo(s). Más proveedores = mejor precio.`,
    });
  }

  if (compareAll) {
    const results: any[] = [];
    const searched = new Set<string>();

    for (const [id, mapping] of Object.entries(PRODUCT_MAP)) {
      const key = `${mapping.reloadlyBrand}-${mapping.faceValue}`;
      if (searched.has(key)) continue;
      searched.add(key);

      try {
        const best = await findBestPrice({
          brand: mapping.reloadlyBrand,
          faceValue: mapping.faceValue,
          country: mapping.countryIso,
          category: '',
        });

        for (const pid of Object.keys(PRODUCT_MAP).filter(pid => {
          const m = PRODUCT_MAP[pid];
          return m.reloadlyBrand === mapping.reloadlyBrand && m.faceValue === mapping.faceValue;
        })) {
          results.push({
            productId: pid,
            producto: mapping.reloadlyBrand + ' $' + mapping.faceValue,
            proveedorElegido: best.cheapest?.supplierId || 'ninguno',
            nombreProveedor: best.cheapest?.supplierId ? {
              reloadly: 'Reloadly',
              foxreload: 'FoxReload',
              fazercards: 'FazerCards',
              xsolla: 'Xsolla',
            }[best.cheapest.supplierId] : 'N/A',
            costoProveedor: best.cheapest?.costPrice || 0,
            valorFacial: mapping.faceValue,
            gananciaUSD: best.cheapest ? Math.round((mapping.faceValue - best.cheapest.costPrice) * 100) / 100 : 0,
            gananciaCOP: best.estimatedProfitCOP,
            descuento: best.cheapest?.discountPercent || 0,
            ahorroVsReloadly: best.savingsVsReloadly,
            ofertasRecibidas: best.allOffers.length,
            disponible: !!best.cheapest,
          });
        }
      } catch {
        results.push({
          productId: id,
          producto: mapping.reloadlyBrand + ' $' + mapping.faceValue,
          disponible: false,
          error: 'Error consultando proveedores',
        });
      }
    }

    const disponibles = results.filter(r => r.disponible);
    const gananciaTotal = disponibles.reduce((s: number, r: any) => s + r.gananciaCOP, 0);
    const porProveedor: Record<string, number> = {};
    for (const r of disponibles) {
      const p = r.proveedorElegido || 'none';
      porProveedor[p] = (porProveedor[p] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      resumen: {
        totalProductos: results.length,
        disponibles: disponibles.length,
        gananciaTotalPorVenta: '$' + gananciaTotal.toLocaleString('es-CO') + ' COP',
        proveedoresUsados: porProveedor,
        mejorProducto: [...disponibles].sort((a: any, b: any) => b.gananciaCOP - a.gananciaCOP)[0],
      },
      productos: results,
    });
  }

  if (productId) {
    const mapping = PRODUCT_MAP[productId];
    if (!mapping) {
      return NextResponse.json({ error: 'Producto no mapeado' }, { status: 404 });
    }

    const best = await findBestPrice({
      brand: mapping.reloadlyBrand,
      faceValue: mapping.faceValue,
      country: mapping.countryIso,
      category: '',
    });

    return NextResponse.json({
      success: true,
      producto: mapping.reloadlyBrand + ' $' + mapping.faceValue,
      mejorOferta: best.cheapest ? {
        proveedor: best.cheapest.supplierId,
        nombre: {
          reloadly: 'Reloadly',
          foxreload: 'FoxReload',
          fazercards: 'FazerCards',
          xsolla: 'Xsolla',
        }[best.cheapest.supplierId],
        costo: best.cheapest.costPrice,
        descuento: best.cheapest.discountPercent + '%',
        gananciaUSD: Math.round((mapping.faceValue - best.cheapest.costPrice) * 100) / 100,
        gananciaCOP: best.estimatedProfitCOP,
      } : null,
      todasLasOfertas: best.allOffers.map(o => ({
        proveedor: o.supplierId,
        nombre: {
          reloadly: 'Reloadly',
          foxreload: 'FoxReload',
          fazercards: 'FazerCards',
          xsolla: 'Xsolla',
        }[o.supplierId],
        costo: o.costPrice,
        descuento: o.discountPercent + '%',
        gananciaSiVendesAFacial: '$' + Math.round((mapping.faceValue - o.costPrice) * 3990).toLocaleString('es-CO') + ' COP',
      })),
      ahorroVsReloadly: best.savingsVsReloadly > 0
        ? `Ganas $${best.savingsVsReloadly} USD MÁS usando ${best.cheapest?.supplierId} en vez de Reloadly`
        : 'Reloadly ya es el más barato para este producto',
    });
  }

  return NextResponse.json({
    success: true,
    message: 'Usa ?productId=gc17, ?all=true, o ?status=true',
  });
}
