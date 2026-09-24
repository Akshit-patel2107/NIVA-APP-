import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Clock,
  Plus,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Moon,
  ChevronRight,
  ShieldCheck,
  Package,
  QrCode,
  Info,
  Heart,
  Sliders,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useCycle } from '../context/CycleContext';
import { useAuth } from '../context/AuthContext';
import { formatDisplayDate, formatDateToIso } from '../utils/cycleEngine';

interface CycleDashboardProps {
  onNavigateToCalendar: () => void;
  onNavigateToInsights: () => void;
  onNavigateToStore: () => void;
  onOpenQR: () => void;
}

export function CycleDashboard({
  onNavigateToCalendar,
  onNavigateToInsights,
  onNavigateToStore,
  onOpenQR,
}: CycleDashboardProps) {
  const {
    cycleStatus,
    settings,
    dailyLogs,
    openLogModalForDate,
    padInventory,
    changePadNow,
    timeSinceLastPadChangeMinutes,
    isPadChangeDue,
    discreetMode,
    saveDailyLog,
  } = useCycle();

  const {
    user,
    isAuthenticated,
    healthProfile,
    setIsHealthSetupOpen,
    setIsAuthModalOpen,
    setAuthModalMode,
    syncStatus,
  } = useAuth();

  const todayIso = formatDateToIso(new Date());
  const todayLog = dailyLogs[todayIso];

  const [padActionSuccess, setPadActionSuccess] = useState(false);

  const hoursElapsed = Math.floor(timeSinceLastPadChangeMinutes / 60);
  const minutesElapsed = timeSinceLastPadChangeMinutes % 60;

  // Handle pad change button with tactile feedback
  const handlePadChange = () => {
    changePadNow();
    setPadActionSuccess(true);
    setTimeout(() => setPadActionSuccess(false), 3000);
  };

  // Quick increment water glass
  const handleQuickWater = () => {
    const currentGlasses = todayLog?.waterGlasses ?? 0;
    saveDailyLog({
      date: todayIso,
      flow: todayLog?.flow ?? 'none',
      symptoms: todayLog?.symptoms ?? [],
      moods: todayLog?.moods ?? [],
      cervicalMucus: todayLog?.cervicalMucus ?? '',
      sleepHours: todayLog?.sleepHours ?? 8,
      waterGlasses: currentGlasses + 1,
      painLevel: todayLog?.painLevel ?? 0,
      notes: todayLog?.notes ?? '',
    });
  };

  // Phase color accents
  const phaseTheme = {
    menstrual: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-[#9F3251]',
      accent: '#C54B6C',
      label: discreetMode ? 'Rest & Replenish Phase' : 'Menstrual Phase',
    },
    follicular: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      accent: '#10B981',
      label: discreetMode ? 'Rising Energy Phase' : 'Follicular Phase',
    },
    ovulation: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      accent: '#F59E0B',
      label: discreetMode ? 'Peak Vitality Window' : 'Ovulation & Fertile Window',
    },
    luteal: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-800',
      accent: '#8B5CF6',
      label: discreetMode ? 'Gentle Balance Phase' : 'Luteal Phase',
    },
  }[cycleStatus.phase];

  // SVG circular dial geometry
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (cycleStatus.cyclePercent / 100) * circumference;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Account & Girls' Health Setup Profile Bar */}
      <div className="bg-gradient-to-r from-[#FDF2F4] via-[#FAF7F5] to-white rounded-2xl p-4 sm:p-5 border border-[#C54B6C]/15 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#C54B6C] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
            {isAuthenticated ? (user?.name ? user.name[0].toUpperCase() : 'U') : '🌸'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif font-bold text-base text-[#2D2328]">
                {isAuthenticated ? `${user?.name}’s Health Profile` : 'Personalized Girls’ Health Companion'}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#C54B6C] border border-[#C54B6C]/20 shadow-2xs">
                {healthProfile.lifeStage === 'teen'
                  ? '🌸 Teen Mode (12-18)'
                  : healthProfile.healthConditions.includes('PCOS')
                  ? '💜 PCOS Tracking'
                  : healthProfile.lifeStage === 'fertility'
                  ? '✨ Fertility Awareness'
                  : '🌿 Regular Baseline'}
              </span>
              {isAuthenticated && (
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Account Vault Synced
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-[#7B6A74]">
              <span>Rhythm: {settings.cycleLength}d cycle · {settings.periodLength}d period</span>
              <span aria-hidden="true">·</span>
              <span>Flow: {healthProfile.flowBaseline || 'moderate'}</span>
              {healthProfile.healthConditions.length > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#9F3251] font-medium">
                    {healthProfile.healthConditions.join(', ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => setIsHealthSetupOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#2D2328]/12 text-xs font-semibold text-[#2D2328] hover:text-[#C54B6C] hover:border-[#C54B6C]/30 transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-[#C54B6C]" />
              <span>Health Setup Settings</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('signin');
                  setIsAuthModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#2D2328]/12 text-xs font-semibold text-[#2D2328] hover:text-[#C54B6C]"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#C54B6C] text-white text-xs font-bold shadow-xs hover:bg-[#B33F5E] flex items-center gap-1"
              >
                <span>Save to Account</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Banner / Hero Welcome */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#2D2328]/08 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Dial Visualizer */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 220 220">
              {/* Background circle */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                stroke="#F0ECE9"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Progress stroke */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                stroke={phaseTheme.accent}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={progressOffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Content of Dial */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <span className="text-xs uppercase tracking-wider text-[#64555D] font-medium">
                Cycle Day
              </span>
              <div className="text-4xl font-serif font-bold text-[#2D2328] my-0.5">
                {cycleStatus.currentDay}
                <span className="text-sm font-sans font-normal text-[#64555D]">
                  /{settings.cycleLength}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${phaseTheme.bg} ${phaseTheme.text}`}>
                {phaseTheme.label}
              </span>
            </div>
          </div>

          {/* Core Cycle Summary & Projections */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div>
              <div className="text-xs font-medium text-[#64555D] flex items-center justify-center lg:justify-start gap-2">
                <span>Today · {formatDisplayDate(todayIso, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span aria-hidden="true">·</span>
                <span>{settings.cycleLength}-Day Rhythm</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-[#2D2328] mt-1 text-balance">
                {discreetMode
                  ? 'Your natural body rhythm is in balance.'
                  : cycleStatus.phase === 'menstrual'
                  ? 'Your period is active. Be gentle with yourself.'
                  : cycleStatus.phase === 'ovulation'
                  ? 'You are in your fertile ovulation window.'
                  : cycleStatus.phase === 'follicular'
                  ? 'Estrogen is rising — your focus and energy are peaking.'
                  : 'Progesterone is guiding your body into restful restoration.'}
              </h1>
              <p className="text-sm text-[#64555D] mt-2 max-w-xl">
                {cycleStatus.phaseDescription}
              </p>
            </div>

            {/* Metric row: Unboxed clean metadata (zero-pill rule) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-[#2D2328]/08 text-left">
              <div>
                <span className="text-xs text-[#64555D] block">Next Period In</span>
                <div className="text-lg font-serif font-semibold text-[#2D2328] tabular-nums mt-0.5">
                  {cycleStatus.daysUntilNextPeriod} days
                </div>
                <span className="text-[11px] text-[#64555D]">
                  Est. {formatDisplayDate(cycleStatus.nextPeriodDate, { month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#64555D] block">Fertility Probability</span>
                <div className="text-lg font-serif font-semibold text-[#2D2328] mt-0.5">
                  {cycleStatus.fertilityStatus}
                </div>
                <span className="text-[11px] text-[#64555D]">
                  {cycleStatus.phase === 'ovulation' ? 'Conception peak' : 'Natural low chance'}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="text-xs text-[#64555D] block">Ovulation Target</span>
                <div className="text-lg font-serif font-semibold text-[#2D2328] tabular-nums mt-0.5">
                  {formatDisplayDate(cycleStatus.ovulationDate, { month: 'short', day: 'numeric' })}
                </div>
                <span className="text-[11px] text-[#64555D]">
                  Window: {formatDisplayDate(cycleStatus.fertileWindowStart, { month: 'short', day: 'numeric' })} – {formatDisplayDate(cycleStatus.fertileWindowEnd, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => openLogModalForDate(todayIso)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#C54B6C] rounded-lg hover:bg-[#B33F5E] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{todayLog ? 'Edit Today\'s Symptoms' : 'Log Symptoms & Flow'}</span>
              </button>

              <button
                onClick={onNavigateToInsights}
                className="px-4 py-2 text-xs font-medium text-[#2D2328] bg-[#FAF7F5] border border-[#2D2328]/10 rounded-lg hover:bg-white transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C54B6C]" />
                <span>Personalized AI Insights</span>
              </button>

              <button
                onClick={onNavigateToCalendar}
                className="px-4 py-2 text-xs font-medium text-[#64555D] hover:text-[#2D2328] transition-colors flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Full Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Smart Pad Hygiene Companion + Daily Wellness Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: NIVA Smart Pad Hygiene Timer & Stock Monitor */}
        <div className="bg-white rounded-2xl p-6 border border-[#2D2328]/08 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FDF2F4] text-[#C54B6C] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#2D2328]">
                    Smart Pad Hygiene Timer
                  </h3>
                  <span className="text-xs text-[#64555D]">
                    Recommended pad change: every {settings.padChangeIntervalHours} hours
                  </span>
                </div>
              </div>
              <button
                onClick={onOpenQR}
                title="Scan NIVA Pad QR code"
                className="text-xs text-[#C54B6C] hover:underline flex items-center gap-1 font-medium"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Verify Pad</span>
              </button>
            </div>

            {/* Timer visual */}
            <div className={`mt-5 p-4 rounded-xl border transition-colors ${
              isPadChangeDue
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : 'bg-[#FAF7F5] border-[#2D2328]/06 text-[#2D2328]'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-[#64555D]">
                    Current Pad Worn For
                  </span>
                  <div className="text-3xl font-serif font-bold tabular-nums mt-0.5">
                    {hoursElapsed}h {minutesElapsed}m
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium block">
                    {isPadChangeDue ? '⚠️ Change Recommended' : 'Fresh & Clean'}
                  </span>
                  <span className="text-[11px] text-[#64555D]">
                    Prevents bacteria & friction
                  </span>
                </div>
              </div>

              {isPadChangeDue && (
                <div className="mt-3 text-xs text-amber-800 flex items-start gap-1.5 bg-white/60 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Medical guidance recommends refreshing your pad after 4–6 hours to maintain skin pH balance and avoid bacterial overgrowth.
                  </span>
                </div>
              )}
            </div>

            {/* Pad Supply Counter */}
            <div className="mt-4 flex items-center justify-between text-xs px-1">
              <div className="flex items-center gap-2 text-[#64555D]">
                <Package className="w-4 h-4 text-[#C54B6C]" />
                <span>Active Pack: <strong className="text-[#2D2328] font-medium">{padInventory.productName}</strong></span>
              </div>
              <div className="text-right">
                <span className="tabular-nums font-semibold text-[#2D2328]">
                  {padInventory.padsRemaining} pads remaining
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#2D2328]/08 flex items-center gap-3">
            <button
              onClick={handlePadChange}
              className={`flex-1 py-2.5 px-4 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs ${
                padActionSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#C54B6C] text-white hover:bg-[#B33F5E]'
              }`}
            >
              {padActionSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Timer Reset & Pad Logged!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I Changed My Pad</span>
                </>
              )}
            </button>

            {padInventory.padsRemaining <= 4 && (
              <button
                onClick={onOpenQR}
                className="py-2.5 px-3 text-xs font-medium text-[#7D2840] bg-[#FDF2F4] border border-[#C54B6C]/20 rounded-lg hover:bg-[#F9E6EB] transition-colors whitespace-nowrap"
              >
                Scan New Pack
              </button>
            )}
          </div>
        </div>

        {/* Card 2: Today's Logged Signals & Water Tracker */}
        <div className="bg-white rounded-2xl p-6 border border-[#2D2328]/08 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF7F5] text-[#2D2328] flex items-center justify-center">
                  <Flame className="w-4 h-4 text-[#C54B6C]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#2D2328]">
                    Daily Wellness & Symptoms
                  </h3>
                  <span className="text-xs text-[#64555D]">
                    {todayLog ? 'Logged today' : 'No symptoms recorded yet today'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => openLogModalForDate(todayIso)}
                className="text-xs font-medium text-[#C54B6C] hover:underline"
              >
                {todayLog ? 'Edit Log' : '+ Add Log'}
              </button>
            </div>

            {/* Symptoms summary */}
            <div className="mt-5 space-y-3">
              {todayLog ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {todayLog.flow !== 'none' && (
                      <span className="text-xs px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-[#9F3251] font-medium flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-[#C54B6C]" />
                        <span>Flow: {todayLog.flow}</span>
                      </span>
                    )}
                    {todayLog.symptoms.map((sym, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-md bg-[#FAF7F5] text-[#2D2328] border border-[#2D2328]/08"
                      >
                        {sym}
                      </span>
                    ))}
                    {todayLog.moods.map((mood, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200"
                      >
                        {mood}
                      </span>
                    ))}
                  </div>

                  {todayLog.notes && (
                    <p className="text-xs text-[#64555D] italic bg-[#FAF7F5] p-2.5 rounded-lg border border-[#2D2328]/06 line-clamp-2">
                      "{todayLog.notes}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-[#FAF7F5] rounded-xl p-4 text-center border border-[#2D2328]/06">
                  <p className="text-xs text-[#64555D]">
                    Keep your cycle predictions accurate by logging flow, cramps, energy, or moods.
                  </p>
                  <button
                    onClick={() => openLogModalForDate(todayIso)}
                    className="mt-2.5 px-3 py-1.5 text-xs font-medium text-[#C54B6C] bg-white border border-[#C54B6C]/30 rounded-lg hover:bg-[#FDF2F4] transition-colors"
                  >
                    Log Today's Status
                  </button>
                </div>
              )}

              {/* Water & Sleep Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#2D2328]/06 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#64555D] block">Hydration</span>
                    <span className="text-sm font-semibold text-[#2D2328] tabular-nums">
                      {todayLog?.waterGlasses ?? 0} glasses
                    </span>
                  </div>
                  <button
                    onClick={handleQuickWater}
                    title="Add 1 glass of water"
                    className="p-1.5 rounded-lg bg-white border border-[#2D2328]/10 text-[#C54B6C] hover:bg-[#FDF2F4] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF7F5] border border-[#2D2328]/06 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#64555D] block">Sleep Logged</span>
                    <span className="text-sm font-semibold text-[#2D2328] tabular-nums">
                      {todayLog?.sleepHours ?? 8} hours
                    </span>
                  </div>
                  <Moon className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#2D2328]/08 flex items-center justify-between text-xs text-[#64555D]">
            <span className="flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Private on-device data</span>
            </span>
            <button
              onClick={onNavigateToCalendar}
              className="text-[#C54B6C] font-medium hover:underline flex items-center gap-1"
            >
              <span>View Past History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Intelligence Teaser & Science Corner */}
      <div className="bg-gradient-to-br from-[#FFF5F7] via-white to-[#FAF7F5] rounded-2xl p-6 border border-[#C54B6C]/20 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C54B6C]" />
              <span className="text-xs font-semibold text-[#7D2840] uppercase tracking-wider">
                NIVA AI Cycle Guide
              </span>
            </div>
            <h3 className="text-lg font-serif font-semibold text-[#2D2328]">
              {cycleStatus.phase === 'menstrual'
                ? 'Iron Replenishment & Cramp Easing for Day ' + cycleStatus.currentDay
                : cycleStatus.phase === 'ovulation'
                ? 'Natural Cervical Mucus & Fertile Window Signals'
                : cycleStatus.phase === 'follicular'
                ? 'Harnessing the Estrogen Surge for Cognitive Clarity'
                : 'Luteal PMS Soothing & Metabolic Support'}
            </h3>
            <p className="text-xs text-[#64555D] max-w-2xl">
              Get an instant, AI-generated scientific breakdown of today's hormonal shifts, recommended herbal teas, and tailored workout intensity.
            </p>
          </div>

          <button
            onClick={onNavigateToInsights}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#C54B6C] rounded-lg hover:bg-[#B33F5E] transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Today's AI Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
