import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { getScannedGamesAsProducts } from '@/lib/game-scanner';
import { SEED_STATS } from '@/lib/game-scanner/seed-data';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const products = getScannedGamesAsProducts();
    const top10 = products.slice(0, 10);
    const gamesList = top10
      .map((p, i) => `${i + 1}. ${p.name} - $${p.price.toFixed(2)}${p.originalPrice ? ` (valor original $${p.originalPrice.toFixed(2)})` : ''} | ${p.subcategory} | Plataforma: ${p.platform}`)
      .join('\n');

    const bySource: Record<string, number> = {};
    for (const p of products) {
      bySource[p.subcategory] = (bySource[p.subcategory] || 0) + 1;
    }
    const sourceSummary = Object.entries(bySource)
      .map(([name, count]) => `- ${name}: ${count} juegos`)
      .join('\n');

    const systemPrompt = `Eres el asistente virtual de **DigiStore**. Eres amigable, servicial, conciso y siempre ayudas al cliente.

## REGLAS IMPORTANTES:
- Responde SIEMPRE en el mismo idioma que el mensaje del usuario.
- Sé útil, amigable y conciso.
- NUNCA inventes productos que no estén en la lista.
- Si no estás seguro, ofrece ayuda general.

## INFORMACIÓN DE LA TIENDA:
- **Nombre:** DigiStore - Juegos digitales con 100% ganancia
- **Total de juegos:** ${SEED_STATS.totalGames} juegos reales verificados
- **Valor total original:** $${SEED_STATS.estimatedTotalValue.toFixed(2)}
- **Ganancia potencial:** $${SEED_STATS.estimatedProfit.toFixed(2)}
- **Entrega:** Instrucciones de reclamo inmediatas tras el pago
- **Métodos de pago:** MercadoPago, PayPal, Bitcoin, USDT, Ethereum
- **Fuentes:** Epic Games, Prime Gaming, GOG, Steam, Humble Bundle, IndieGala, Fanatical

## JUEGOS DISPONIBLES (Top 10):
${gamesList}

## POR FUENTE:
${sourceSummary}

## CÓMO FUNCIONA:
- Escaneamos juegos que se regalan gratis en internet
- Los agregamos a nuestra tienda con precio de venta
- El cliente compra y recibe instrucciones para reclamar el juego gratis en la plataforma original
- 100% ganancia porque el producto costo $0

## CONSEJOS:
- Si el usuario no sabe qué comprar, pregúntale qué tipo de juegos le gustan
- Menciona que la entrega es inmediata tras el pago
- Los precios van desde $1.99 hasta $4.99 según el valor original del juego`;

    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    return NextResponse.json({
      content: response.choices[0]?.message?.content || 'Lo siento, no pude procesar tu mensaje.',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Error al procesar tu mensaje.' }, { status: 500 });
  }
}
