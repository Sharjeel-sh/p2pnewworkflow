import React from 'react';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileLayout({ children, className = '' }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-200 to-slate-300 flex items-start justify-center p-0 md:p-6">
      <div className="w-full max-w-screen-lg md:max-w-[460px] bg-[#0f172a] md:px-3 md:py-3 md:rounded-[2.8rem] md:shadow-[0_35px_90px_rgba(15,23,42,0.35)]">
        <div
          className={`w-full bg-white relative flex flex-col overflow-y-auto min-h-screen md:min-h-[calc(100vh-3rem)] md:h-[min(920px,calc(100vh-3rem))] md:rounded-[2.3rem] md:border md:border-slate-900/30 ${className}`}
        >
          <div className="hidden md:block absolute top-2 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-950 rounded-full z-20" />
          {children}
          <div className="hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-900/85 rounded-full z-20" />
        </div>
      </div>
    </div>
  );
}
