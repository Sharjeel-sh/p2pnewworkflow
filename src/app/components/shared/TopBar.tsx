import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  rightElement?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
}

export function TopBar({
  title,
  showBack = true,
  backTo,
  rightElement,
  bgColor = 'bg-gradient-to-r from-red-600 to-red-700',
  textColor = 'text-white',
}: TopBarProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  return (
    <div className={`${bgColor} ${textColor} px-4 py-3.5 flex items-center gap-3 sticky top-0 z-10 border-b border-black/5 shadow-[0_8px_20px_rgba(0,0,0,0.12)]`}>
      {showBack && (
        <button onClick={handleBack} className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors">
          <ArrowLeft size={22} />
        </button>
      )}
      <h2 className={`flex-1 ${showBack ? '' : 'text-center'} truncate`} style={{ fontSize: '1.1rem', fontWeight: 600 }}>
        {title}
      </h2>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
}
