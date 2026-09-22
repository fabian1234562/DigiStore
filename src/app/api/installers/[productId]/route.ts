import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { SEED_GAMES } from '@/lib/game-scanner/seed-data';

/**
 * GET /api/installers/[productId]
 *
 * Para apps open source (Lapce, OBS, VSCodium, etc.):
 *   1. Lee el repo de GitHub desde el claimUrl del seed-data
 *   2. Llama a la API de GitHub releases/latest para encontrar el instalador
 *   3. Descarga el binario (Windows .exe / .msi o universal .zip)
 *   4. Cachea en /public/downloads/installers/[productId].ext
 *   5. Sirve el binario con Content-Disposition: attachment
 *
 * Si la API de GitHub falla, fallback a redirigir al usuario a la página de releases.
 */

const CACHE_DIR = path.join(process.cwd(), 'public', 'downloads', 'installers');

interface GitHubAsset {
  name: string;
  browser_download_url: string;
  content_type: string;
  size: number;
}

interface GitHubReleaseResponse {
  tag_name: string;
  name: string | null;
  assets: GitHubAsset[];
  html_url: string;
}

/**
 * Determina cuál es el mejor asset para descargar según el nombre del archivo.
 * Prioriza Windows (mayoría de usuarios), luego universal, luego Mac.
 */
function pickBestAsset(assets: GitHubAsset[]): GitHubAsset | null {
  if (!assets || assets.length === 0) return null;

  // Patrones para Windows (prioridad)
  const winPatterns = [
    /\.exe$/i, /\.msi$/i,
    /windows.*\.(exe|msi|zip)$/i,
    /win.*\.(exe|msi|zip)$/i,
    /x64.*\.(exe|msi|zip)$/i,
    /setup.*\.(exe|msi|zip)$/i,
    /installer.*\.(exe|msi|zip)$/i,
  ];

  // Patrones universal
  const universalPatterns = [
    /\.zip$/i, /universal/i, /all.*platforms/i, /portable/i,
  ];

  // Patrones Mac
  const macPatterns = [
    /\.dmg$/i, /\.pkg$/i, /macos.*\.(dmg|pkg|zip)$/i, /darwin/i,
  ];

  // 1. Buscar Windows
  for (const pattern of winPatterns) {
    for (const asset of assets) {
      if (pattern.test(asset.name)) return asset;
    }
  }

  // 2. Buscar universal (zip)
  for (const pattern of universalPatterns) {
    for (const asset of assets) {
      if (pattern.test(asset.name)) return asset;
    }
  }

  // 3. Buscar Mac
  for (const pattern of macPatterns) {
    for (const asset of assets) {
      if (pattern.test(asset.name)) return asset;
    }
  }

  // 4. Fallback: primer asset que sea binario
  return assets.find(a =>
    !a.name.endsWith('.txt') &&
    !a.name.endsWith('.sha256') &&
    !a.name.endsWith('.sig') &&
    !a.name.endsWith('.blockmap') &&
    !a.name.endsWith('.yml') &&
    !a.name.endsWith('latest.yml') &&
    !a.name.endsWith('.json')
  ) || null;
}

/**
 * Extrae el owner/repo de una URL de GitHub releases.
 */
function parseGithubRepo(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/releases/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;

  if (!productId || !/^[a-zA-Z0-9_-]+$/.test(productId)) {
    return NextResponse.json(
      { error: 'invalid_product_id', productId },
      { status: 400 }
    );
  }

  // Buscar producto en SEED_GAMES
  const game = SEED_GAMES.find(g => g.id === productId);
  if (!game) {
    return NextResponse.json(
      { error: 'product_not_found', message: `Producto no encontrado: ${productId}` },
      { status: 404 }
    );
  }

  const claimUrl = game.claimUrl || '';
  if (!claimUrl.includes('github.com/') || !claimUrl.includes('/releases')) {
    return NextResponse.json(
      { error: 'not_open_source', message: 'Este producto no es open source descargable' },
      { status: 404 }
    );
  }

  const repo = parseGithubRepo(claimUrl);
  if (!repo) {
    return NextResponse.json(
      { error: 'invalid_github_url', message: 'URL de GitHub inválida' },
      { status: 400 }
    );
  }

  // ─── 1. Buscar en caché local ───
  // Como no sabemos la extensión, probamos las más comunes
  const possibleExts = ['exe', 'msi', 'zip', 'dmg', 'pkg'];
  for (const ext of possibleExts) {
    const cachedPath = path.join(CACHE_DIR, `${productId}.${ext}`);
    try {
      const stat = await fs.stat(cachedPath);
      if (stat.isFile() && stat.size > 1024) {
        const fileBuffer = await fs.readFile(cachedPath);
        const mime = ext === 'zip' ? 'application/zip'
                   : ext === 'exe' || ext === 'msi' ? 'application/octet-stream'
                   : ext === 'dmg' || ext === 'pkg' ? 'application/x-apple-diskimage'
                   : 'application/octet-stream';
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': mime,
            'Content-Disposition': `attachment; filename="${productId}.${ext}"`,
            'Content-Length': String(fileBuffer.length),
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    } catch {
      // No existe con esta extensión, probar la siguiente
    }
  }

  // ─── 2. Consultar GitHub releases API ───
  const githubApiUrl = `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases/latest`;
  let release: GitHubReleaseResponse;
  try {
    const res = await fetch(githubApiUrl, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'DigiStore-Installer-Downloader',
      },
      next: { revalidate: 3600 }, // 1h cache
    });

    if (!res.ok) {
      // Si GitHub devuelve 404, el repo no tiene releases → fallback a la página de releases
      if (res.status === 404) {
        return NextResponse.redirect(claimUrl, 302);
      }
      return NextResponse.json(
        { error: 'github_api_error', message: `GitHub API ${res.status}` },
        { status: 502 }
      );
    }
    release = await res.json() as GitHubReleaseResponse;
  } catch (err) {
    return NextResponse.json(
      { error: 'github_unreachable', message: err instanceof Error ? err.message : 'unknown' },
      { status: 502 }
    );
  }

  const bestAsset = pickBestAsset(release.assets || []);
  if (!bestAsset) {
    // Sin assets binarios → redirigir a la página de releases
    return NextResponse.redirect(release.html_url || claimUrl, 302);
  }

  // ─── 3. Descargar el binario desde GitHub ───
  try {
    const assetRes = await fetch(bestAsset.browser_download_url, {
      headers: { 'User-Agent': 'DigiStore-Installer-Downloader' },
    });
    if (!assetRes.ok) {
      return NextResponse.redirect(bestAsset.browser_download_url, 302);
    }
    const arrayBuffer = await assetRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ─── 4. Determinar extensión desde el nombre del asset ───
    const extMatch = bestAsset.name.match(/\.(exe|msi|zip|dmg|pkg|AppImage|deb|rpm)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'bin';

    // ─── 5. Cachear en disco ───
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const cachedPath = path.join(CACHE_DIR, `${productId}.${ext}`);
    await fs.writeFile(cachedPath, buffer);

    // ─── 6. Servir el binario ───
    const mime = ext === 'zip' ? 'application/zip'
               : ext === 'exe' || ext === 'msi' ? 'application/octet-stream'
               : ext === 'dmg' || ext === 'pkg' ? 'application/x-apple-diskimage'
               : ext === 'appimage' ? 'application/vnd.appimage'
               : ext === 'deb' || ext === 'rpm' ? 'application/x-debian-package'
               : 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${bestAsset.name}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    console.error('[installers] Error downloading:', err);
    // Fallback: redirigir al asset directo
    return NextResponse.redirect(bestAsset.browser_download_url, 302);
  }
}
