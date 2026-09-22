import { NextResponse } from 'next/server';
import {
  analyzeRepo,
  getAnalyzeCache,
  isValidRepoSlug,
  normalizeRepoSlug,
} from '@/lib/security-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/security/analyze
 * Body: { repo: "owner/repo" }
 *
 * Calls GitHub API to gather:
 *   - repo info (stars, forks, language, topics, archived, dates)
 *   - license (with redistribution status derived from SPDX key)
 *   - README (raw markdown)
 *   - latest release tag (best-effort)
 *   - root contents (file count + total size)
 *
 * Caches results for 30 minutes. Does NOT execute any code from the repo.
 */
export async function POST(request: Request) {
  let body: { repo?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Body JSON inválido.' },
      { status: 400 },
    );
  }

  const repoRaw = body?.repo;
  if (!repoRaw || typeof repoRaw !== 'string') {
    return NextResponse.json(
      { error: 'Parámetro "repo" requerido (formato: owner/repo).' },
      { status: 400 },
    );
  }

  if (!isValidRepoSlug(repoRaw)) {
    return NextResponse.json(
      { error: 'Formato de repo inválido. Usa "owner/repo".' },
      { status: 400 },
    );
  }

  const repo = normalizeRepoSlug(repoRaw);

  // 30-min cache hit
  const cached = getAnalyzeCache(repo);
  if (cached) {
    return NextResponse.json({ success: true, cached: true, analysis: cached });
  }

  try {
    const analysis = await analyzeRepo(repo);
    return NextResponse.json({ success: true, cached: false, analysis });
  } catch (err) {
    const e = err as Error & { rateLimited?: boolean; notFound?: boolean };
    if (e.rateLimited) {
      return NextResponse.json(
        {
          error:
            'GitHub API: límite de peticiones alcanzado. Intenta más tarde.',
          rateLimited: true,
        },
        { status: 429 },
      );
    }
    if (e.notFound) {
      return NextResponse.json(
        { error: 'Repositorio no encontrado en GitHub.' },
        { status: 404 },
      );
    }
    const message = e.message || 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al analizar el repositorio', detail: message },
      { status: 500 },
    );
  }
}

/**
 * GET /api/security/analyze?repo=owner/repo
 * Convenience GET wrapper around POST.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repoRaw = searchParams.get('repo') || '';
  return POST(
    new Request(request.url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ repo: repoRaw }),
    }),
  );
}
