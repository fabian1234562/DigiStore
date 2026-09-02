import type { Lang } from './store';

const translations: Record<Lang, Record<string, string>> = {
  es: {
    // Header
    'nav.home': 'Inicio',
    'nav.store': 'Tienda',
    'nav.cart': 'Tu Carrito',
    'nav.login': 'Iniciar Sesion',
    'nav.mobileMenu': 'Menu',

    // Announcement bar
    'announce.delivery': 'Entrega instantanea en pedidos digitales',
    'announce.deliveryShort': 'Entrega instantanea',
    'announce.profit': 'Juegos y software desde $1 USD',
    'announce.coupon': 'Usa DIGI10 para 10% OFF',

    // Hero
    'hero.featured': 'DESTACADO DE LA SEMANA',
    'hero.freeGames': 'PRODUCTOS',
    'hero.noInventory': 'SIN INVENTARIO',
    'hero.seeDetail': 'Ver Detalle',
    'hero.seeFreeGames': 'Ver Tienda',
    'hero.goStore': 'Ir a la Tienda',
    'hero.explore': 'Explorar',
    'hero.seeStore': 'Ver Tienda',
    'hero.scanDesc': 'Escaneamos {count} productos en Epic Games, Prime Gaming, GOG, Steam y mas. Juegos + licencias de software a los mejores precios.',
    'hero.profitDesc': 'Valor en mercado: ${value} USD. Productos digitales escaneados y ofrecidos a precios desde $1 USD. Sin inventario, sin riesgo.',
    'hero.ctaDesc': 'Escaneamos {count} productos en Epic Games, Prime Gaming, GOG, Steam y mas.',

    // Categories
    'cat.all': 'Todos',
    'cat.action': 'Accion',
    'cat.rpg': 'RPG',
    'cat.adventure': 'Aventura',
    'cat.racing': 'Carreras',
    'cat.strategy': 'Estrategia',
    'cat.indie': 'Indie',
    'cat.software': 'Software',

    // Features
    'feat.100profit': 'Precios Bajos',
    'feat.100profitDesc': 'Los mejores precios en productos digitales. Escaneados desde multiples plataformas. ${value} USD en valor de mercado.',
    'feat.delivery': 'Entrega Instantanea',
    'feat.deliveryDesc': 'Pago aprobado = producto entregado al instante. MercadoPago, PayPal, Bitcoin y USDT disponibles 24/7.',
    'feat.freeProducts': 'Catalogo Digital',
    'feat.freeProductsDesc': 'Escaneamos 8 plataformas automaticamente. {count} productos siempre disponibles a los mejores precios.',
    'feat.value': 'Valor Total',
    'feat.deliveryTime': 'Tiempo Entrega',
    'feat.products': 'Productos',
    'feat.goStore': 'Ir a Tienda',
    'feat.buyNow': 'Comprar Ahora',
    'feat.seeFree': 'Ver Tienda',

    // Deals
    'deals.title': 'Ofertas del Dia',
    'deals.subtitle': 'Juegos desde $1.99 — ganancia directa',
    'deals.seeMore': 'Ver mas',

    // Sections
    'section.premium': 'Juegos Premium',
    'section.premiumDesc': 'Los mejores juegos con mayor valor original',
    'section.action': 'Accion y Aventura',
    'section.actionDesc': 'Juegos de accion, combate y aventuras emocionantes',
    'section.rpg': 'RPG y Estrategia',
    'section.rpgDesc': 'Mundos abiertos, rol por turnos y estrategia profunda',
    'section.software': 'Software y Licencias',
    'section.softwareDesc': 'Antivirus, VPN, utilidades y mas — a los mejores precios',
    'section.recent': 'Recien Escaneados',
    'section.recentDesc': 'Los ultimos productos agregados a la tienda',
    'section.seeAll': 'Ver todos',
    'section.seeMore': 'Ver mas',
    'section.seeSoftware': 'Ver software',

    // CTA Banner
    'cta.badge': 'TIENDA DIGITAL',
    'cta.title': 'Los mejores precios en digital',
    'cta.desc': '{count} productos disponibles. Escaneo automatico de 8 plataformas. Precios desde $1 USD.',
    'cta.products': 'Productos',
    'cta.value': 'Valor USD',
    'cta.start': 'Empezar',

    // Recommendations
    'rec.title': 'Recomendaciones',
    'rec.subtitle': 'Productos similares a "{name}"',

    // Product Card
    'card.buy': 'Comprar',
    'card.free': 'OFERTA',

    // Product Detail
    'detail.back': 'Volver a la tienda',
    'detail.images': 'Imagenes',
    'detail.videoTrailer': 'Video Trailer',
    'detail.description': 'Descripcion del Producto',
    'detail.delivery': 'Entrega',
    'detail.region': 'Region',
    'detail.stock': 'Stock',
    'detail.unlimited': 'Ilimitado',
    'detail.available': 'disponibles',
    'detail.whatReceive': 'Que recibiras al comprar',
    'detail.deliveryType': 'Tipo de entrega',
    'detail.howWorks': 'Como funciona la entrega',
    'detail.guarantee': 'Garantia y Soporte 24/7',
    'detail.guaranteeText': 'Todos nuestros productos incluyen garantia de 30 dias. Si tienes cualquier problema con tu compra, nuestro equipo de soporte esta disponible 24/7 para ayudarte con la activacion o reemplazo.',
    'detail.addCart': 'Agregar al Carrito',
    'detail.securePay': 'Pago seguro',
    'detail.instant': 'Instantaneo',
    'detail.days30': '30 dias',
    'detail.favorite': 'Favorito',
    'detail.share': 'Compartir',
    'detail.payMethods': 'Metodos de pago aceptados',
    'detail.similar': 'Productos Similares',
    'detail.similarDesc': 'Basados en "{name}" — te pueden interesar',
    'detail.sold': 'vendidos',
    'detail.reviews': 'resenas',
    'detail.savings': 'Ahorras ${value} USD',
    'detail.buyMobile': 'Comprar',
    'detail.softwareBadge': 'Software Original con Licencia',
    'detail.softwareDesc': 'Este producto es un software original con licencia valida. Recibiras una clave de activacion (Product Key) para activar la version completa. Licencia personal, valida para 1 dispositivo.',
    'detail.gameBadge': 'Producto Digital — Entrega Inmediata',
    'detail.gameDesc': 'Juego escaneado desde {source}. Al comprar, recibiras instrucciones paso a paso para reclamarlo y agregarlo permanentemente a tu cuenta. 100% original, sin costos ocultos.',
    'detail.trustSSL': 'Encriptacion SSL',
    'detail.trustDigital': 'Sin envios fisicos',
    'detail.trustRefund': 'Reembolso total',

    // Delivery info
    'delivery.software': 'Licencia de Software (Product Key)',
    'delivery.game': 'Link de Reclamo + Instrucciones',
    'delivery.auto': 'Entrega automatica tras confirmar el pago',
    'delivery.receiveKey': 'Product Key / Clave de activacion original',
    'delivery.onlineActivation': 'Activacion online valida a traves del servidor oficial',
    'delivery.oneDevice': '1 activacion por clave (1 dispositivo)',
    'delivery.instructions': 'Instrucciones de descarga e instalacion paso a paso',
    'delivery.support': 'Soporte tecnico por 30 dias',
    'delivery.claimLink': 'Link directo para reclamar el producto digital',
    'delivery.claimInstructions': 'Instrucciones paso a paso para canjear en {platform}',
    'delivery.permanent': 'El juego se vincula permanentemente a tu cuenta',
    'delivery.officialDownload': 'Descarga inmediata desde la plataforma oficial',
    'delivery.step1': 'Recibes la Product Key al instante tras el pago',
    'delivery.step2': 'Descargas el software desde la pagina oficial del fabricante',
    'delivery.step3': 'Durante la instalacion, ingresas la clave cuando te lo pida',
    'delivery.step4': 'Activas en linea y listo: software original completo y activado',
    'delivery.gstep1': 'Recibes las instrucciones al instante tras el pago',
    'delivery.gstep2': 'Haces clic en el link de reclamo proporcionado',
    'delivery.gstep3': 'Inicias sesion con tu cuenta personal de la plataforma',
    'delivery.gstep4': 'El juego se agrega a tu biblioteca permanentemente',

    // Payment
    'payment.title': 'Metodos de pago aceptados',

    // Trust strip
    'trust.secure': 'Pago Seguro',
    'trust.instant': 'Entrega Inmediata',
    'trust.global': 'Juegos Globales',
    'trust.guarantee': 'Garantia 30 Dias',

    // Footer
    'footer.desc': 'Juegos y software digital al mejor precio. Escaneamos plataformas y te traemos los mejores productos digitales a precios desde $1 USD.',
    'footer.nav': 'Navegacion',
    'footer.sources': 'Fuentes',
    'footer.payments': 'Pagos',
    'footer.rights': 'Todos los derechos reservados.',

    // Loading
    'loading.text': 'Cargando {count} productos escaneados...',

    // Cart
    'cart.empty': 'Tu carrito esta vacio',
    'cart.total': 'Total',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Envio',
    'cart.free': 'Sin costo',
    'cart.pay': 'Pagar con MercadoPago',
    'cart.items': 'items',
  },
  en: {
    // Header
    'nav.home': 'Home',
    'nav.store': 'Store',
    'nav.cart': 'Your Cart',
    'nav.login': 'Sign In',
    'nav.mobileMenu': 'Menu',

    // Announcement bar
    'announce.delivery': 'Instant delivery on digital orders',
    'announce.deliveryShort': 'Instant delivery',
    'announce.profit': 'Games & software from $1 USD',
    'announce.coupon': 'Use DIGI10 for 10% OFF',

    // Hero
    'hero.featured': 'WEEKLY FEATURED',
    'hero.freeGames': 'PRODUCTS',
    'hero.noInventory': 'NO INVENTORY',
    'hero.seeDetail': 'See Details',
    'hero.seeFreeGames': 'See Store',
    'hero.goStore': 'Go to Store',
    'hero.explore': 'Explore',
    'hero.seeStore': 'See Store',
    'hero.scanDesc': 'We scan {count} products on Epic Games, Prime Gaming, GOG, Steam and more. Games + software licenses at the best prices.',
    'hero.profitDesc': 'Market value: ${value} USD. Digital products scanned and offered at prices from $1 USD. No inventory, no risk.',
    'hero.ctaDesc': 'We scan {count} products on Epic Games, Prime Gaming, GOG, Steam and more.',

    // Categories
    'cat.all': 'All',
    'cat.action': 'Action',
    'cat.rpg': 'RPG',
    'cat.adventure': 'Adventure',
    'cat.racing': 'Racing',
    'cat.strategy': 'Strategy',
    'cat.indie': 'Indie',
    'cat.software': 'Software',

    // Features
    'feat.100profit': 'Low Prices',
    'feat.100profitDesc': 'Best prices on digital products. Scanned from multiple platforms. ${value} USD in market value.',
    'feat.delivery': 'Instant Delivery',
    'feat.deliveryDesc': 'Payment approved = product delivered instantly. MercadoPago, PayPal, Bitcoin and USDT available 24/7.',
    'feat.freeProducts': 'Digital Catalog',
    'feat.freeProductsDesc': 'We automatically scan 8 platforms. {count} products always available at the best prices.',
    'feat.value': 'Total Value',
    'feat.deliveryTime': 'Delivery Time',
    'feat.products': 'Products',
    'feat.goStore': 'Go to Store',
    'feat.buyNow': 'Buy Now',
    'feat.seeFree': 'See Store',

    // Deals
    'deals.title': 'Daily Deals',
    'deals.subtitle': 'Games from $1.99 — direct profit',
    'deals.seeMore': 'See more',

    // Sections
    'section.premium': 'Premium Games',
    'section.premiumDesc': 'Best games with highest original value',
    'section.action': 'Action & Adventure',
    'section.actionDesc': 'Exciting action, combat and adventure games',
    'section.rpg': 'RPG & Strategy',
    'section.rpgDesc': 'Open worlds, turn-based RPGs and deep strategy',
    'section.software': 'Software & Licenses',
    'section.softwareDesc': 'Antivirus, VPN, utilities and more — at the best prices',
    'section.recent': 'Recently Scanned',
    'section.recentDesc': 'Latest products added to the store',
    'section.seeAll': 'See all',
    'section.seeMore': 'See more',
    'section.seeSoftware': 'See software',

    // CTA Banner
    'cta.badge': 'DIGITAL STORE',
    'cta.title': 'Best digital prices',
    'cta.desc': '{count} products available. Automatic scanning of 8 platforms. Prices from $1 USD.',
    'cta.products': 'Products',
    'cta.value': 'Value USD',
    'cta.start': 'Get Started',

    // Recommendations
    'rec.title': 'Recommendations',
    'rec.subtitle': 'Products similar to "{name}"',

    // Product Card
    'card.buy': 'Buy',
    'card.free': 'DEAL',

    // Product Detail
    'detail.back': 'Back to store',
    'detail.images': 'Images',
    'detail.videoTrailer': 'Video Trailer',
    'detail.description': 'Product Description',
    'detail.delivery': 'Delivery',
    'detail.region': 'Region',
    'detail.stock': 'Stock',
    'detail.unlimited': 'Unlimited',
    'detail.available': 'available',
    'detail.whatReceive': 'What you receive when purchasing',
    'detail.deliveryType': 'Delivery type',
    'detail.howWorks': 'How delivery works',
    'detail.guarantee': 'Warranty & 24/7 Support',
    'detail.guaranteeText': 'All our products include a 30-day warranty. If you have any issue with your purchase, our support team is available 24/7 to help with activation or replacement.',
    'detail.addCart': 'Add to Cart',
    'detail.securePay': 'Secure payment',
    'detail.instant': 'Instant',
    'detail.days30': '30 days',
    'detail.favorite': 'Favorite',
    'detail.share': 'Share',
    'detail.payMethods': 'Accepted payment methods',
    'detail.similar': 'Similar Products',
    'detail.similarDesc': 'Based on "{name}" — you might like these',
    'detail.sold': 'sold',
    'detail.reviews': 'reviews',
    'detail.savings': 'You save ${value} USD',
    'detail.buyMobile': 'Buy',
    'detail.softwareBadge': 'Original Software with License',
    'detail.softwareDesc': 'This is original software with a valid license. You will receive an activation key (Product Key) to activate the full version. Personal license, valid for 1 device.',
    'detail.gameBadge': 'Digital Product — Instant Delivery',
    'detail.gameDesc': 'Game scanned from {source}. Upon purchase, you receive step-by-step instructions to claim it and add it permanently to your account. 100% original, no hidden costs.',
    'detail.trustSSL': 'SSL Encryption',
    'detail.trustDigital': 'No physical shipping',
    'detail.trustRefund': 'Full refund',

    // Delivery info
    'delivery.software': 'Software License (Product Key)',
    'delivery.game': 'Claim Link + Instructions',
    'delivery.auto': 'Automatic delivery after payment confirmation',
    'delivery.receiveKey': 'Original Product Key / Activation Key',
    'delivery.onlineActivation': 'Online activation through the official server',
    'delivery.oneDevice': '1 activation per key (1 device)',
    'delivery.instructions': 'Step-by-step download and installation instructions',
    'delivery.support': 'Technical support for 30 days',
    'delivery.claimLink': 'Direct link to claim the digital product',
    'delivery.claimInstructions': 'Step-by-step instructions to redeem on {platform}',
    'delivery.permanent': 'The game is permanently linked to your account',
    'delivery.officialDownload': 'Immediate download from the official platform',
    'delivery.step1': 'You receive the Product Key instantly after payment',
    'delivery.step2': 'Download the software from the official manufacturer website',
    'delivery.step3': 'During installation, enter the key when prompted',
    'delivery.step4': 'Activate online and you are done: full original software activated',
    'delivery.gstep1': 'You receive the instructions instantly after payment',
    'delivery.gstep2': 'Click on the claim link provided',
    'delivery.gstep3': 'Sign in with your personal account on the platform',
    'delivery.gstep4': 'The game is permanently added to your library',

    // Payment
    'payment.title': 'Accepted payment methods',

    // Trust strip
    'trust.secure': 'Secure Payment',
    'trust.instant': 'Instant Delivery',
    'trust.global': 'Global Games',
    'trust.guarantee': '30-Day Warranty',

    // Footer
    'footer.desc': 'Digital games and software at the best price. We scan platforms and bring you the best digital products at prices from $1 USD.',
    'footer.nav': 'Navigation',
    'footer.sources': 'Sources',
    'footer.payments': 'Payments',
    'footer.rights': 'All rights reserved.',

    // Loading
    'loading.text': 'Loading {count} scanned products...',

    // Cart
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.free': 'No cost',
    'cart.pay': 'Pay with MercadoPago',
    'cart.items': 'items',
  },
};

export function t(key: string, lang: Lang, vars?: Record<string, string | number>): string {
  const safeLang: Lang = (lang === 'es' || lang === 'en') ? lang : 'es';
  let text = translations[safeLang]?.[key] || translations['es']?.[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export const LANG_LABELS: Record<Lang, string> = { es: 'ES', en: 'EN' };
