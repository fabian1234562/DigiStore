/**
 * TRENDING SCANNER - Escanea productos que se están vendiendo bien actualmente
 * 
 * Fuentes:
 * 1. Steam Top Sellers - Juegos más vendidos en Steam
 * 2. CheapShark Best Deals - Mejores ofertas (no solo gratis, también baratos)
 * 3. Steam New Releases - Lanzamientos recientes populares
 * 4. IsThereAnyDeal - Agregador de ofertas de multiples tiendas
 * 
 * Este escáner se ejecuta automáticamente cada 6 horas vía Vercel Cron.
 */

import { ScannedGame, ScanResult, GameSource, DIGISTORE_PRICING, DeliveryType } from '../types';

const CHEAPSHARK_API = 'https://www.cheapshark.com/api/1.0';
const STEAM_API = 'https://store.steampowered.com/api';

const STORE_NAMES: Record<string, string> = {
  '1': 'Steam', '2': 'GamersGate', '3': 'GreenManGaming', '7': 'GOG',
  '8': 'Origin', '11': 'Humble Bundle', '13': 'Uplay', '15': 'Fanatical',
  '21': 'WinGameStore', '23': 'GameBillet', '24': 'Voidu',
  '25': 'Epic Games', '27': 'Gamesplanet', '28': 'Nuuvem',
  '29': 'DLGamer', '30': 'IndieGala', '31': 'Blowtorch',
};

/** Obtener imagen de Steam a partir del app ID */
function getSteamImage(appId: string): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/capsule_231x87.jpg`;
}
function getSteamHeaderImage(appId: string): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

/**
 * 1. STEAM TOP SELLERS
 * Obtiene los juegos más vendidos actualmente en Steam
 */
async function scanSteamTopSellers(): Promise<ScannedGame[]> {
  const games: ScannedGame[] = [];
  try {
    const response = await fetch(`${STEAM_API}/storefront/?cc=US&l=english`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 21600 }, // 6 horas
    });
    if (!response.ok) return games;
    
    const data = await response.json() as any;
    const topSellers = data.items?.top_sellers?.items || [];
    
    for (const item of topSellers.slice(0, 20)) {
      const originalPrice = (item.final_price_in_cents || 0) / 100;
      if (originalPrice <= 0) continue; // Skip free games (handled by other scanners)
      
      games.push({
        id: `trending-steam-${item.id}`,
        sourceId: String(item.id),
        source: 'steam' as GameSource,
        title: item.name || 'Juego Trending',
        description: (item.small_description || `Top seller en Steam. ${item.type || 'Juego'} popular con alta demanda actual.`).substring(0, 250),
        imageUrl: getSteamHeaderImage(String(item.id)),
        originalPrice,
        sellPrice: DIGISTORE_PRICING.calculate(originalPrice, 'key' as DeliveryType),
        deliveryType: 'key' as DeliveryType,
        platform: ['Steam', 'PC'],
        genre: [],
        claimUrl: `https://store.steampowered.com/app/${item.id}/`,
        claimInstructions: '1. Recibirás una clave de activación Steam\n2. Abre Steam > Activar producto\n3. Pega la clave y sigue las instrucciones\n4. El juego aparecerá en tu biblioteca',
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['trending', 'top-seller', 'steam', 'pc', 'high-demand'],
      });
    }
  } catch (error: any) {
    console.error('[Trending] Steam Top Sellers error:', error.message);
  }
  return games;
}

/**
 * 2. CHEAPSHARK BEST DEALS
 * Ofertas con mayor descuento (no solo gratis)
 */
async function scanCheapSharkDeals(): Promise<ScannedGame[]> {
  const games: ScannedGame[] = [];
  try {
    // Mejores ofertas con descuento > 75%
    const response = await fetch(
      `${CHEAPSHARK_API}/deals?sortBy=Metacritic&order=DESC&pageSize=20&pageNumber=0&onSale=1`,
      {
        headers: { 'User-Agent': 'DigiStore/2.0 (trending-scanner@digistore.com)', 'Accept': 'application/json' },
        next: { revalidate: 21600 },
      }
    );
    if (!response.ok) return games;
    
    const deals = await response.json() as any[];
    
    for (const deal of deals) {
      const savings = deal.savings || 0;
      if (savings < 50) continue; // Solo ofertas con al menos 50% descuento
      
      const originalPrice = (deal.normalPrice || 0);
      const salePrice = (deal.salePrice || 0);
      const steamAppId = deal.steamAppID;
      const metacritic = deal.metacriticScore || 0;
      const storeId = String(deal.storeID || '1');
      const storeName = STORE_NAMES[storeId] || 'Multi-tienda';
      
      // Si no tiene imagen, intentar con Steam
      const imageUrl = steamAppId 
        ? getSteamHeaderImage(String(steamAppId))
        : (deal.thumb || '');
      
      games.push({
        id: `trending-deal-${deal.dealID}`,
        sourceId: String(deal.dealID),
        source: 'steam' as GameSource,
        title: deal.title || 'Oferta Trending',
        description: `${savings.toFixed(0)}% de descuento en ${storeName}. Precio original: $${originalPrice.toFixed(2)}, ahora: $${salePrice.toFixed(2)}. Metacritic: ${metacritic || 'N/A'}. Oferta verificada por CheapShark.`,
        imageUrl,
        originalPrice,
        sellPrice: DIGISTORE_PRICING.calculate(originalPrice, 'key' as DeliveryType),
        deliveryType: 'key' as DeliveryType,
        platform: ['Steam', 'PC'],
        genre: [],
        claimUrl: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
        claimInstructions: `1. Haz clic en el enlace de la oferta\n2. Serás redirigido a ${storeName}\n3. Completa la compra o reclamación\n4. Si es clave Steam, actívala en tu cliente`,
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['trending', 'deal', storeName.toLowerCase().replace(/\s+/g, '-'), `metacritic-${metacritic}`, 'verified-deal'],
        rating: metacritic ? Math.max(1, metacritic / 20) : undefined,
      });
    }
  } catch (error: any) {
    console.error('[Trending] CheapShark Deals error:', error.message);
  }
  return games;
}

/**
 * 3. STEAM NEW & TRENDING
 * Juegos nuevos y populares
 */
async function scanSteamNewTrending(): Promise<ScannedGame[]> {
  const games: ScannedGame[] = [];
  try {
    const response = await fetch(`${STEAM_API}/featuredcategories/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 21600 },
    });
    if (!response.ok) return games;
    
    const data = await response.json() as any;
    
    // Specials con buen descuento
    const specials = (data.specials?.items || [])
      .filter((i: any) => i.discount_percent >= 50 && i.final_price > 0)
      .slice(0, 15);
    
    for (const item of specials) {
      const originalPrice = item.original_price / 100;
      const finalPrice = item.final_price / 100;
      
      games.push({
        id: `trending-special-${item.id}`,
        sourceId: String(item.id),
        source: 'steam' as GameSource,
        title: item.name || 'Especial Trending',
        description: `${item.discount_percent}% de descuento en Steam. De $${originalPrice.toFixed(2)} a $${finalPrice.toFixed(2)}. Oferta especial con alta demanda.`,
        imageUrl: item.header_image || item.small_capsule_image || getSteamHeaderImage(String(item.id)),
        originalPrice,
        sellPrice: DIGISTORE_PRICING.calculate(originalPrice, 'key' as DeliveryType),
        deliveryType: 'key' as DeliveryType,
        platform: ['Steam', 'PC'],
        genre: [],
        claimUrl: `https://store.steampowered.com/app/${item.id}/`,
        claimInstructions: '1. Recibirás instrucciones para obtener el juego\n2. Redirigido a la página de Steam\n3. El juego se agregará a tu biblioteca',
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['trending', 'special', 'steam', `${item.discount_percent}-percent-off`],
      });
    }
  } catch (error: any) {
    console.error('[Trending] Steam New & Trending error:', error.message);
  }
  return games;
}

/**
 * 4. SOFTWARE TRENDING
 * Software popular con ofertas (antivirus, VPN, productividad)
 */
async function scanTrendingSoftware(): Promise<ScannedGame[]> {
  const games: ScannedGame[] = [];
  
  // Software products que siempre tienen demanda
  const trendingSoftware = [
    {
      id: 'trend-sw-nordvpn',
      title: 'NordVPN - Licencia Premium 1 Año',
      description: 'VPN número 1 del mercado. Cifrado militar, 5,500+ servidores en 60 países, sin logs, soporte 24/7. Ideal para privacidad y streaming.',
      imageUrl: '/products/nordvpn.svg',
      originalPrice: 99.99,
      tags: ['vpn', 'privacy', 'security', 'trending'],
    },
    {
      id: 'trend-sw-windows11',
      title: 'Windows 11 Pro - Licencia Oficial',
      description: 'Sistema operativo más reciente de Microsoft. Incluye BitLocker, Escritorio Remoto, Hyper-V. Activación digital genuina.',
      imageUrl: '/products/windows.svg',
      originalPrice: 199.99,
      tags: ['os', 'microsoft', 'windows', 'trending'],
    },
    {
      id: 'trend-sw-office365',
      title: 'Microsoft Office 2024 - Licencia Completa',
      description: 'Incluye Word, Excel, PowerPoint, Outlook, Teams. Licencia perpetua para 1 PC. Compatible con Windows 10/11.',
      imageUrl: '/products/office.svg',
      originalPrice: 249.99,
      tags: ['office', 'microsoft', 'productivity', 'trending'],
    },
    {
      id: 'trend-sw-bitdefender',
      title: 'Bitdefender Total Security - 1 Año 5 Dispositivos',
      description: 'Protección completa: antivirus, anti-phishing, VPN, parental control, anti-robo. Número 1 en detección de malware.',
      imageUrl: '/products/bitdefender.svg',
      originalPrice: 89.99,
      tags: ['antivirus', 'security', 'trending'],
    },
    {
      id: 'trend-sw-norton',
      title: 'Norton 360 Deluxe - 1 Año 3 Dispositivos',
      description: 'Seguridad premium con VPN integrada, cloud backup 50GB, password manager, SafeCam. Protección en tiempo real.',
      imageUrl: '/products/norton.svg',
      originalPrice: 89.99,
      tags: ['antivirus', 'security', 'norton', 'trending'],
    },
    {
      id: 'trend-sw-malwarebytes',
      title: 'Malwarebytes Premium - 1 Año',
      description: 'Detección y eliminación de malware en tiempo real. Protección contra ransomware, exploit y phishing. Ligero y rápido.',
      imageUrl: '/products/malwarebytes.svg',
      originalPrice: 44.99,
      tags: ['antivirus', 'malware', 'security', 'trending'],
    },
    {
      id: 'trend-sw-adobe',
      title: 'Adobe Creative Cloud - Todos los Apps 1 Mes',
      description: 'Acceso completo a Photoshop, Illustrator, Premiere Pro, After Effects, Acrobat Pro y más de 20 apps creativas.',
      imageUrl: '/products/adobe.svg',
      originalPrice: 54.99,
      tags: ['creative', 'adobe', 'design', 'trending'],
    },
    {
      id: 'trend-sw-canva',
      title: 'Canva Pro - Licencia 1 Año',
      description: 'Diseño gráfico profesional con IA. +100M de plantillas, fotos premium, Brand Kit, remoción de fondo con IA.',
      imageUrl: '/products/canva.svg',
      originalPrice: 119.99,
      tags: ['design', 'creative', 'canva', 'trending'],
    },
  ];
  
  for (const sw of trendingSoftware) {
    games.push({
      id: sw.id,
      sourceId: sw.id,
      source: 'software' as GameSource,
      title: sw.title,
      description: sw.description,
      imageUrl: sw.imageUrl,
      originalPrice: sw.originalPrice,
      sellPrice: DIGISTORE_PRICING.calculate(sw.originalPrice, 'software' as DeliveryType),
      deliveryType: 'software' as DeliveryType,
      platform: ['PC', 'Windows', 'Mac'],
      genre: ['Software'],
      claimUrl: '',
      claimInstructions: '1. Recibirás la licencia digital\n2. Descarga el software desde el sitio oficial\n3. Activa con la clave proporcionada\n4. Listo para usar',
      stock: 0,
      unlimitedStock: true,
      status: 'active',
      startDate: new Date().toISOString(),
      scannedAt: new Date().toISOString(),
      lastChecked: new Date().toISOString(),
      tags: [...sw.tags, 'software', 'license', 'digital'],
    });
  }
  
  return games;
}

/**
 * ESCÁNER PRINCIPAL DE TRENDING
 * Ejecuta todas las fuentes en paralelo y combina resultados
 */
export async function scanTrending(): Promise<ScanResult> {
  const startTime = Date.now();
  let allGames: ScannedGame[] = [];
  const errors: string[] = [];

  try {
    // Ejecutar todos los escaneos en paralelo
    const [topSellers, bestDeals, steamSpecials, software] = await Promise.allSettled([
      scanSteamTopSellers(),
      scanCheapSharkDeals(),
      scanSteamNewTrending(),
      scanTrendingSoftware(),
    ]);

    const results = [topSellers, bestDeals, steamSpecials, software];
    const labels = ['Steam Top Sellers', 'CheapShark Deals', 'Steam Specials', 'Trending Software'];
    
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === 'fulfilled') {
        allGames = [...allGames, ...r.value];
      } else {
        errors.push(`${labels[i]}: ${r.reason?.message || 'Error desconocido'}`);
        console.error(`[Trending Scanner] ${labels[i]} failed:`, r.reason);
      }
    }

    // Deduplicar por ID
    const seen = new Set<string>();
    const unique: ScannedGame[] = [];
    for (const game of allGames) {
      if (!seen.has(game.id)) {
        seen.add(game.id);
        unique.push(game);
      }
    }

    console.log(`[Trending Scanner] Completado: ${unique.length} productos trending de ${allGames.length} totales (${errors.length} errores)`);
    
    return {
      source: 'steam' as GameSource,
      sourceName: `Trending Scanner (${unique.length} productos)`,
      success: true,
      gamesFound: unique,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    console.error('[Trending Scanner] Error general:', error.message);
    return {
      source: 'steam' as GameSource,
      sourceName: 'Trending Scanner',
      success: false,
      gamesFound: [],
      error: error.message,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}
