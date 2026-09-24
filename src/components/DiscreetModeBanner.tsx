import React from 'react';
import { EyeOff, X } from 'lucide-react';
import { useCycle } from '../context/CycleContext';

export function DiscreetModeBanner() {
  const { discreetMode, setDiscreetMode } = useCycle();

  if (!discreetMode) return null;

  return (
    <div className="bg-[#FAF0F2] border-b border-[#C54B6C]/20 px-4 py-2 text-xs text-[#7D2840] flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
        <EyeOff className="w-4 h-4 text-[#C54B6C] shrink-0" />
        <span>
          <strong className="font-semibold">Discreet Privacy Mode is active.</strong>{' '}
          Specific menstrual terminology is masked with neutral body rhythm labels so you can check your wellness comfortably in public or classrooms.
        </span>
        <button
          onClick={() => setDiscreetMode(false)}
          className="ml-auto text-xs underline font-medium hover:text-[#2D2328] whitespace-nowrap"
        >
          Exit Discreet Mode
        </button>
      </div>
    </div>
  );
}
