'use client';

import { cn } from '@/lib/utils';

/**
 * Categorías del explorador DigiStore Security.
 * El key debe coincidir con los keys de CATEGORY_MAP en el route.ts.
 */
export interface SecurityCategory {
  key: string;
  label: string;
  emoji: string;
  color: string; // tailwind gradient for active pill
  ring: string; // tailwind border color for active pill
}

export const SECURITY_CATEGORIES: SecurityCategory[] = [
  { key: 'red-team', label: 'Red Team', emoji: '🔴', color: 'from-red-600 to-rose-600', ring: 'border-red-500' },
  { key: 'blue-team', label: 'Blue Team', emoji: '🔵', color: 'from-sky-600 to-blue-600', ring: 'border-sky-500' },
  { key: 'osint', label: 'OSINT', emoji: '🟣', color: 'from-purple-600 to-fuchsia-600', ring: 'border-purple-500' },
  { key: 'ctf', label: 'CTF', emoji: '🟢', color: 'from-emerald-600 to-green-600', ring: 'border-emerald-500' },
  { key: 'bug-bounty', label: 'Bug Bounty', emoji: '🟠', color: 'from-orange-600 to-amber-600', ring: 'border-orange-500' },
  { key: 'digital-forensics', label: 'Digital Forensics', emoji: '🟡', color: 'from-yellow-500 to-amber-500', ring: 'border-yellow-500' },
  { key: 'privacy', label: 'Privacy', emoji: '⚫', color: 'from-gray-700 to-zinc-700', ring: 'border-gray-500' },
  { key: 'network-security', label: 'Network Security', emoji: '🌐', color: 'from-cyan-600 to-teal-600', ring: 'border-cyan-500' },
  { key: 'cloud-security', label: 'Cloud Security', emoji: '☁️', color: 'from-slate-500 to-sky-500', ring: 'border-slate-500' },
  { key: 'malware-analysis', label: 'Malware Analysis', emoji: '🧪', color: 'from-pink-600 to-rose-600', ring: 'border-pink-500' },
  { key: 'cryptography', label: 'Cryptography', emoji: '🔐', color: 'from-amber-600 to-orange-600', ring: 'border-amber-500' },
  { key: 'security-automation', label: 'Security Automation', emoji: '🤖', color: 'from-indigo-600 to-violet-600', ring: 'border-indigo-500' },
  { key: 'web-security', label: 'Web Security', emoji: '💻', color: 'from-blue-600 to-indigo-600', ring: 'border-blue-500' },
  { key: 'wireless-security', label: 'Wireless Security', emoji: '📡', color: 'from-teal-600 to-emerald-600', ring: 'border-teal-500' },
  { key: 'reverse-engineering', label: 'Reverse Engineering', emoji: '🧠', color: 'from-violet-600 to-purple-600', ring: 'border-violet-500' },
  { key: 'soc-siem', label: 'SOC / SIEM', emoji: '🛡️', color: 'from-emerald-700 to-teal-700', ring: 'border-emerald-600' },
];

interface CategoryFilterProps {
  active: string; // 'all' or category key
  onChange: (key: string) => void;
  className?: string;
}

export function CategoryFilter({ active, onChange, className }: CategoryFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => onChange('all')}
        className={cn(
          'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all',
          active === 'all'
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-500 shadow-lg shadow-violet-500/20'
            : 'bg-gray-900/60 text-gray-300 border-gray-700 hover:border-gray-500 hover:text-white',
        )}
        aria-pressed={active === 'all'}
      >
        <span>✨</span> Todos
      </button>

      {SECURITY_CATEGORIES.map((cat) => {
        const isActive = active === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => onChange(cat.key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all',
              isActive
                ? cn('bg-gradient-to-r text-white border-transparent shadow-lg', cat.color, cat.ring)
                : 'bg-gray-900/60 text-gray-300 border-gray-700 hover:border-gray-500 hover:text-white',
            )}
            aria-pressed={isActive}
            title={cat.label}
          >
            <span aria-hidden="true">{cat.emoji}</span>
            <span className="hidden sm:inline">{cat.label}</span>
            <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
