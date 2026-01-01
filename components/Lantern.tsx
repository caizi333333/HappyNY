
import React from 'react';

export const Lantern: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex flex-col items-center animate-bounce ${className}`}>
    <div className="w-1 h-8 bg-yellow-600"></div>
    <div className="w-10 h-12 bg-red-600 rounded-full border-2 border-yellow-500 relative flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-around pointer-events-none">
        <div className="w-[1px] h-full bg-yellow-500 opacity-30"></div>
        <div className="w-[1px] h-full bg-yellow-500 opacity-30"></div>
        <div className="w-[1px] h-full bg-yellow-500 opacity-30"></div>
      </div>
      <span className="text-yellow-400 font-bold text-xs select-none">春</span>
    </div>
    <div className="w-4 h-1 bg-yellow-600"></div>
    <div className="flex gap-1 mt-[-2px]">
      <div className="w-[2px] h-4 bg-yellow-500"></div>
      <div className="w-[2px] h-4 bg-yellow-500"></div>
      <div className="w-[2px] h-4 bg-yellow-500"></div>
    </div>
  </div>
);
