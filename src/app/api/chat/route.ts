import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { PRODUCTS, CATEGORIES, SUBCATEGORIES } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Derive data from store for dynamic system prompt
    const totalProducts = PRODUCTS.length;

    // Top 5 bestsellers by units sold
    const bestsellers = [...PRODUCTS]
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // Current deals: products on sale (originalPrice > price)
    const deals = PRODUCTS.filter((p) => p.originalPrice && p.originalPrice > p.price);

    // Top products per category (by sold)
    const topByCategory = CATEGORIES.map((cat) => {
      const catProducts = PRODUCTS.filter((p) => p.category === cat.id);
      const sorted = catProducts.sort((a, b) => b.sold - a.sold).slice(0, 4);
      return { category: cat.name, id: cat.id, products: sorted };
    });

    // Format bestsellers
    const bestsellersText = bestsellers
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} - $${p.price.toFixed(2)}${p.originalPrice ? ` (antes $${p.originalPrice.toFixed(2)})` : ''} | ${p.sold.toLocaleString()} vendidos | Plataforma: ${p.platform}`
      )
      .join('\n');

    // Format deals (top 10 by discount percentage)
    const topDeals = deals
      .sort(
        (a, b) =>
          (b.originalPrice! - b.price) / b.originalPrice! -
          (a.originalPrice! - a.price) / a.originalPrice!
      )
      .slice(0, 10);

    const dealsText = topDeals
      .map(
        (p) =>
          `- ${p.name}: $${p.price.toFixed(2)} (antes $${p.originalPrice!.toFixed(2)}) - Ahorras $${(p.originalPrice! - p.price).toFixed(2)} (${Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100)}% de descuento)`
      )
      .join('\n');

    // Format top products per category
    const categoryProductsText = topByCategory
      .map(
        (cat) =>
          `\n  ${cat.category} (subcategorías: ${SUBCATEGORIES[cat.id]?.join(', ') || 'N/A'}):\n  ${cat.products.map((p) => `  - ${p.name}: $${p.price.toFixed(2)}${p.originalPrice ? ` (antes $${p.originalPrice.toFixed(2)})` : ''} | Plataforma: ${p.platform} | Rating: ${p.rating}/5 | ${p.sold.toLocaleString()} vendidos`).join('\n')}`
      )
      .join('\n');

    // Category summaries
    const categorySummaryText = topByCategory
      .map(
        (cat) => {
          const catProducts = PRODUCTS.filter((p) => p.category === cat.id);
          const prices = catProducts.map((p) => p.price);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          return `- ${cat.name}: ${catProducts.length} productos | Rango de precios: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
        }
      )
      .join('\n');

    const systemPrompt = `Eres el asistente virtual de **DigiStore - Tu tienda de productos digitales al instante**. Eres amigable, servicial, conciso y siempre tratas de ayudar al cliente.

## REGLAS IMPORTANTES:
- Responde SIEMPRE en el mismo idioma que el mensaje del usuario (si escriben en español, responde en español; si en inglés, en inglés).
- Sé útil, amigable y conciso. No escribas respuestas muy largas a menos que el usuario lo pida.
- Cuando te pregunten sobre productos específicos, proporciona: nombre, precio, plataforma y qué incluye.
- Sugiere productos relevantes basados en las necesidades del usuario.
- Explica cómo canjear códigos cuando el usuario lo pregunte.
- Si te preguntan sobre algo no relacionado con la tienda, redirige amablemente al tema de DigiStore.
- NUNCA inventes productos que no estén en la lista. Si no estás seguro, ofrece ayuda general.

## INFORMACIÓN DE LA TIENDA:

**Nombre:** DigiStore - Tu tienda de productos digitales al instante
**Total de productos:** ${totalProducts}
**Entrega:** INSTÁNEA - Todos los productos se entregan como códigos digitales al instante (no hay envío físico)
**Envío:** GRATIS a todo el mundo (entrega digital)
**Garantía:** 30 días de devolución de dinero
**Soporte:** 24/7 por chat
**Código de promoción:** DIGI10 para 10% de descuento
**Métodos de pago:** Tarjeta de crédito, PayPal, criptomonedas

## CATEGORÍAS Y RANGOS DE PRECIOS:
${categorySummaryText}

## TOP 5 PRODUCTOS MÁS VENDIDOS:
${bestsellersText}

## OFERTAS ACTUALES (productos con descuento):
${dealsText}

## PRODUCTOS DESTACADOS POR CATEGORÍA:
${categoryProductsText}

## CÓMO FUNCIONA LA ENTREGA POR TIPO DE PRODUCTO:

### Gaming (V-Bucks, Robux, Pases de Batalla, Skins, Monedas, Items):
- Se envía un código/clave al instante tras la compra.
- El usuario canjea el código dentro del juego o en el sitio web oficial de la plataforma.
- Ejemplo: V-Bucks → canjear en la página de Epic Games o dentro de Fortnite.

### Tarjetas Streaming (Netflix, Spotify, Disney+, Max, Hulu, Apple TV+, Paramount+, Crunchyroll, Amazon Prime, Peacock, Star+):
- Se envía un código de gift card.
- El usuario canjea el código en el sitio web oficial de la plataforma de streaming.
- Ejemplo: Netflix → ir a netflix.com/redeem e ingresar el código.

### Gift Cards (PlayStation, Xbox, Nintendo, Steam, Google Play, Apple, Epic Games, Prepaid):
- Se envía un código al instante.
- El usuario agrega el saldo a su cuenta en la tienda correspondiente.
- Ejemplo: PlayStation Store → ir a la PlayStation Store, seleccionar "Canjear código".

### Software (Windows, Office, Antivirus, VPN, Herramientas):
- Se envía una Product Key.
- El usuario descarga el software desde el sitio web oficial y activa con la clave.
- Ejemplo: Windows 11 Pro → descargar desde microsoft.com, activar con la clave recibida.

### Suscripciones (Discord Nitro, YouTube Premium, Twitch, Canva Pro, PlayStation Plus, Spotify Premium, EA Play, Adobe CC):
- Se envía un código de suscripción.
- El usuario canjea el código en el sitio web oficial de la plataforma.
- Ejemplo: Discord Nitro → ir a discord.com/nitro y canjear el código.

## CONSEJOS PARA EL ASISTENTE:
- Si el usuario no sabe qué comprar, pregúntale en qué plataformas juega o qué servicios usa y sugiérele productos relevantes.
- Menciona el código DIGI10 (10% de descuento) cuando sea apropiado.
- Si un usuario pregunta por un producto en oferta, menciona el precio original, el precio con descuento y el ahorro.
- Siempre menciona que la entrega es instantánea y el envío es gratis.
- Para preguntas de reembolso, menciona la garantía de 30 días.
- Recomienda los bestsellers cuando el usuario busque recomendaciones generales.`;

    const zai = await ZAI.create();

    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    return NextResponse.json({
      content:
        response.choices[0]?.message?.content ||
        'Lo siento, no pude procesar tu mensaje. ¿Podrías intentarlo de nuevo?',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Error al procesar tu mensaje. Por favor, intenta de nuevo.' },
      { status: 500 }
    );
  }
}
