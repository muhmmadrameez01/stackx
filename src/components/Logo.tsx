import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const iconSizeClass = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-10 h-10',
  }[size];

  const titleSizeClass = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  const subtitleSizeClass = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-[11px]',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 cursor-pointer group select-none ${className}`}
    >
      {/* Simple Minimal Icon */}
      <div className={`relative ${iconSizeClass} shrink-0 group-hover:opacity-90 transition-opacity`}>
        <img
          src="/logo.svg"
          alt="Stackx logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Clean Brand Text */}
      <div className="flex flex-col">
        <div className={`font-extrabold tracking-tight font-sans text-slate-900 dark:text-white leading-none ${titleSizeClass}`}>
          Stack<span className="text-red-600 dark:text-red-500">x</span>
        </div>
        {showSubtitle && (
          <span className={`text-slate-500 dark:text-slate-400 font-medium tracking-normal mt-0.5 ${subtitleSizeClass}`}>
            The Ultimate Tools Suite
          </span>
        )}
      </div>
    </div>
  );
};
