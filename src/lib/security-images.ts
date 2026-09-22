/**
 * Resuelve la imagen de preview para un proyecto de seguridad/hacking.
 *
 * Estrategia de fallback (de mejor a peor):
 *  1. Imagen OpenGraph de GitHub (si el repo tiene un README vistoso).
 *  2. Imagen local de categoría (descargada de internet, real y llamativa).
 *  3. Avatar del owner de GitHub (zoomed).
 *  4. SVG generado dinámicamente.
 *
 * Esto asegura que TODOS los productos de hacking tengan una imagen
 * llamativa y relevante, sin exceptions ni imágenes rotas.
 */

export const SECURITY_CATEGORY_IMAGES: Record<string, string> = {
  'red-team':            '/images/security/red-team.jpg',
  'blue-team':           '/images/security/blue-team.jpg',
  'osint':               '/images/security/osint.jpg',
  'ctf':                 '/images/security/ctf.jpg',
  'bug-bounty':          '/images/security/bug-bounty.jpg',
  'digital-forensics':   '/images/security/digital-forensics.jpg',
  'privacy':             '/images/security/privacy.jpg',
  'network-security':    '/images/security/network-security.jpg',
  'cloud-security':      '/images/security/cloud-security.jpg',
  'malware-analysis':    '/images/security/malware-analysis.jpg',
  'cryptography':        '/images/security/cryptography.jpg',
  'security-automation': '/images/security/security-automation.jpg',
  'web-security':        '/images/security/web-security.jpg',
  'wireless-security':   '/images/security/wireless-security.jpg',
  'reverse-engineering': '/images/security/reverse-engineering.jpg',
  'soc-siem':           '/images/security/soc-siem.jpg',
  'general':             '/images/security/general.jpg',
};

/**
 * Devuelve la imagen de categoría local correspondiente al slug.
 * Si la categoría no está mapeada, retorna el fallback genérico.
 */
export function getCategoryImage(category: string | null | undefined): string {
  if (!category) return SECURITY_CATEGORY_IMAGES['general'];
  return SECURITY_CATEGORY_IMAGES[category] || SECURITY_CATEGORY_IMAGES['general'];
}

/**
 * Etiqueta legible para mostrar al usuario (badge, alt text, etc.)
 */
export const CATEGORY_LABELS: Record<string, string> = {
  'red-team':            'Red Team',
  'blue-team':           'Blue Team',
  'osint':               'OSINT',
  'ctf':                 'CTF',
  'bug-bounty':          'Bug Bounty',
  'digital-forensics':   'Digital Forensics',
  'privacy':             'Privacy',
  'network-security':    'Network Security',
  'cloud-security':      'Cloud Security',
  'malware-analysis':    'Malware Analysis',
  'cryptography':        'Cryptography',
  'security-automation': 'Security Automation',
  'web-security':        'Web Security',
  'wireless-security':   'Wireless Security',
  'reverse-engineering': 'Reverse Engineering',
  'soc-siem':           'SOC / SIEM',
  'general':            'General Security',
};

export function getCategoryLabel(category: string | null | undefined): string {
  if (!category) return CATEGORY_LABELS['general'];
  return CATEGORY_LABELS[category] || CATEGORY_LABELS['general'];
}

/**
 * Emoji representativo por categoría (para badges/overlays).
 */
export const CATEGORY_EMOJIS: Record<string, string> = {
  'red-team':            '🔴',
  'blue-team':           '🔵',
  'osint':               '🔍',
  'ctf':                 '🎯',
  'bug-bounty':          '🐛',
  'digital-forensics':   '🔬',
  'privacy':             '🛡',
  'network-security':    '📡',
  'cloud-security':      '☁',
  'malware-analysis':    '🧪',
  'cryptography':        '🔐',
  'security-automation': '🤖',
  'web-security':        '🌐',
  'wireless-security':   '📶',
  'reverse-engineering': '🧠',
  'soc-siem':           '📊',
  'general':            '🛡',
};

export function getCategoryEmoji(category: string | null | undefined): string {
  if (!category) return CATEGORY_EMOJIS['general'];
  return CATEGORY_EMOJIS[category] || CATEGORY_EMOJIS['general'];
}
