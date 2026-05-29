import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  url?: string;
  name?: string;
  className?: string;
  iconClassName?: string;
}

export default function Avatar({ url, name, className = "h-8 w-8 rounded-xl", iconClassName = "h-4 w-4" }: AvatarProps) {
  const isInvalidUrl = !url || url.trim() === '' || url.includes('unsplash.com');

  if (isInvalidUrl) {
    return (
      <div 
        className={`${className} bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0 select-none`}
        title={name}
      >
        <User className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      referrerPolicy="no-referrer"
      src={url}
      alt={name || "Avatar"}
      className={`${className} object-cover shrink-0`}
      onError={(e) => {
        // Safe fallback if the custom image fails to load
        e.currentTarget.style.display = 'none';
        const parent = e.currentTarget.parentElement;
        if (parent && !parent.querySelector('.avatar-fallback-div')) {
          const fallbackDiv = document.createElement('div');
          fallbackDiv.className = `${className} avatar-fallback-div bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0 select-none`;
          fallbackDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user ${iconClassName}"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
          parent.appendChild(fallbackDiv);
        }
      }}
    />
  );
}
