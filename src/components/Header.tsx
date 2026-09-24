import React, { useState, useRef, useEffect } from 'react';
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
  User,
  ChevronDown,
  LogOut,
  Sliders,
  Lock,
  CloudCheck,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { useCycle } from '../context/CycleContext';
import { useAuth } from '../context/AuthContext';

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

  const {
    user,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalMode,
    setIsHealthSetupOpen,
    healthProfile,
    logout,
    quickLogin,
    lockApp,
    syncStatus,
  } = useAuth();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hoursElapsed = Math.floor(timeSinceLastPadChangeMinutes / 60);
  const minutesElapsed = timeSinceLastPadChangeMinutes % 60;

  const stageBadgeLabel = (() => {
    if (healthProfile.lifeStage === 'teen') return '🌸 Teen Mode';
    if (healthProfile.healthConditions.includes('PCOS')) return '💜 PCOS Care';
    if (healthProfile.lifeStage === 'fertility') return '✨ Fertility Sync';
    if (healthProfile.lifeStage === 'postpartum') return '🌱 Postpartum';
    return `${healthProfile.averageCycleLength || 28}d Regular`;
  })();

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

        {/* Zone 3: Primary action, health controls & user account */}
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
            <span className="hidden lg:inline">Verify QR</span>
          </button>

          {/* User Account / Profile Section */}
          <div className="relative" ref={dropdownRef}>
            {isAuthenticated ? (
              <div>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-[#2D2328]/10 hover:border-[#C54B6C]/40 text-xs font-medium text-[#2D2328] transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-[#F3C5D0] text-[#7D2840] font-bold flex items-center justify-center text-[11px]">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="font-semibold text-xs text-[#2D2328]">
                      {user?.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-[#C54B6C] font-medium">
                      {stageBadgeLabel}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7B6A74]" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#FAF7F5] rounded-2xl border border-[#2D2328]/12 shadow-xl py-3 px-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User info header */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#2D2328]/08 mb-2">
                      <div className="font-bold text-sm text-[#2D2328] flex items-center justify-between">
                        <span>{user?.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          {syncStatus === 'synced' ? 'Synced' : 'Saving...'}
                        </span>
                      </div>
                      <div className="text-xs text-[#7B6A74] truncate">
                        {user?.email}
                      </div>
                      <div className="mt-2 pt-2 border-t border-[#2D2328]/06 flex items-center justify-between text-[11px] text-[#64555D]">
                        <span>Profile:</span>
                        <span className="font-semibold text-[#C54B6C]">
                          {stageBadgeLabel}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setIsHealthSetupOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-[#2D2328] hover:bg-white rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <Sliders className="w-4 h-4 text-[#C54B6C]" />
                        <span>Girls’ Health Setup Settings</span>
                      </button>

                      {healthProfile.pinEnabled && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            lockApp();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-[#2D2328] hover:bg-white rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <Lock className="w-4 h-4 text-[#C54B6C]" />
                          <span>Lock Vault with PIN</span>
                        </button>
                      )}

                      {/* Demo Quick Switcher inside menu */}
                      <div className="pt-2 border-t border-[#2D2328]/08 mt-2">
                        <span className="text-[10px] font-semibold text-[#7B6A74] uppercase tracking-wider block px-2 mb-1.5">
                          Switch Health Baseline
                        </span>
                        <div className="grid grid-cols-3 gap-1 px-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              quickLogin('maya');
                            }}
                            className="p-1.5 rounded-lg bg-white border border-[#2D2328]/10 text-[10px] text-center font-medium hover:border-[#C54B6C]"
                          >
                            Maya (Teen)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              quickLogin('sarah');
                            }}
                            className="p-1.5 rounded-lg bg-white border border-[#2D2328]/10 text-[10px] text-center font-medium hover:border-[#C54B6C]"
                          >
                            Sarah (Reg)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              quickLogin('elena');
                            }}
                            className="p-1.5 rounded-lg bg-white border border-[#2D2328]/10 text-[10px] text-center font-medium hover:border-[#C54B6C]"
                          >
                            Elena (PCOS)
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#2D2328]/08 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('signin');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-[#2D2328] hover:text-[#C54B6C] transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#C54B6C] hover:bg-[#B33F5E] rounded-xl shadow-sm transition-all"
                >
                  Join NIVA
                </button>
              </div>
            )}
          </div>
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
