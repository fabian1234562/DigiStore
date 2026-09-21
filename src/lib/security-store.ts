/**
 * DigiStore Security — shared in-memory store + helpers.
 *
 * Holds:
 *  - In-memory cache for analyze() results (30 min TTL).
 *  - In-memory Map of imported projects (acts as a database).
 *  - License detection (permissive / review / no-distribute).
 *  - Self-imposed GitHub rate limiter (max 20 req/min).
 *
 * NOTE: In Vercel serverless, this state lives per warm lambda instance.
 * For a real production system you'd swap the Map for a DB, but per the
 * task spec we use in-memory maps intentionally.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GitHub Personal Access Token — read from env (NEVER hard-coded).
 *
 * Set this in `.env.local` locally and in the Vercel project settings for
 * production. Without it the API will still work but with much lower rate
 * limits (60 req/hour unauthenticated vs 5000/hour authenticated).
 */
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

export const ANALYZE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_GITHUB_REQUESTS_PER_MIN = 20;

// ─────────────────────────────────────────────────────────────────────────────
// License detection
// ─────────────────────────────────────────────────────────────────────────────

export type LicenseStatus = 'permissive' | 'review' | 'forbidden';

export interface LicenseInfo {
  /** SPDX key returned by GitHub (e.g. "mit", "apache-2.0") */
  key: string | null;
  /** Human-readable name (e.g. "MIT License", "Apache License 2.0") */
  name: string | null;
  /** Redistribution status derived from `key` */
  status: LicenseStatus;
  /** Spanish label for the badge */
  label: string;
  /** Emoji for the badge (🟢 / 🟡 / 🔴) */
  emoji: string;
  /** True if DigiStore is allowed to mirror/distribute the ZIP */
  canRedistribute: boolean;
}

const PERMISSIVE_LICENSES = new Set([
  'mit',
  'apache-2.0',
  'bsd-2-clause',
  'bsd-3-clause',
  'bsd-4-clause',
  'isc',
  'unlicense',
  '0bsd',
  'cc0-1.0',
  'zlib',
  'gpl-2.0',
  'gpl-2.0-only',
  'gpl-2.0-or-later',
  'gpl-3.0',
  'gpl-3.0-only',
  'gpl-3.0-or-later',
  'bsl-1.0', // Boost Software License
  'ms-pl',
  'wtfpl',
]);

const REVIEW_LICENSES = new Set([
  'lgpl-2.1',
  'lgpl-2.1-only',
  'lgpl-2.1-or-later',
  'lgpl-3.0',
  'lgpl-3.0-only',
  'lgpl-3.0-or-later',
  'mpl-1.0',
  'mpl-1.1',
  'mpl-2.0',
  'agpl-3.0',
  'agpl-3.0-only',
  'agpl-3.0-or-later',
  'epl-1.0',
  'epl-2.0',
  'cddl-1.0',
  'cddl-1.1',
  'eupl-1.1',
  'eupl-1.2',
  'cc-by-4.0',
  'cc-by-sa-4.0',
  'cc-by-nc-4.0',
  'cc-by-nc-sa-4.0',
  'artistic-1.0',
  'artistic-2.0',
  'polyform-noncommercial-1.0.0',
  'polyform-small-business-1.0.0',
]);

/**
 * Determine redistribution status from the GitHub license SPDX key.
 *
 * - 🟢 Permissive: MIT, Apache-2.0, BSD, GPL, ISC, Unlicense, 0BSD, CC0, Boost
 * - 🟡 Review: LGPL, MPL, AGPL, EPL, CDDL, EUPL, CC-BY(-SA)
 * - 🔴 No distribute: no license, proprietary, or unknown
 */
export function detectLicense(
  key: string | null,
  name: string | null,
): LicenseInfo {
  const k = (key || '').toLowerCase().trim();

  if (!k || k === 'other' || k === 'noassertion' || k === 'proprietary') {
    return {
      key,
      name: name || 'Sin licencia',
      status: 'forbidden',
      label: 'No distribuir',
      emoji: '🔴',
      canRedistribute: false,
    };
  }

  if (PERMISSIVE_LICENSES.has(k)) {
    return {
      key,
      name: name || k.toUpperCase(),
      status: 'permissive',
      label: 'Redistribución permitida',
      emoji: '🟢',
      canRedistribute: true,
    };
  }

  if (REVIEW_LICENSES.has(k)) {
    return {
      key,
      name: name || k.toUpperCase(),
      status: 'review',
      label: 'Revisar condiciones',
      emoji: '🟡',
      canRedistribute: false,
    };
  }

  // Unknown SPDX key — treat as forbidden (safe default).
  return {
    key,
    name: name || k.toUpperCase(),
    status: 'forbidden',
    label: 'No distribuir',
    emoji: '🔴',
    canRedistribute: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub helpers
// ─────────────────────────────────────────────────────────────────────────────

export function ghHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'DigiStore-Security',
    ...extra,
  };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  return headers;
}

// Self-imposed rate limiter (max 20 req/min).
const githubRequestTimestamps: number[] = [];

export function rateLimitOk(n = 1): boolean {
  const now = Date.now();
  while (
    githubRequestTimestamps.length &&
    now - githubRequestTimestamps[0] > 60_000
  ) {
    githubRequestTimestamps.shift();
  }
  if (githubRequestTimestamps.length + n > MAX_GITHUB_REQUESTS_PER_MIN) return false;
  for (let i = 0; i < n; i++) githubRequestTimestamps.push(now);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Analyze cache (30 min TTL)
// ─────────────────────────────────────────────────────────────────────────────

interface AnalyzeCacheEntry {
  at: number;
  payload: AnalyzeResult;
}

const analyzeCache = new Map<string, AnalyzeCacheEntry>();

export function getAnalyzeCache(repo: string): AnalyzeResult | null {
  const e = analyzeCache.get(repo.toLowerCase());
  if (!e) return null;
  if (Date.now() - e.at > ANALYZE_CACHE_TTL_MS) {
    analyzeCache.delete(repo.toLowerCase());
    return null;
  }
  return e.payload;
}

export function setAnalyzeCache(repo: string, payload: AnalyzeResult) {
  analyzeCache.set(repo.toLowerCase(), { at: Date.now(), payload });
  if (analyzeCache.size > 100) {
    const k = analyzeCache.keys().next().value;
    if (k) analyzeCache.delete(k);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Imported projects store (acts as database)
// ─────────────────────────────────────────────────────────────────────────────

export interface ImportedProject {
  /** Stable ID — derived from GitHub repo numeric id */
  id: string;
  /** Numeric GitHub repo id (kept for the [id] route) */
  repoId: number;
  /** "owner/repo" slug */
  repo: string;
  name: string;
  description: string;
  author: string;
  /** SPDX key from GitHub (e.g. "mit") */
  licenseKey: string | null;
  /** Human-readable license name */
  licenseName: string | null;
  licenseStatus: LicenseStatus;
  licenseLabel: string;
  licenseEmoji: string;
  canRedistribute: boolean;
  stars: number;
  forks: number;
  language: string | null;
  category: string;
  topics: string[];
  /** Open Graph image URL (preview) */
  imageUrl: string;
  /** Owner avatar URL */
  ownerAvatar: string;
  /** GitHub html_url */
  repoUrl: string;
  /** Homepage (if any) */
  homepage: string | null;
  /** Latest release tag, if found */
  releaseVersion: string | null;
  /** Approximate total size in bytes (from /repos/{owner}/{repo}) */
  fileSize: number;
  /** Number of files at the repo root */
  fileCount: number;
  /** README markdown (raw, truncated to 50 KB to keep memory bounded) */
  readmeContent: string;
  /** Last push/update ISO date */
  lastUpdate: string;
  archived: boolean;
  /** ISO date when the project was imported into DigiStore */
  importedAt: string;
  hasDownload: boolean;
}

const importedProjects = new Map<string, ImportedProject>();

export function listImportedProjects(): ImportedProject[] {
  return Array.from(importedProjects.values());
}

export function getImportedProject(id: string): ImportedProject | null {
  return importedProjects.get(id) || null;
}

export function getImportedByRepo(repo: string): ImportedProject | null {
  const slug = repo.toLowerCase();
  for (const p of importedProjects.values()) {
    if (p.repo.toLowerCase() === slug) return p;
  }
  return null;
}

export function addImportedProject(p: ImportedProject) {
  importedProjects.set(p.id, p);
}

export function removeImportedProject(id: string): boolean {
  return importedProjects.delete(id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin settings (in-memory)
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminSettings {
  autoImport: boolean;
}

const adminSettings: AdminSettings = { autoImport: false };

export function getAdminSettings(): AdminSettings {
  return { ...adminSettings };
}

export function setAdminSettings(next: Partial<AdminSettings>): AdminSettings {
  Object.assign(adminSettings, next);
  return { ...adminSettings };
}

// ─────────────────────────────────────────────────────────────────────────────
// Analyze result type (returned by /api/security/analyze)
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalyzeResult {
  repo: string;
  name: string;
  description: string;
  author: string;
  license: LicenseInfo;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  lastUpdate: string;
  createdAt: string;
  topics: string[];
  readmeContent: string;
  releaseVersion: string | null;
  fileSize: number;
  fileCount: number;
  archived: boolean;
  homepage: string | null;
  repoUrl: string;
  ownerAvatar: string;
  imageUrl: string;
  category: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Category detection (mirrors /api/security/project logic)
// ─────────────────────────────────────────────────────────────────────────────

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

export function detectCategory(topics: string[]): string {
  const set = new Set(topics.map((t) => t.toLowerCase()));
  for (const [key, list] of Object.entries(CATEGORY_TOPICS)) {
    if (list.some((t) => set.has(t))) return key;
  }
  return 'general';
}

// ─────────────────────────────────────────────────────────────────────────────
// Repo slug validation
// ─────────────────────────────────────────────────────────────────────────────

const REPO_SLUG_RE = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

export function isValidRepoSlug(slug: string): boolean {
  if (typeof slug !== 'string') return false;
  const trimmed = slug.trim();
  if (!trimmed || trimmed.length > 200) return false;
  return REPO_SLUG_RE.test(trimmed);
}

export function normalizeRepoSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// Analyze — fetches repo metadata + license + README + latest release + contents
//
// SECURITY: this function NEVER executes code from the repo. It only downloads
// text/JSON metadata from GitHub's REST API. The README is fetched as raw
// markdown text and rendered client-side via react-markdown with rehype-raw
// DISABLED (no raw HTML).
// ─────────────────────────────────────────────────────────────────────────────

const README_MAX_BYTES = 50 * 1024; // 50 KB cap to keep memory bounded

interface GitHubRepoResponse {
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
  size: number; // KB
  topics?: string[];
  license: { key: string; name: string; spdx_id: string } | null;
  owner: { login: string; avatar_url: string };
  default_branch: string;
}

interface GitHubLicenseResponse {
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
  } | null;
}

interface GitHubContentItem {
  name: string;
  path: string;
  size: number;
  type: string;
}

interface GitHubReleaseResponse {
  tag_name: string;
  name: string | null;
  prerelease: boolean;
  draft: boolean;
}

async function ghFetch<T>(url: string, extraHeaders: Record<string, string> = {}): Promise<{ ok: boolean; status: number; data: T | null }> {
  const res = await fetch(url, {
    headers: ghHeaders(extraHeaders),
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    return { ok: false, status: res.status, data: null };
  }
  const data = (await res.json()) as T;
  return { ok: true, status: res.status, data };
}

/**
 * Analyze a GitHub repository: gather full metadata without executing any code.
 * Returns an `AnalyzeResult`. Throws with `.rateLimited` or `.notFound` flags
 * for the caller to translate to HTTP responses.
 */
export async function analyzeRepo(repoSlug: string): Promise<AnalyzeResult> {
  const [owner, name] = repoSlug.split('/');
  if (!owner || !name) {
    const e = new Error('Slug inválido') as Error & { notFound?: boolean };
    e.notFound = true;
    throw e;
  }

  // Cache hit short-circuit
  const cached = getAnalyzeCache(repoSlug);
  if (cached) return cached;

  // Need 4 GitHub API calls: repo, license, readme, contents, releases/latest
  if (!rateLimitOk(4)) {
    const e = new Error('rate limit') as Error & { rateLimited?: boolean };
    e.rateLimited = true;
    throw e;
  }

  // 1) Repo info
  const repoUrl = `https://api.github.com/repos/${owner}/${name}`;
  const repoRes = await ghFetch<GitHubRepoResponse>(repoUrl);
  if (!repoRes.ok) {
    if (repoRes.status === 403 || repoRes.status === 429) {
      const e = new Error('rate limit') as Error & { rateLimited?: boolean };
      e.rateLimited = true;
      throw e;
    }
    if (repoRes.status === 404) {
      const e = new Error('not found') as Error & { notFound?: boolean };
      e.notFound = true;
      throw e;
    }
    throw new Error(`GitHub API respondió ${repoRes.status}`);
  }
  const repo = repoRes.data!;
  if (repo.fork) {
    // Skip forks to avoid noise — caller can still force-import via admin.
  }

  // 2) License — prefer the dedicated endpoint (returns SPDX key reliably)
  let licenseKey = repo.license?.key || null;
  let licenseName = repo.license?.name || null;
  try {
    const licRes = await ghFetch<GitHubLicenseResponse>(
      `https://api.github.com/repos/${owner}/${name}/license`,
    );
    if (licRes.ok && licRes.data?.license) {
      licenseKey = licRes.data.license.key;
      licenseName = licRes.data.license.name;
    }
  } catch {
    // best-effort
  }

  const license = detectLicense(licenseKey, licenseName);

  // 3) README — raw markdown
  let readmeContent = '';
  try {
    const readmeRes = await fetch(
      `https://api.github.com/repos/${owner}/${name}/readme`,
      {
        headers: ghHeaders({ Accept: 'application/vnd.github.v3.raw' }),
        next: { revalidate: 0 },
      },
    );
    if (readmeRes.ok) {
      const text = await readmeRes.text();
      readmeContent = text.slice(0, README_MAX_BYTES);
    }
  } catch {
    // best-effort
  }

  // 4) Root contents — file count + total size
  let fileCount = 0;
  let fileSizeBytes = (repo.size || 0) * 1024; // GitHub size is in KB
  try {
    const contentsRes = await ghFetch<GitHubContentItem[]>(
      `https://api.github.com/repos/${owner}/${name}/contents`,
    );
    if (contentsRes.ok && Array.isArray(contentsRes.data)) {
      fileCount = contentsRes.data.length;
      // Sum sizes at root level for display (already have repo.size for total)
      const rootSize = contentsRes.data.reduce((sum, it) => sum + (it.size || 0), 0);
      if (rootSize > 0) fileSizeBytes = Math.max(fileSizeBytes, rootSize);
    }
  } catch {
    // best-effort
  }

  // 5) Latest release (best-effort, 404 means "no releases yet")
  let releaseVersion: string | null = null;
  try {
    const relRes = await ghFetch<GitHubReleaseResponse>(
      `https://api.github.com/repos/${owner}/${name}/releases/latest`,
    );
    if (relRes.ok && relRes.data?.tag_name) {
      releaseVersion = relRes.data.tag_name;
    }
  } catch {
    // best-effort
  }

  const topics = repo.topics || [];
  const category = detectCategory(topics);
  const imageUrl = `https://opengraph.githubassets.com/1/${repo.full_name}`;

  const result: AnalyzeResult = {
    repo: repo.full_name.toLowerCase(),
    name: repo.name,
    description: repo.description || 'Sin descripción disponible.',
    author: repo.owner.login,
    license,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    openIssues: repo.open_issues_count,
    language: repo.language,
    lastUpdate: repo.pushed_at || repo.updated_at,
    createdAt: repo.created_at,
    topics,
    readmeContent,
    releaseVersion,
    fileSize: fileSizeBytes,
    fileCount,
    archived: repo.archived,
    homepage: repo.homepage || null,
    repoUrl: repo.html_url,
    ownerAvatar: repo.owner.avatar_url,
    imageUrl,
    category,
  };

  setAnalyzeCache(repoSlug, result);
  return result;
}
