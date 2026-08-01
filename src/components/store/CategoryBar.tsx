'use client';

import { CATEGORIES, SUBCATEGORIES } from '@/lib/store';
import { useStore } from '@/lib/store';
import {
  Gamepad2,
  Tv,
  UserCircle,
  Gift,
  AppWindow,
  RefreshCw,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Gamepad2,
  Tv,
  UserCircle,
  Gift,
  AppWindow,
  RefreshCw,
};

export function CategoryBar() {
  const { selectedCategory, selectedSubcategory, setSelectedCategory, setSelectedSubcategory } = useStore();

  return (
    <section className="w-full">
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border ${
            selectedCategory === 'all'
              ? 'bg-primary/15 text-primary border-primary/30 shadow-lg shadow-primary/5'
              : 'bg-white/[0.03] border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]'
          }`}
        >
          Todos
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.icon];
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-primary/15 text-primary border-primary/30 shadow-lg shadow-primary/5'
                  : 'bg-white/[0.03] border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {cat.name}
            </button>
          );
        })}
      </div>
      {selectedCategory !== 'all' && SUBCATEGORIES[selectedCategory] && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          <button
            onClick={() => setSelectedSubcategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedSubcategory === 'all'
                ? 'bg-white/[0.08] text-foreground border border-white/[0.1]'
                : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
            }`}
          >
            Todos
          </button>
          {SUBCATEGORIES[selectedCategory].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedSubcategory === sub
                  ? 'bg-white/[0.08] text-foreground border border-white/[0.1]'
                  : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
