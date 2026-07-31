import { NextResponse } from 'next/server';

function generateDeliveryData(item: { id: string; name: string; platform: string; category: string; quantity: number }) {
  const genCode = (len: number) => Array.from({ length: len }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('');
  const genCodeDash = (groups: number, len: number) => Array.from({ length: groups }, () => genCode(len)).join('-');
  const genEmail = () => `digistore_${genCode(6).toLowerCase()}@proton.me`;
  const genPass = () => Array.from({ length: 12 }, () => 'abcdefghjkmnpqrstuvwxyz23456789!@#'[Math.floor(Math.random() * 28)]).join('');
  const genKey = () => genCodeDash(5, 5);

  const deliveries = [];

  for (let i = 0; i < item.quantity; i++) {
    const cat = item.category;
    const plat = item.platform.toLowerCase();

    if (cat === 'streaming' || (cat === 'accounts' && ['netflix', 'spotify', 'disney+', 'hbo', 'crunchyroll'].includes(plat))) {
      deliveries.push({
        type: 'credentials',
        typeLabel: 'Credenciales de Acceso',
        icon: 'KeyRound',
        productName: item.name,
        details: [
          { label: 'Email', value: genEmail() },
          { label: 'Contraseña', value: genPass() },
          { label: 'Tipo de Cuenta', value: 'Premium' },
          { label: 'Duración', value: item.name.includes('3 Meses') ? '3 meses' : '1 mes' },
        ],
        instructions: `1. Ve a ${plat.charAt(0).toUpperCase() + plat.slice(1)} y selecciona "Iniciar sesión"\n2. Ingresa el email y contraseña que te acabamos de dar\n3. ¡Listo! Ya tienes acceso premium`,
      });
    } else if (cat === 'gaming' && (item.name.toLowerCase().includes('v-bucks') || item.name.toLowerCase().includes('robux') || item.name.toLowerCase().includes('monedas') || item.name.toLowerCase().includes('rp league') || item.name.toLowerCase().includes('genesis crystal') || item.name.toLowerCase().includes('pase de batalla'))) {
      const unit = item.name.toLowerCase().includes('v-bucks') ? 'V-Bucks' : item.name.toLowerCase().includes('robux') ? 'Robux' : item.name.toLowerCase().includes('rp') ? 'Riot Points' : item.name.toLowerCase().includes('genesis') ? 'Genesis Crystals' : 'Monedas';
      deliveries.push({
        type: 'giftcard',
        typeLabel: 'Código de Canje',
        icon: 'Ticket',
        productName: item.name,
        details: [
          { label: 'Código de Canje', value: genCodeDash(4, 4) },
          { label: 'Producto', value: unit },
          { label: 'Plataforma', value: item.platform },
          { label: 'Región', value: 'Global' },
        ],
        instructions: `1. Abre ${item.platform}\n2. Ve a la tienda y selecciona "Canjear Código"\n3. Ingresa el código y tu ${unit} se acreditarán al instante`,
      });
    } else if (cat === 'gaming' && item.name.toLowerCase().includes('skin')) {
      deliveries.push({
        type: 'giftcard',
        typeLabel: 'Código de Skin',
        icon: 'Ticket',
        productName: item.name,
        details: [
          { label: 'Código de Activación', value: genCodeDash(3, 6) },
          { label: 'Skin', value: item.name },
          { label: 'Plataforma', value: item.platform },
        ],
        instructions: `1. Abre ${item.platform}\n2. Ve a la tienda de skins / canjear\n3. Ingresa el código y la skin se desbloqueará`,
      });
    } else if (cat === 'gaming' && item.name.toLowerCase().includes('minecraft')) {
      deliveries.push({
        type: 'credentials',
        typeLabel: 'Cuenta Premium',
        icon: 'KeyRound',
        productName: item.name,
        details: [
          { label: 'Email de la Cuenta', value: genEmail() },
          { label: 'Contraseña', value: genPass() },
          { label: 'Tipo', value: 'Premium Full Access' },
          { label: 'Edición', value: 'Java Edition' },
        ],
        instructions: `1. Ve a minecraft.net y selecciona "Iniciar sesión"\n2. Ingresa las credenciales de la cuenta\n3. Descarga el launcher y juega en línea`,
      });
    } else if (cat === 'giftcards') {
      deliveries.push({
        type: 'giftcard',
        typeLabel: 'Tarjeta de Regalo',
        icon: 'CreditCard',
        productName: item.name,
        details: [
          { label: 'Código de Tarjeta', value: genCodeDash(4, 4) },
          { label: 'Monto', value: item.name.match(/\$(\d+)/)?.[0] || 'N/A' },
          { label: 'Plataforma', value: item.platform },
          { label: 'Vigencia', value: 'Sin fecha de expiración' },
        ],
        instructions: `1. Abre la tienda de ${item.platform}\n2. Ve a "Canjear Código" o "Agregar Saldo"\n3. Ingresa el código y el saldo se acreditará al instante`,
      });
    } else if (cat === 'software') {
      deliveries.push({
        type: 'license',
        typeLabel: 'Clave de Licencia',
        icon: 'ShieldCheck',
        productName: item.name,
        details: [
          { label: 'Product Key', value: genKey() },
          { label: 'Tipo de Licencia', value: 'Original / Activación Online' },
          { label: 'Plataforma', value: item.platform },
          { label: 'Activaciones', value: '1 PC' },
        ],
        instructions: `1. Descarga ${item.name.includes('Windows') ? 'Windows 11' : item.name.includes('Office') ? 'Microsoft Office 2024' : 'el software'} desde el sitio oficial\n2. Durante la instalación, ingresa la Product Key\n3. Activa en línea cuando te lo pida el sistema`,
      });
    } else if (cat === 'subscriptions') {
      if (item.name.toLowerCase().includes('discord')) {
        deliveries.push({
          type: 'giftcard',
          typeLabel: 'Código de Activación',
          icon: 'Ticket',
          productName: item.name,
          details: [
            { label: 'Código Nitro', value: genCodeDash(4, 4) },
            { label: 'Duración', value: '3 meses' },
            { label: 'Tipo', value: 'Discord Nitro Full' },
          ],
          instructions: `1. Abre Discord > Configuración de Usuario > Gift Inventory\n2. Haz clic en "Canjear Código"\n3. Ingresa el código y disfruta 3 meses de Nitro`,
        });
      } else if (item.name.toLowerCase().includes('youtube')) {
        deliveries.push({
          type: 'credentials',
          typeLabel: 'Credenciales de Acceso',
          icon: 'KeyRound',
          productName: item.name,
          details: [
            { label: 'Email', value: genEmail() },
            { label: 'Contraseña', value: genPass() },
            { label: 'Servicio', value: 'YouTube Premium + Music' },
            { label: 'Duración', value: '3 meses' },
          ],
          instructions: `1. Abre YouTube en tu navegador o app\n2. Inicia sesión con el email y contraseña proporcionados\n3. YouTube Premium se activará automáticamente`,
        });
      } else if (item.name.toLowerCase().includes('game pass') || item.name.toLowerCase().includes('xbox')) {
        deliveries.push({
          type: 'giftcard',
          typeLabel: 'Código de Canje',
          icon: 'Ticket',
          productName: item.name,
          details: [
            { label: 'Código de Canje', value: genCodeDash(4, 4) },
            { label: 'Producto', value: 'Game Pass Ultimate' },
            { label: 'Duración', value: '1 mes' },
          ],
          instructions: `1. Ve a xbox.com/redeem\n2. Inicia sesión con tu cuenta de Microsoft\n3. Ingresa el código y Game Pass Ultimate se activará`,
        });
      } else {
        deliveries.push({
          type: 'giftcard',
          typeLabel: 'Código de Suscripción',
          icon: 'Ticket',
          productName: item.name,
          details: [
            { label: 'Código de Activación', value: genCodeDash(4, 4) },
            { label: 'Servicio', value: item.platform },
          ],
          instructions: `1. Ve a la página oficial de ${item.platform}\n2. Busca la opción de canjear código\n3. Ingresa el código proporcionado`,
        });
      }
    } else {
      deliveries.push({
        type: 'giftcard',
        typeLabel: 'Código Digital',
        icon: 'Ticket',
        productName: item.name,
        details: [
          { label: 'Código', value: genCodeDash(4, 4) },
          { label: 'Producto', value: item.name },
        ],
        instructions: `Usa este código en ${item.platform} para activar tu producto.`,
      });
    }
  }

  return deliveries;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { items, email, userId } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  const orderId = `DG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const total = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);

  const allDeliveries = items.flatMap((item: { id: string; name: string; platform: string; category: string; quantity: number }) => generateDeliveryData(item));

  return NextResponse.json({
    success: true,
    orderId,
    total,
    email,
    date: new Date().toISOString(),
    message: '¡Pedido procesado con éxito! Tus productos digitales están listos.',
    estimatedDelivery: 'Entrega instantánea',
    deliveries: allDeliveries,
    deliveryMethods: {
      email: `También enviamos una copia a ${email}`,
      account: 'Puedes ver tus compras desde tu cuenta de usuario',
    },
  });
}
