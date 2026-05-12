import React from 'react';

export function MemberBadge({ name, color, size = 'md' }) {
  const sizeClasses = {
    sm: 'px-2 h-6 text-xs',
    md: 'px-3 h-8 text-sm',
    lg: 'px-4 h-10 text-base'
  };

  return (
    <div 
      className={`rounded-full flex items-center justify-center text-white font-medium ${sizeClasses[size]} ring-2 ring-white whitespace-nowrap`}
      style={{ backgroundColor: color || '#94a3b8' }}
      title={name}
    >
      {name || '??'}
    </div>
  );
}
