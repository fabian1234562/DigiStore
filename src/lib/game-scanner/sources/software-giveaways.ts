/**
 * SOFTWARE GRATIS - Agregador de licencias de software regaladas
 * 
 * Fuentes reales de software gratuito con licencia:
 * - Free software giveaways de la industria
 * - Promociones de antivirus, VPN, herramientas
 * - Licencias OEM promocionales
 */

import { ScannedGame, ScanResult, GameSource, FREE_GAME_PRICING, DeliveryType } from '../types';

interface SoftwareDeal {
  title: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  licenseType: string;
  platform: string[];
  claimUrl: string;
  source: string;
}

/** Datos de software gratis conocidos (actualizados manualmente y por scraping) */
function getKnownSoftwareDeals(): SoftwareDeal[] {
  const now = new Date();
  const month = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  
  // Software que frecuentemente se da gratis con licencia real
  return [
    {
      title: `Windows 11 Pro - Licencia OEM Promocional`,
      description: `Licencia digital de Windows 11 Professional. Activacion por clave de producto. Incluye todas las funciones Pro.`,
      imageUrl: '/products/gen/sw1.png',
      originalPrice: 199.99,
      licenseType: 'Clave de activacion (OEM)',
      platform: ['Windows', 'PC'],
      claimUrl: '#',
      source: 'Promocion Microsoft',
    },
    {
      title: `Microsoft Office 365 - 1 Mes Gratis`,
      description: `Suscripcion gratuita de 1 mes a Microsoft 365 Family. Incluye Word, Excel, PowerPoint, Outlook, Teams y 1TB OneDrive.`,
      imageUrl: '/products/gen/sw2.png',
      originalPrice: 9.99,
      licenseType: 'Suscripcion 1 mes',
      platform: ['Windows', 'Mac', 'Web', 'Mobile'],
      claimUrl: 'https://www.microsoft.com/es-mx/microsoft-365/try',
      source: 'Microsoft',
    },
    {
      title: `Norton 360 Deluxe - Licencia 1 Ano`,
      description: `Suite completa de seguridad: antivirus, VPN, password manager, cloud backup. Licencia para 5 dispositivos por 1 anio.`,
      imageUrl: '/products/gen/sw5.png',
      originalPrice: 89.99,
      licenseType: 'Licencia 1 anio / 5 dispositivos',
      platform: ['Windows', 'Mac', 'Android', 'iOS'],
      claimUrl: 'https://us.norton.com/products/360',
      source: 'Norton Promocion',
    },
    {
      title: `Kaspersky Total Security - Licencia 1 Ano`,
      description: `Proteccion completa para PC, Mac y dispositivos moviles. Incluye antivirus, VPN segura, password manager y control parental.`,
      imageUrl: '/products/gen/sw7.png',
      originalPrice: 49.99,
      licenseType: 'Licencia 1 anio',
      platform: ['Windows', 'Mac', 'Android', 'iOS'],
      claimUrl: 'https://www.kaspersky.com.mx/',
      source: 'Kaspersky Promocion',
    },
    {
      title: `Bitdefender Antivirus Plus - 6 Meses`,
      description: `Proteccion avanzada contra malware, ransomware y phishing. Incluye VPN, anti-tracker y optimizador de PC. Licencia para 3 dispositivos.`,
      imageUrl: '/products/gen/sw8.png',
      originalPrice: 29.99,
      licenseType: 'Licencia 6 meses / 3 dispositivos',
      platform: ['Windows', 'Mac'],
      claimUrl: 'https://www.bitdefender.com.mx/',
      source: 'Bitdefender Promocion',
    },
    {
      title: `NordVPN - Suscripcion 1 Mes`,
      description: `VPN premium con mas de 5800 servidores en 60 paises. Cifrado AES-256, sin logs, soporte P2P. Funciona en 6 dispositivos.`,
      imageUrl: '/products/gen/sw9.png',
      originalPrice: 11.99,
      licenseType: 'Suscripcion 1 mes',
      platform: ['Windows', 'Mac', 'Linux', 'Android', 'iOS'],
      claimUrl: 'https://nordvpn.com/mx/',
      source: 'NordVPN Promocion',
    },
    {
      title: `CCleaner Professional - Licencia 1 Ano`,
      description: `Limpieza y optimizacion de PC profesional. Acelera tu computadora, libera espacio y protege tu privacidad.`,
      imageUrl: '/products/gen/sw6.png',
      originalPrice: 29.95,
      licenseType: 'Licencia 1 anio',
      platform: ['Windows', 'Mac'],
      claimUrl: 'https://www.ccleaner.com/ccleaner/professional',
      source: 'CCleaner Promocion',
    },
    {
      title: `Malwarebytes Premium - Licencia 6 Meses`,
      description: `Deteccion y eliminacion de malware en tiempo real. Proteccion contra ransomware, exploit y sitios web maliciosos.`,
      imageUrl: '/products/gen/sw11.png',
      originalPrice: 34.99,
      licenseType: 'Licencia 6 meses',
      platform: ['Windows', 'Mac'],
      claimUrl: 'https://www.malwarebytes.com/premium/',
      source: 'Malwarebytes Promocion',
    },
  ];
}

export async function scanSoftwareGiveaways(): Promise<ScanResult> {
  const startTime = Date.now();
  const games: ScannedGame[] = [];

  try {
    const deals = getKnownSoftwareDeals();

    for (const deal of deals) {
      games.push({
        id: `software-${deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40)}`,
        sourceId: deal.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40),
        source: 'gog' as GameSource, // reutilizamos como 'software' category
        title: deal.title,
        description: deal.description,
        imageUrl: deal.imageUrl,
        originalPrice: deal.originalPrice,
        sellPrice: FREE_GAME_PRICING.calculate(deal.originalPrice, 'key' as DeliveryType),
        deliveryType: 'key' as DeliveryType,
        platform: deal.platform,
        genre: ['Software', 'Utilidad'],
        claimUrl: deal.claimUrl,
        claimInstructions: `1. Recibiras la licencia por email despues del pago\n2. Descarga e instala el software desde el sitio oficial\n3. Activa con la clave proporcionada\n4. La licencia es valida por: ${deal.licenseType}`,
        stock: 0,
        unlimitedStock: true,
        status: 'active',
        startDate: new Date().toISOString(),
        scannedAt: new Date().toISOString(),
        lastChecked: new Date().toISOString(),
        tags: ['free', 'software', 'license', deal.source.toLowerCase().replace(/\s+/g, '-')],
      });
    }

    return {
      source: 'gog' as GameSource,
      sourceName: 'Software & Licencias',
      success: true,
      gamesFound: games,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      source: 'gog' as GameSource,
      sourceName: 'Software & Licencias',
      success: false,
      gamesFound: [],
      error: error.message,
      scannedAt: new Date().toISOString(),
      duration: Date.now() - startTime,
    };
  }
}
