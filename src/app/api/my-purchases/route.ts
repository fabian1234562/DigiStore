import { NextResponse } from 'next/server';
import { db, isDbAvailable } from '@/lib/db';

/**
 * GET /api/my-purchases?email=cliente@email.com
 *
 * Lista todas las compras confirmadas del usuario (por email).
 *
 * Devuelve items con:
 *   - Para FILE: delivery_token + file_name + file_size + downloads_count
 *   - Para KEY: license_key + activation_instructions
 *   - Para OFFICIAL_ACCESS: official_url + access_instructions
 *
 * Solo devuelve órdenes con status=paid o completed.
 * NO devuelve claves de órdenes pendientes o fallidas.
 */

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'invalid_email', message: 'Email requerido' },
      { status: 400 },
    );
  }

  // Si no hay DB, no hay compras que mostrar
  if (!isDbAvailable()) {
    return NextResponse.json({ items: [], message: 'No hay DB configurada' });
  }

  try {
    // Buscar órdenes pagadas del usuario
    const orders = await db.order.findMany({
      where: {
        email: email.toLowerCase(),
        status: { in: ['paid', 'completed'] },
      },
      include: {
        order_items: {
          include: {
            license_key: true,
            delivery: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items: any[] = [];

    for (const order of orders) {
      for (const item of order.order_items) {
        // Buscar el producto para obtener info adicional
        const product = await db.product.findUnique({
          where: { id: item.product_id },
        });

        const purchaseItem: any = {
          order_id: order.id,
          order_status: order.status,
          product_id: item.product_id,
          product_name: item.product_name,
          product_slug: item.product_slug,
          delivery_type: item.delivery_type,
          price: item.price,
          quantity: item.quantity,
          status: item.status,
          image: product?.image || null,
          version: product?.version || null,
          purchased_at: order.createdAt.toISOString(),
        };

        // ─── FILE: incluir delivery token ───
        if (item.delivery_type === 'FILE' && item.delivery) {
          purchaseItem.delivery_token = item.delivery.token;
          purchaseItem.file_name = item.delivery.product?.file_name || product?.file_name;
          purchaseItem.file_size = product?.file_size || 0;
          purchaseItem.sha256 = product?.sha256;
          purchaseItem.expires_at = item.delivery.expires_at.toISOString();
          purchaseItem.downloads_count = item.delivery.downloads_count;
          purchaseItem.max_downloads = item.delivery.max_downloads;
        }

        // ─── KEY: incluir la clave ───
        if (item.delivery_type === 'KEY' && item.license_key) {
          purchaseItem.license_key = item.license_key.license_key;
          purchaseItem.activation_instructions = item.license_key.activation_instructions;
          purchaseItem.platform = item.license_key.platform;
        }

        // ─── OFFICIAL_ACCESS: incluir URL ───
        if (item.delivery_type === 'OFFICIAL_ACCESS') {
          purchaseItem.official_url = product?.official_url || product?.claimUrl;
          purchaseItem.access_instructions = product?.access_instructions;
        }

        items.push(purchaseItem);
      }
    }

    return NextResponse.json({ items, total: items.length });
  } catch (err) {
    console.error('[my-purchases] Error:', err);
    return NextResponse.json(
      { error: 'server_error', message: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
    );
  }
}
