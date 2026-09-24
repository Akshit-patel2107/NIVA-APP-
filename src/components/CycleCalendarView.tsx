import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Droplet,
  Sparkles,
  Plus,
  Info,
  CheckCircle2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useCycle } from '../context/CycleContext';
import {
  getStatusForDate,
  formatDateToIso,
  parseIsoDate,
  formatDisplayDate,
  addDays,
  getUpcomingCycles,
} from '../utils/cycleEngine';

export function CycleCalendarView() {
  const {
    settings,
    dailyLogs,
    selectedDate,
    setSelectedDate,
    openLogModalForDate,
    discreetMode,
  } = useCycle();

  // Active viewing month
  const [viewDate, setViewDate] = useState<Date>(() => parseIsoDate(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build grid items
  const calendarCells = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const d = new Date(year, month - 1, dayNum);
    calendarCells.push({
      date: d,
      iso: formatDateToIso(d),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    calendarCells.push({
      date: dateObj,
      iso: formatDateToIso(dateObj),
      isCurrentMonth: true,
    });
  }

  // Next month leading days (fill up to 35 or 42 cells)
  const remaining = 35 - calendarCells.length > 0 ? 35 - calendarCells.length : (42 - calendarCells.length);
  for (let d = 1; d <= remaining; d++) {
    const dateObj = new Date(year, month + 1, d);
    calendarCells.push({
      date: dateObj,
      iso: formatDateToIso(dateObj),
      isCurrentMonth: false,
    });
  }

  const selectedStatus = getStatusForDate(selectedDate, settings);
  const selectedLog = dailyLogs[selectedDate];

  const upcomingCycles = getUpcomingCycles(settings, 3);

  // Month title
  const monthName = firstDayOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Calendar Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#2D2328]/08 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#2D2328]/08">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#64555D] font-medium">
              {discreetMode ? 'Personal Rhythm Tracker' : 'Cycle Calendar & Phase Forecast'}
            </span>
            <h2 className="text-2xl font-serif font-bold text-[#2D2328] mt-0.5">
              {monthName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg border border-[#2D2328]/10 hover:bg-[#FAF7F5] transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4 text-[#2D2328]" />
            </button>
            <button
              onClick={() => setViewDate(new Date())}
              className="px-3 py-1.5 text-xs font-medium border border-[#2D2328]/10 rounded-lg hover:bg-[#FAF7F5] transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-lg border border-[#2D2328]/10 hover:bg-[#FAF7F5] transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4 text-[#2D2328]" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-4 text-xs text-[#64555D]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#C54B6C]" />
            <span>{discreetMode ? 'Phase 1 (Active)' : 'Menstrual Period'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span>{discreetMode ? 'Peak Rhythm' : 'Ovulation Day'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-300" />
            <span>{discreetMode ? 'High Window' : 'Fertile Window'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-300" />
            <span>Follicular</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300" />
            <span>Luteal</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pt-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-xs font-semibold text-[#64555D] py-2 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}

          {calendarCells.map((cell) => {
            const status = getStatusForDate(cell.iso, settings);
            const log = dailyLogs[cell.iso];
            const isSelected = cell.iso === selectedDate;
            const isToday = cell.iso === formatDateToIso(new Date());

            let cellBg = 'hover:bg-[#FAF7F5] text-[#2D2328]';
            if (status.isPeriodDay) {
              cellBg = 'bg-rose-50 text-[#7D2840] font-semibold';
            } else if (status.isOvulationDay) {
              cellBg = 'bg-amber-50 text-amber-900 font-semibold ring-1 ring-amber-400';
            } else if (status.isFertileDay) {
              cellBg = 'bg-purple-50/70 text-purple-900';
            }

            if (!cell.isCurrentMonth) {
              cellBg += ' opacity-40';
            }

            return (
              <button
                key={cell.iso}
                onClick={() => setSelectedDate(cell.iso)}
                className={`relative min-h-[58px] sm:min-h-[72px] p-1.5 rounded-xl flex flex-col items-center justify-between border transition-all text-left ${
                  isSelected
                    ? 'ring-2 ring-[#C54B6C] border-[#C54B6C] bg-white shadow-xs z-10'
                    : 'border-[#2D2328]/06'
                } ${cellBg}`}
              >
                <div className="w-full flex items-center justify-between text-xs">
                  <span
                    className={`w-5 h-5 flex items-center justify-center rounded-full tabular-nums ${
                      isToday ? 'bg-[#C54B6C] text-white font-bold' : ''
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>

                  {status.isPeriodDay && (
                    <Droplet className="w-3 h-3 text-[#C54B6C] fill-[#C54B6C]" />
                  )}
                </div>

                {/* Status indicator dot or logged preview */}
                <div className="w-full flex items-center justify-center gap-1 mt-auto">
                  {log && (
                    <span
                      title="Symptoms logged"
                      className="w-1.5 h-1.5 rounded-full bg-[#C54B6C]"
                    />
                  )}
                  {status.isOvulationDay && (
                    <span className="text-[10px] hidden sm:inline text-amber-700 font-medium">
                      Ovulation
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Selected Day Details & Future Cycles Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selected Day Inspector */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-[#2D2328]/08 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[#64555D] font-medium block">
                Selected Day
              </span>
              <h3 className="text-lg font-serif font-bold text-[#2D2328]">
                {formatDisplayDate(selectedDate, { weekday: 'short', month: 'short', day: 'numeric' })}
              </h3>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                selectedStatus.isPeriodDay
                  ? 'bg-rose-50 text-[#7D2840]'
                  : selectedStatus.isOvulationDay
                  ? 'bg-amber-50 text-amber-800'
                  : selectedStatus.isFertileDay
                  ? 'bg-purple-50 text-purple-800'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              {selectedStatus.phaseName}
            </span>
          </div>

          <div className="p-3.5 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/06 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64555D]">Period Flow:</span>
              <span className="font-semibold capitalize text-[#2D2328]">
                {selectedLog?.flow ?? (selectedStatus.isPeriodDay ? 'Predicted Period' : 'None')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64555D]">Fertility Probability:</span>
              <span className="font-semibold text-[#2D2328]">
                {selectedStatus.isOvulationDay
                  ? 'Peak (Ovulation)'
                  : selectedStatus.isFertileDay
                  ? 'High Fertile Window'
                  : 'Low'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64555D]">Intimate Hygiene:</span>
              <span className="text-[#2D2328]">
                {selectedStatus.isPeriodDay
                  ? 'NIVA Day/Night Pad'
                  : 'Breathable Cotton Liner'}
              </span>
            </div>
          </div>

          {/* Log details if available */}
          {selectedLog ? (
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-[#2D2328] block">
                Recorded Symptoms:
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedLog.symptoms.map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-white border border-[#2D2328]/10 text-[#2D2328]"
                  >
                    {s}
                  </span>
                ))}
                {selectedLog.moods.map((m, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-800"
                  >
                    {m}
                  </span>
                ))}
              </div>
              {selectedLog.notes && (
                <p className="italic text-[#64555D] mt-2 bg-[#FAF7F5] p-2.5 rounded-lg border border-[#2D2328]/06">
                  "{selectedLog.notes}"
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#64555D]">
              No symptoms or journal notes recorded for this date yet.
            </p>
          )}

          <button
            onClick={() => openLogModalForDate(selectedDate)}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#C54B6C] rounded-lg hover:bg-[#B33F5E] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{selectedLog ? 'Edit Entry for this Day' : 'Log Entry for this Day'}</span>
          </button>
        </div>

        {/* Future Cycles Projection & Consistency Graph */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#2D2328]/08 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-serif font-bold text-[#2D2328]">
              Upcoming Cycle Forecasts
            </h3>
            <p className="text-xs text-[#64555D] mt-0.5">
              Based on your regular {settings.cycleLength}-day cycle rhythm. Keep logging to refine statistical accuracy.
            </p>
          </div>

          <div className="space-y-3">
            {upcomingCycles.map((cyc) => (
              <div
                key={cyc.cycleIndex}
                className="p-4 rounded-xl border border-[#2D2328]/08 hover:border-[#C54B6C]/30 bg-[#FAF7F5]/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#2D2328] text-sm">
                      Cycle {cyc.cycleIndex}
                    </span>
                    <span className="text-[11px] text-[#64555D]">
                      ({settings.periodLength} days estimated flow)
                    </span>
                  </div>
                  <div className="text-[#64555D]">
                    Period: <strong className="text-[#2D2328]">{formatDisplayDate(cyc.startDate, { month: 'short', day: 'numeric' })} – {formatDisplayDate(cyc.endDate, { month: 'short', day: 'numeric' })}</strong>
                  </div>
                </div>

                <div className="text-left sm:text-right text-[#64555D]">
                  <span className="block font-medium text-purple-900">
                    Fertile Window: {formatDisplayDate(cyc.fertileStart, { month: 'short', day: 'numeric' })} – {formatDisplayDate(cyc.ovulationDate, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[11px] text-amber-700">
                    Estimated Ovulation: {formatDisplayDate(cyc.ovulationDate, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Cycle Variance & Regularity Analytics */}
          <div className="pt-4 border-t border-[#2D2328]/08">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#2D2328]">
                Cycle Length Consistency (Recent 4 Cycles)
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>96% High Regularity</span>
              </span>
            </div>

            {/* SVG Chart */}
            <div className="h-28 flex items-end justify-between gap-4 pt-4 px-4 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/06">
              {[
                { cycle: '3 Cycles Ago', length: 28 },
                { cycle: '2 Cycles Ago', length: 29 },
                { cycle: 'Last Cycle', length: 28 },
                { cycle: 'Current Predicted', length: settings.cycleLength },
              ].map((item, idx) => {
                const heightPercent = Math.min(100, Math.max(30, (item.length / 35) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[11px] font-semibold text-[#2D2328] tabular-nums">
                      {item.length}d
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[48px] rounded-t-lg transition-all ${
                        idx === 3 ? 'bg-[#C54B6C]' : 'bg-[#C54B6C]/40'
                      }`}
                    />
                    <span className="text-[10px] text-[#64555D] truncate max-w-[70px]">
                      {item.cycle}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
