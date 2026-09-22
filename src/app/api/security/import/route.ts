import { NextResponse } from 'next/server';
import {
  analyzeRepo,
  addImportedProject,
  getImportedByRepo,
  isValidRepoSlug,
  normalizeRepoSlug,
  type ImportedProject,
} from '@/lib/security-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * POST /api/security/import
 * Body: { repo: "owner/repo" }
 *
 * Flow:
 *   1. Validate `repo` slug.
 *   2. Call analyze() internally (shared module, no HTTP roundtrip).
 *   3. Check license allows redistribution (permissive).
 *   4. Check not already imported (dedupe by repo slug).
 *   5. Check not archived.
 *   6. Check has activity (pushed within the last 2 years).
 *   7. Store the project metadata in the in-memory Map.
 *
 * Returns: { success, projectId, message }
 *
 * GET /api/security/import
 *   Returns all imported projects (same shape as /api/security/catalog, kept
 *   here for convenience).
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

  // Anti-duplicate
  if (getImportedByRepo(repo)) {
    return NextResponse.json({
      success: true,
      alreadyImported: true,
      projectId: getImportedByRepo(repo)!.id,
      message: 'Este proyecto ya está importado en DigiStore.',
    });
  }

  try {
    const analysis = await analyzeRepo(repo);

    // Validation checks (in order):
    if (analysis.archived) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No se puede importar: el repositorio está archivado en GitHub.',
        },
        { status: 400 },
      );
    }

    if (!analysis.license.canRedistribute) {
      return NextResponse.json(
        {
          success: false,
          error: `Licencia "${analysis.license.name}" no permite redistribución automática (${analysis.license.emoji} ${analysis.license.label}).`,
          license: analysis.license,
        },
        { status: 403 },
      );
    }

    // Activity check — must have pushed within the last 2 years
    const lastPushMs = new Date(analysis.lastUpdate).getTime();
    const TWO_YEARS_MS = 2 * 365 * 24 * 60 * 60 * 1000;
    if (!Number.isFinite(lastPushMs) || Date.now() - lastPushMs > TWO_YEARS_MS) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No se puede importar: el repositorio no tiene actividad reciente (>2 años sin actualizaciones).',
        },
        { status: 400 },
      );
    }

    const projectId = `ds-${analysis.repo.replace('/', '-')}`;
    const project: ImportedProject = {
      id: projectId,
      repoId: 0, // not used in catalog flow; we use string id
      repo: analysis.repo,
      name: analysis.name,
      description: analysis.description,
      author: analysis.author,
      licenseKey: analysis.license.key,
      licenseName: analysis.license.name,
      licenseStatus: analysis.license.status,
      licenseLabel: analysis.license.label,
      licenseEmoji: analysis.license.emoji,
      canRedistribute: analysis.license.canRedistribute,
      stars: analysis.stars,
      forks: analysis.forks,
      language: analysis.language,
      category: analysis.category,
      topics: analysis.topics,
      imageUrl: analysis.imageUrl,
      ownerAvatar: analysis.ownerAvatar,
      repoUrl: analysis.repoUrl,
      homepage: analysis.homepage,
      releaseVersion: analysis.releaseVersion,
      fileSize: analysis.fileSize,
      fileCount: analysis.fileCount,
      readmeContent: analysis.readmeContent,
      lastUpdate: analysis.lastUpdate,
      archived: analysis.archived,
      importedAt: new Date().toISOString(),
      hasDownload: true,
    };

    addImportedProject(project);

    return NextResponse.json({
      success: true,
      projectId: project.id,
      message: `Proyecto "${project.name}" importado correctamente a DigiStore.`,
      project,
    });
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
      { error: 'Error al importar el proyecto', detail: message },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Convenience: list imported projects (same shape as /catalog)
  const { listImportedProjects } = await import('@/lib/security-store');
  return NextResponse.json({
    success: true,
    projects: listImportedProjects(),
    count: listImportedProjects().length,
  });
}
