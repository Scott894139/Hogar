import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const CATEGORY_COLORS = {
  Colegio: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  Compras: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  Salud: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  Eventos: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
  Casa: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200'
};

const CATEGORIES = ['Todas', 'Colegio', 'Compras', 'Salud', 'Eventos', 'Casa'];

export function CategoryFilter({ currentCategory, onSelectCategory }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {CATEGORIES.map(cat => {
        const isSelected = currentCategory === cat;
        const colorClasses = cat === 'Todas' 
          ? 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
          : CATEGORY_COLORS[cat];

        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={twMerge(
              'px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200',
              colorClasses,
              isSelected ? 'ring-2 ring-offset-2 ring-slate-400' : 'opacity-80 hover:opacity-100'
            )}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
