import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

/**
 * POST /api/payments/demo-create
 *
 * Endpoint de PAGO SIMULADO para testing del flujo de compra.
 *
 * NO requiere MercadoPago configurado. Simula el pago aprobado
 * y devuelve inmediatamente un link de entrega con token.
 *
 * El cliente recibe:
 *   - orderId (DG-test-...)
 *   - deliveryUrl (https://digi-store.../api/delivery/[token])
 *   - Ya puede descargar el producto inmediatamente
 *
 * El link de entrega es REAL y funcional - sirve el archivo real.
 * Solo el "pago" es simulado.
 */

declare global {
  // eslint-disable-next-line no-var
  var pendingOrders: Record<string, any> | undefined;
  // eslint-disable-next-line no-var
  var deliveryLinks: Map<string, any> | undefined;
  // eslint-disable-next-line no-var
  var completedOrders: Record<string, any> | undefined;
}

if (!globalThis.pendingOrders) globalThis.pendingOrders = {};
if (!globalThis.deliveryLinks) globalThis.deliveryLinks = new Map();
if (!globalThis.completedOrders) globalThis.completedOrders = {};

const LINK_DURATION_HOURS = 24;
const MAX_DOWNLOADS = 5;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, email } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    // Generar orderId único con prefijo DG-TEST
    const orderId = `DG-TEST-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Crear la orden pendiente (igual que el flujo real)
    const pendingOrder = {
      orderId,
      email,
      items,
      total: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      status: 'pending_payment',
      createdAt: new Date().toISOString(),
    };
    globalThis.pendingOrders[orderId] = pendingOrder;

    // ─── SIMULAR PAGO APROBADO ───
    // En el flujo real, MercadoPago llamaría al webhook aquí.
    // Para el modo demo, lo simulamos inmediatamente:
    const deliveries: any[] = [];
    for (const item of items) {
      if (item.deliveryType === 'download' && item.fileName) {
        // Crear token de entrega
        const token = createHash('sha256')
          .update(`${item.id}-${email}-${Date.now()}-${Math.random()}`)
          .digest('hex')
          .substring(0, 32);

        globalThis.deliveryLinks.set(token, {
          productId: item.id,
          productName: item.name,
          fileName: item.fileName,
          deliveryFormat: item.deliveryFormat || 'zip',
          email,
          createdAt: Date.now(),
          expiresAt: Date.now() + LINK_DURATION_HOURS * 60 * 60 * 1000,
          downloads: 0,
          maxDownloads: MAX_DOWNLOADS,
        });

        const deliveryUrl = `${BASE_URL}/api/delivery/${token}`;
        deliveries.push({
          success: true,
          productId: item.id,
          productName: item.name,
          type: 'download',
          typeLabel: 'Producto Digital - Descarga Inmediata (Demo)',
          icon: 'Download',
          details: [
            { label: 'Producto', value: item.name },
            { label: 'Formato', value: (item.deliveryFormat || 'zip').toUpperCase() },
            { label: 'Tipo de entrega', value: 'Archivo descargable' },
            { label: 'Descargas permitidas', value: `${MAX_DOWNLOADS} (válido ${LINK_DURATION_HOURS}h)` },
            { label: 'Precio pagado', value: `$${item.price.toFixed(2)} USD (simulado)` },
          ],
          instructions:
            '1. Haz clic en "Descargar ahora"\n' +
            '2. Guarda el archivo en tu computadora\n' +
            '3. Si es ZIP, descomprímelo\n' +
            '4. Abre index.html en tu navegador\n' +
            '5. ¡Listo! Disfruta tu producto',
          downloadUrl: deliveryUrl,
          downloadToken: token,
          expiresAt: new Date(Date.now() + LINK_DURATION_HOURS * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Marcar como completada (igual que el webhook real)
    const orderResult = {
      orderId,
      paymentId: `demo-${Date.now()}`,
      total: pendingOrder.total,
      email,
      date: new Date().toISOString(),
      paymentMethod: 'demo_test',
      paymentStatus: 'approved',
      deliveries,
      success: deliveries.length > 0,
      message: deliveries.length > 0
        ? `¡Pago simulado aprobado! ${deliveries.length} producto(s) listo(s) para descargar.`
        : 'No se pudieron entregar los productos.',
      isDemo: true,
    };

    globalThis.completedOrders[orderId] = orderResult;
    delete globalThis.pendingOrders[orderId];

    // En el flujo real, el frontend redirige a MercadoPago.
    // En modo demo, devolvemos directamente las URLs de descarga:
    return NextResponse.json({
      success: true,
      demo: true,
      orderId,
      paymentStatus: 'approved',
      paymentMethod: 'demo_test',
      message: 'Pago simulado aprobado. Puedes descargar tu producto ahora.',
      deliveries,
      // El frontend puede usar estas URLs directamente
      deliveryUrls: deliveries.map((d: any) => d.downloadUrl),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'server_error',
      message: error.message,
    }, { status: 500 });
  }
}
