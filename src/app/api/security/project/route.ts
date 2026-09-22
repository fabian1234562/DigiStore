import { NextResponse } from 'next/server';
import type { SecurityProject } from '../search/route';

/**
 * GET /api/security/project?owner=owner/repo
 * GET /api/security/project?id=123456
 *
 * Returns full project details + similar projects (same category).
 * Uses GitHub REST API:
 *   - GET /repos/{owner}/{repo}
 *   - GET /repositories/{id}
 *
 * Caches responses for 10 min.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const CACHE_TTL_MS = 10 * 60 * 1000;

const cache = new Map<string, { at: number; payload: unknown }>();

function cacheGet<T>(key: string): T | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return e.payload as T;
}
function cacheSet(key: string, payload: unknown) {
  cache.set(key, { at: Date.now(), payload });
  if (cache.size > 100) {
    const k = cache.keys().next().value;
    if (k) cache.delete(k);
  }
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  updated_at: string;
  pushed_at: string;
  created_at: string;
  archived: boolean;
  fork: boolean;
  html_url: string;
  homepage: string | null;
  topics?: string[];
  license: { key: string; name: string } | null;
  owner: { login: string; avatar_url: string };
}

function mapRepoToProject(repo: GitHubRepo, category: string | null): SecurityProject {
  return {
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || 'Sin descripción disponible.',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    language: repo.language,
    lastUpdate: repo.pushed_at || repo.updated_at,
    license: repo.license?.name || repo.license?.key || null,
    topics: repo.topics || [],
    url: repo.html_url,
    ownerAvatar: repo.owner.avatar_url,
    homepage: repo.homepage || null,
    archived: repo.archived,
    category: category || 'general',
  };
}

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'DigiStore-Security',
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  return headers;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const id = searchParams.get('id');

  if (!owner && !id) {
    return NextResponse.json(
      { error: 'Parámetros requeridos: ?owner=owner/repo o ?id=12345' },
      { status: 400 },
    );
  }

  const cacheKey = `proj|${owner || ''}|${id || ''}`;
  const cached = cacheGet<{ project: SecurityProject; similar: SecurityProject[] }>(cacheKey);
  if (cached) {
    return NextResponse.json({ success: true, cached: true, ...cached });
  }

  const headers = ghHeaders();

  try {
    // Fetch repo details
    let repoUrl: string;
    if (owner) {
      const [own, name] = owner.split('/');
      if (!own || !name) {
        return NextResponse.json(
          { error: 'Formato de owner inválido. Usa owner/repo.' },
          { status: 400 },
        );
      }
      repoUrl = `https://api.github.com/repos/${own}/${name}`;
    } else {
      repoUrl = `https://api.github.com/repositories/${id}`;
    }

    const repoRes = await fetch(repoUrl, { headers, next: { revalidate: 0 } });

    if (repoRes.status === 403 || repoRes.status === 429) {
      return NextResponse.json(
        { error: 'GitHub API: límite de peticiones alcanzado.', rateLimited: true },
        { status: 429 },
      );
    }
    if (repoRes.status === 404) {
      return NextResponse.json(
        { error: 'Repositorio no encontrado en GitHub.' },
        { status: 404 },
      );
    }
    if (!repoRes.ok) {
      return NextResponse.json(
        { error: `GitHub API respondió ${repoRes.status}` },
        { status: 502 },
      );
    }

    const repo = (await repoRes.json()) as GitHubRepo;

    // Detect category from topics
    const topicSet = new Set(repo.topics || []);
    let category: string | null = null;
    const CATEGORY_TOPICS: Record<string, string[]> = {
      'red-team': ['red-team', 'penetration-testing', 'ethical-hacking', 'offensive-security'],
      'blue-team': ['blue-team', 'defensive-security', 'incident-response'],
      osint: ['osint'],
      ctf: ['ctf', 'capture-the-flag'],
      'bug-bounty': ['bug-bounty', 'bounty'],
      'digital-forensics': ['digital-forensics', 'forensics', 'dfir'],
      privacy: ['privacy', 'anonymity'],
      'network-security': ['network-security'],
      'cloud-security': ['cloud-security'],
      'malware-analysis': ['malware-analysis', 'malware'],
      cryptography: ['cryptography', 'crypto'],
      'security-automation': ['security-automation'],
      'web-security': ['web-security', 'webapp-security'],
      'wireless-security': ['wireless-security', 'wifi'],
      'reverse-engineering': ['reverse-engineering'],
      'soc-siem': ['siem', 'soc', 'threat-intelligence'],
    };
    for (const [key, topics] of Object.entries(CATEGORY_TOPICS)) {
      if (topics.some((t) => topicSet.has(t))) {
        category = key;
        break;
      }
    }

    const project = mapRepoToProject(repo, category);

    // Fetch similar projects via search API (use our own endpoint logic inline
    // to keep things simple — call GitHub search with same category).
    let similar: SecurityProject[] = [];
    if (category) {
      try {
        const searchUrl = new URL('https://api.github.com/search/repositories');
        const topicGroup = `(${CATEGORY_TOPICS[category].map((t) => `topic:${t}`).join(' ')})`;
        searchUrl.searchParams.set(
          'q',
          `${topicGroup} stars:>100 fork:false archived:false is:public`,
        );
        searchUrl.searchParams.set('sort', 'stars');
        searchUrl.searchParams.set('order', 'desc');
        searchUrl.searchParams.set('per_page', '12');

        const searchRes = await fetch(searchUrl, { headers, next: { revalidate: 0 } });
        if (searchRes.ok) {
          const data = (await searchRes.json()) as {
            items: GitHubRepo[];
          };
          similar = data.items
            .filter((it) => it.id !== repo.id)
            .slice(0, 6)
            .map((it) => mapRepoToProject(it, category));
        }
      } catch {
        // similar is best-effort; ignore failures
      }
    }

    const payload = { project, similar };
    cacheSet(cacheKey, payload);

    return NextResponse.json({ success: true, cached: false, ...payload });
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error al contactar GitHub API', detail: m }, { status: 500 });
  }
}
