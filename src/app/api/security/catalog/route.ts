import { NextResponse } from 'next/server';
import { listImportedProjects } from '@/lib/security-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/security/catalog
 *   ?category=osint    — filter by category key
 *   ?q=search          — case-insensitive search over name/description/topics
 *
 * Returns all imported/downloadable projects. Each project has:
 *   id, name, description, author, license, stars, language, category,
 *   imageUrl, importedAt, hasDownload
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category')?.trim() || null;
  const q = searchParams.get('q')?.trim().toLowerCase() || '';

  let projects = listImportedProjects();

  if (category && category !== 'all') {
    projects = projects.filter((p) => p.category === category);
  }

  if (q) {
    projects = projects.filter((p) => {
      const haystack = [
        p.name,
        p.description,
        p.author,
        p.repo,
        ...(p.topics || []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  // Newest imports first
  projects.sort(
    (a, b) =>
      new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime(),
  );

  return NextResponse.json({
    success: true,
    count: projects.length,
    projects,
  });
}
