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
          className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground shadow-lg scale-105'
              : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          🏪 Todos
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.icon];
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
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
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              selectedSubcategory === 'all'
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted/30 text-muted-foreground hover:text-foreground'
            }`}
          >
            Todos
          </button>
          {SUBCATEGORIES[selectedCategory].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedSubcategory === sub
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-muted/30 text-muted-foreground hover:text-foreground'
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
