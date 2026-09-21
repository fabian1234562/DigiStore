import { NextResponse } from 'next/server';

/**
 * DigiStore Security — GitHub API proxy
 *
 * Searches GitHub for real open-source cybersecurity repositories.
 * - Uses GitHub Personal Access Token (env GITHUB_TOKEN or fallback).
 * - In-memory cache (10 min TTL) to avoid rate limits.
 * - Self-imposed rate limit: max 20 requests / minute to GitHub.
 * - Filters out forks, archived repos, repos without description, <100 stars.
 *
 * Query params:
 *   q         — free text search (optional)
 *   category  — one of: red-team | blue-team | osint | ctf | bug-bounty |
 *               digital-forensics | privacy | network-security | cloud-security |
 *               malware-analysis | cryptography | security-automation |
 *               web-security | wireless-security | reverse-engineering | soc-siem
 *   sort      — stars | forks | updated | newest | trending (default: trending)
 *   per_page  — 1..100 (default: 30, capped to 100)
 *   page      — 1..N (default: 1)
 *
 * Strategy:
 *   - If category is provided: use that category's primary topic for a single
 *     paginated query.
 *   - If no category but `q` is provided: use `topic:cybersecurity` plus the
 *     search term, with native GitHub pagination.
 *   - If no category and no `q` (pure browse): issue parallel queries for a
 *     curated set of primary topics, merge & dedupe (page 1 only).
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_MIN = 20; // self-imposed guard (GitHub allows 30/min authed)
const MIN_STARS = 100;

type SortKey = 'stars' | 'forks' | 'updated' | 'newest' | 'trending';

interface CategoryDef {
  label: string;
  primary: string; // GitHub topic used for the main query
}

const CATEGORY_MAP: Record<string, CategoryDef> = {
  'red-team': { label: 'Red Team', primary: 'penetration-testing' },
  'blue-team': { label: 'Blue Team', primary: 'incident-response' },
  osint: { label: 'OSINT', primary: 'osint' },
  ctf: { label: 'CTF', primary: 'ctf' },
  'bug-bounty': { label: 'Bug Bounty', primary: 'bug-bounty' },
  'digital-forensics': { label: 'Digital Forensics', primary: 'digital-forensics' },
  privacy: { label: 'Privacy', primary: 'privacy' },
  'network-security': { label: 'Network Security', primary: 'network-security' },
  'cloud-security': { label: 'Cloud Security', primary: 'cloud-security' },
  'malware-analysis': { label: 'Malware Analysis', primary: 'malware-analysis' },
  cryptography: { label: 'Cryptography', primary: 'cryptography' },
  'security-automation': { label: 'Security Automation', primary: 'security-automation' },
  'web-security': { label: 'Web Security', primary: 'web-security' },
  'wireless-security': { label: 'Wireless Security', primary: 'wireless-security' },
  'reverse-engineering': { label: 'Reverse Engineering', primary: 'reverse-engineering' },
  'soc-siem': { label: 'SOC / SIEM', primary: 'threat-intelligence' },
};

// Topics used in browse mode (no category, no q). We issue parallel queries
// for each and merge the results.
const BROWSE_TOPICS = [
  'cybersecurity',
  'security-tools',
  'osint',
  'penetration-testing',
];

// Used as the base topic when the user searches with no category picked.
const DEFAULT_SEARCH_TOPIC = 'cybersecurity';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory cache + rate limit
// ─────────────────────────────────────────────────────────────────────────────

interface CacheEntry {
  at: number;
  payload: unknown;
}
const cache = new Map<string, CacheEntry>();

const requestTimestamps: number[] = [];

function rateLimitOk(n = 1): boolean {
  const now = Date.now();
  while (requestTimestamps.length && now - requestTimestamps[0] > 60_000) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length + n > MAX_REQUESTS_PER_MIN) return false;
  for (let i = 0; i < n; i++) requestTimestamps.push(now);
  return true;
}

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
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SecurityProject {
  id: number;
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  lastUpdate: string;
  license: string | null;
  topics: string[];
  url: string;
  ownerAvatar: string;
  homepage: string | null;
  archived: boolean;
  category: string;
  ogImage?: string;
}

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Array<{
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
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function ghHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'DigiStore-Security',
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  return headers;
}

function mapSort(sort: SortKey): 'stars' | 'forks' | 'updated' {
  if (sort === 'stars') return 'stars';
  if (sort === 'forks') return 'forks';
  return 'updated';
}

function buildQueryParts(topic: string, q: string | null): string {
  const parts: string[] = [`topic:${topic}`];
  if (q && q.trim()) {
    const sanitized = q.trim().replace(/[^\w\s.-]/g, ' ').slice(0, 100);
    if (sanitized) parts.push(`${sanitized} in:name,description,readme`);
  }
  parts.push(`stars:>${MIN_STARS - 1}`);
  parts.push('fork:false');
  parts.push('archived:false');
  parts.push('is:public');
  return parts.join(' ');
}

function mapItemToProject(
  item: GitHubSearchResponse['items'][number],
  category: string | null,
): SecurityProject {
  let detectedCategory = category || 'general';
  if (!category && item.topics && item.topics.length) {
    for (const [key, def] of Object.entries(CATEGORY_MAP)) {
      if (item.topics.includes(def.primary)) {
        detectedCategory = key;
        break;
      }
    }
  }
  return {
    id: item.id,
    name: item.name,
    fullName: item.full_name,
    description: item.description || 'Sin descripción disponible.',
    stars: item.stargazers_count,
    forks: item.forks_count,
    openIssues: item.open_issues_count,
    language: item.language,
    lastUpdate: item.pushed_at || item.updated_at,
    license: item.license?.name || item.license?.key || null,
    topics: item.topics || [],
    url: item.html_url,
    ownerAvatar: item.owner.avatar_url,
    homepage: item.homepage || null,
    archived: item.archived,
    category: detectedCategory,
    // Open Graph image URL (GitHub generates one per repo)
    ogImage: `https://opengraph.githubassets.com/1/${item.full_name}`,
  };
}

function trendingScore(p: SecurityProject): number {
  const daysSinceUpdate =
    (Date.now() - new Date(p.lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 365 - daysSinceUpdate) / 365;
  return p.stars * (1 + recencyBoost);
}

function sortProjects(projects: SecurityProject[], sort: SortKey): SecurityProject[] {
  const arr = [...projects];
  switch (sort) {
    case 'trending':
      arr.sort((a, b) => trendingScore(b) - trendingScore(a));
      break;
    case 'newest':
    case 'updated':
      arr.sort(
        (a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime(),
      );
      break;
    case 'stars':
      arr.sort((a, b) => b.stars - a.stars);
      break;
    case 'forks':
      arr.sort((a, b) => b.forks - a.forks);
      break;
  }
  return arr;
}

function filterValid(items: GitHubSearchResponse['items']): GitHubSearchResponse['items'] {
  return items.filter(
    (it) =>
      !it.fork &&
      !it.archived &&
      it.description &&
      it.description.trim().length > 0 &&
      it.stargazers_count >= MIN_STARS,
  );
}

/**
 * Single GitHub search query (paginated).
 */
async function searchSingle(
  topic: string,
  q: string | null,
  sort: SortKey,
  perPage: number,
  page: number,
  category: string | null,
): Promise<{ projects: SecurityProject[]; totalCount: number }> {
  const url = new URL('https://api.github.com/search/repositories');
  url.searchParams.set('q', buildQueryParts(topic, q));
  url.searchParams.set('sort', mapSort(sort));
  url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(page));

  const res = await fetch(url, { headers: ghHeaders(), next: { revalidate: 0 } });

  if (res.status === 403 || res.status === 429) {
    const err = new Error('GITHUB_RATE_LIMIT') as Error & { rateLimited?: boolean };
    err.rateLimited = true;
    throw err;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as GitHubSearchResponse;
  const projects = filterValid(data.items).map((it) => mapItemToProject(it, category));
  return { projects, totalCount: data.total_count };
}

/**
 * Browse mode: issue parallel queries for several primary topics, merge &
 * dedupe. Page 1 only (no real pagination across topics).
 */
async function searchBrowse(
  q: string | null,
  sort: SortKey,
  perPage: number,
): Promise<{ projects: SecurityProject[]; totalCount: number }> {
  // Fetch a wider pool per topic, then dedupe & sort.
  const fetchPerTopic = Math.min(50, perPage * 3);

  const results = await Promise.allSettled(
    BROWSE_TOPICS.map((t) => searchSingle(t, q, sort, fetchPerTopic, 1, null)),
  );

  const seen = new Map<number, SecurityProject>();
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const p of r.value.projects) {
        if (!seen.has(p.id)) seen.set(p.id, p);
      }
    }
  }

  let merged = Array.from(seen.values());
  merged = sortProjects(merged, sort);
  const totalCount = merged.length;
  // Slice for the requested per_page (page 1 only in browse mode)
  merged = merged.slice(0, perPage);

  return { projects: merged, totalCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const sortParam = (searchParams.get('sort') || 'trending') as SortKey;
  const perPage = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('per_page') || '30', 10) || 30),
  );
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  if (category && !CATEGORY_MAP[category]) {
    return NextResponse.json(
      { error: `Categoría inválida: ${category}` },
      { status: 400 },
    );
  }

  const cacheKey = `q=${q || ''}|cat=${category || ''}|sort=${sortParam}|pp=${perPage}|p=${page}`;
  const cached = cacheGet<{ projects: SecurityProject[]; totalCount: number }>(cacheKey);
  if (cached) {
    return NextResponse.json({
      success: true,
      cached: true,
      projects: cached.projects,
      totalCount: cached.totalCount,
      page,
      perPage,
      category: category || null,
    });
  }

  // Decide strategy and how many GitHub requests we'll need.
  const isBrowse = !category && !q;
  const isBrowseFirstPage = isBrowse && page === 1;
  const neededReqs = isBrowseFirstPage ? BROWSE_TOPICS.length : 1;

  if (!rateLimitOk(neededReqs)) {
    return NextResponse.json(
      {
        error:
          'Límite de peticiones alcanzado. Intenta de nuevo en unos segundos.',
        rateLimited: true,
      },
      { status: 429 },
    );
  }

  try {
    let result: { projects: SecurityProject[]; totalCount: number };

    if (category) {
      // Category mode — single topic, native pagination
      const topic = CATEGORY_MAP[category].primary;
      result = await searchSingle(topic, q, sortParam, perPage, page, category);
    } else if (isBrowseFirstPage) {
      // Browse mode — parallel queries across topics
      result = await searchBrowse(q, sortParam, perPage);
    } else {
      // Search mode without category — use default topic, native pagination
      result = await searchSingle(DEFAULT_SEARCH_TOPIC, q, sortParam, perPage, page, null);
    }

    cacheSet(cacheKey, result);

    return NextResponse.json({
      success: true,
      cached: false,
      projects: result.projects,
      totalCount: result.totalCount,
      page,
      perPage,
      category: category || null,
    });
  } catch (err) {
    if (err instanceof Error && (err as Error & { rateLimited?: boolean }).rateLimited) {
      return NextResponse.json(
        {
          error:
            'GitHub API: límite de peticiones alcanzado. Intenta más tarde.',
          rateLimited: true,
        },
        { status: 429 },
      );
    }
    const message = err instanceof Error ? err.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al contactar GitHub API', detail: message },
      { status: 500 },
    );
  }
}
