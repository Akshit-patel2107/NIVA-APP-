import React from 'react';
import {
  Calendar,
  Sparkles,
  BookOpen,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  QrCode,
  Heart,
  Package,
} from 'lucide-react';
import { useCycle } from '../context/CycleContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQR: () => void;
  onOpenEmergency: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  onOpenQR,
  onOpenEmergency,
}: HeaderProps) {
  const {
    discreetMode,
    setDiscreetMode,
    isPadChangeDue,
    timeSinceLastPadChangeMinutes,
    isCarePlus,
  } = useCycle();

  const hoursElapsed = Math.floor(timeSinceLastPadChangeMinutes / 60);
  const minutesElapsed = timeSinceLastPadChangeMinutes % 60;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F5]/90 backdrop-blur-md border-b border-[#2D2328]/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark in display face */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-1.5 text-left group"
          >
            <span className="text-2xl font-serif font-bold tracking-tight text-[#2D2328] group-hover:text-[#C54B6C] transition-colors">
              NIVA
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C54B6C] animate-pulse" />
          </button>
          {isCarePlus && (
            <span className="text-[11px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded text-[#7D2840] bg-[#FDF2F4] border border-[#C54B6C]/20">
              Care+
            </span>
          )}
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#64555D]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors hover:text-[#2D2328] relative py-1 ${
              activeTab === 'dashboard'
                ? 'text-[#C54B6C] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C54B6C]'
                : ''
            }`}
          >
            {discreetMode ? 'Daily Wellness' : 'Dashboard'}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`transition-colors hover:text-[#2D2328] relative py-1 ${
              activeTab === 'calendar'
                ? 'text-[#C54B6C] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C54B6C]'
                : ''
            }`}
          >
            {discreetMode ? 'Rhythm Calendar' : 'Cycle Calendar'}
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-1 transition-colors hover:text-[#2D2328] relative py-1 ${
              activeTab === 'insights'
                ? 'text-[#C54B6C] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C54B6C]'
                : ''
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C54B6C]" />
            <span>AI Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-1 transition-colors hover:text-[#2D2328] relative py-1 ${
              activeTab === 'store'
                ? 'text-[#C54B6C] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C54B6C]'
                : ''
            }`}
          >
            <span>Pads & QR Sync</span>
          </button>

          <button
            onClick={() => setActiveTab('academy')}
            className={`transition-colors hover:text-[#2D2328] relative py-1 ${
              activeTab === 'academy'
                ? 'text-[#C54B6C] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C54B6C]'
                : ''
            }`}
          >
            Academy
          </button>

          <button
            onClick={onOpenEmergency}
            className="flex items-center gap-1 text-[#7D2840] hover:text-[#C54B6C] transition-colors py-1"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Emergency Help</span>
          </button>
        </nav>

        {/* Zone 3: Primary action & privacy controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pad Change Timer indicator */}
          <button
            onClick={() => setActiveTab('dashboard')}
            title="Pad Hygiene Timer"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-all ${
              isPadChangeDue
                ? 'bg-amber-50 border-amber-300 text-amber-800 animate-pulse'
                : 'bg-white/80 border-[#2D2328]/10 text-[#64555D]'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isPadChangeDue ? 'text-amber-600' : 'text-[#C54B6C]'}`} />
            <span className="tabular-nums">
              {isPadChangeDue ? 'Change Due' : `${hoursElapsed}h ${minutesElapsed}m`}
            </span>
          </button>

          {/* Discreet Mode Toggle */}
          <button
            onClick={() => setDiscreetMode(!discreetMode)}
            title={discreetMode ? 'Discreet Mode active (labels disguised)' : 'Toggle Discreet Mode for privacy in public'}
            className={`p-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
              discreetMode
                ? 'bg-[#C54B6C] text-white border-[#C54B6C]'
                : 'bg-white border-[#2D2328]/10 text-[#64555D] hover:text-[#2D2328]'
            }`}
            aria-label="Toggle Discreet Mode"
          >
            {discreetMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="hidden xl:inline text-xs">
              {discreetMode ? 'Discreet' : 'Private'}
            </span>
          </button>

          {/* QR Scanner trigger */}
          <button
            onClick={onOpenQR}
            title="Scan NIVA Pad QR code"
            className="p-2 rounded-lg bg-white border border-[#2D2328]/10 text-[#64555D] hover:text-[#2D2328] hover:border-[#C54B6C]/30 transition-colors flex items-center gap-1.5 text-xs font-medium"
            aria-label="Scan Pad QR Code"
          >
            <QrCode className="w-4 h-4 text-[#C54B6C]" />
            <span className="hidden sm:inline">Verify QR</span>
          </button>

          {/* Care+ Membership CTA */}
          <button
            onClick={() => {
              if (isCarePlus) {
                setActiveTab('insights');
              } else {
                setActiveTab('store');
              }
            }}
            className="hidden sm:inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-white bg-[#C54B6C] rounded-lg hover:bg-[#B33F5E] shadow-sm transition-colors whitespace-nowrap"
          >
            {isCarePlus ? 'Care+ Active' : 'Get Care+'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[#2D2328]/05 px-2 py-2 bg-white/70 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 ${activeTab === 'dashboard' ? 'text-[#C54B6C] font-semibold' : 'text-[#64555D]'}`}
        >
          <Heart className="w-4 h-4" />
          <span>Track</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-0.5 py-1 ${activeTab === 'calendar' ? 'text-[#C54B6C] font-semibold' : 'text-[#64555D]'}`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar</span>
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex flex-col items-center gap-0.5 py-1 ${activeTab === 'insights' ? 'text-[#C54B6C] font-semibold' : 'text-[#64555D]'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Insights</span>
        </button>
        <button
          onClick={() => setActiveTab('store')}
          className={`flex flex-col items-center gap-0.5 py-1 ${activeTab === 'store' ? 'text-[#C54B6C] font-semibold' : 'text-[#64555D]'}`}
        >
          <Package className="w-4 h-4" />
          <span>Pad Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('academy')}
          className={`flex flex-col items-center gap-0.5 py-1 ${activeTab === 'academy' ? 'text-[#C54B6C] font-semibold' : 'text-[#64555D]'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Academy</span>
        </button>
      </div>
    </header>
  );
}
