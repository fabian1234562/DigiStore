import { NextResponse } from 'next/server';
import { getImportedProject, ghHeaders } from '@/lib/security-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/security/download/[id]
 *
 * Streams a ZIP of the project from GitHub's zipball API directly to the user,
 * without modifying the archive. Serverless can't add files to a ZIP without
 * pulling the whole thing into memory (and we don't want to), so we just proxy
 * the original archive as-is. Filename: {projectName}-digistore.zip
 *
 * If the project is not imported, returns 404.
 *
 * URL format on GitHub's side:
 *   https://api.github.com/repos/{owner}/{repo}/zipball/{ref}
 *
 * We try HEAD/main first, then master as fallback. If neither resolves we 404.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { error: 'ID de proyecto inválido.' },
      { status: 400 },
    );
  }

  const project = getImportedProject(id);
  if (!project) {
    return NextResponse.json(
      { error: 'Proyecto no importado en DigiStore.' },
      { status: 404 },
    );
  }

  if (!project.canRedistribute) {
    return NextResponse.json(
      {
        error: `La licencia "${project.licenseName}" no permite redistribución.`,
      },
      { status: 403 },
    );
  }

  const [owner, name] = project.repo.split('/');
  if (!owner || !name) {
    return NextResponse.json(
      { error: 'Slug de repo inválido.' },
      { status: 400 },
    );
  }

  // We try HEAD (default branch), then main, then master.
  // GitHub's zipball endpoint accepts a ref name; the HEAD alias resolves to
  // the default branch automatically.
  const refsToTry = ['HEAD', 'main', 'master'];

  let upstream: Response | null = null;
  let lastStatus = 0;

  for (const ref of refsToTry) {
    const url = `https://api.github.com/repos/${owner}/${name}/zipball/${ref}`;
    const res = await fetch(url, {
      headers: ghHeaders(),
      // Important: don't let Next/Node cache the streamed body
      cache: 'no-store',
      redirect: 'follow',
    });
    lastStatus = res.status;
    if (res.ok && res.body) {
      upstream = res;
      break;
    }
    // 404 → try next ref. 403/429 → rate limited.
    if (res.status === 403 || res.status === 429) {
      return NextResponse.json(
        {
          error:
            'GitHub API: límite de peticiones alcanzado. Intenta más tarde.',
          rateLimited: true,
        },
        { status: 429 },
      );
    }
    // Otherwise (404), try next ref
  }

  if (!upstream || !upstream.body) {
    return NextResponse.json(
      {
        error: `No se pudo descargar el ZIP del repositorio (último status: ${lastStatus}).`,
      },
      { status: 502 },
    );
  }

  // Pass-through the ZIP stream. Filename: {projectName}-digistore.zip
  const safeName = project.name.replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 60);
  const filename = `${safeName}-digistore.zip`;

  const headers = new Headers();
  headers.set(
    'Content-Type',
    upstream.headers.get('content-type') || 'application/zip',
  );
  const contentLength = upstream.headers.get('content-length');
  if (contentLength) headers.set('Content-Length', contentLength);
  headers.set(
    'Content-Disposition',
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );
  headers.set('Cache-Control', 'no-store');
  headers.set('X-DigiStore-Project', project.id);
  headers.set('X-DigiStore-Repo', project.repo);

  return new Response(upstream.body, {
    status: 200,
    headers,
  });
}

// Suppress headers that would cache this in Vercel's CDN.
export const fetchCache = 'force-no-store';
