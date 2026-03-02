import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileLayout({ children, className = '' }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 to-slate-300 flex items-center justify-center sm:p-6">
      <div className="w-full max-w-[460px] sm:bg-[#0f172a] sm:p-3 sm:rounded-[2.8rem] sm:shadow-[0_35px_90px_rgba(15,23,42,0.35)]">
        <div
          className={`w-full bg-white relative flex flex-col overflow-hidden min-h-[100dvh] sm:min-h-0 sm:h-[min(920px,calc(100dvh-3rem))] sm:rounded-[2.3rem] sm:border sm:border-slate-900/30 ${className}`}
        >
          <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-950 rounded-full z-20" />
          {children}
          <div className="hidden sm:block absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-900/85 rounded-full z-20" />
        </div>
      </div>
    </div>
  );
}
