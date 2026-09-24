import { CyclePhase, CycleSettings, DailyLog } from '../types';

export function formatDateToIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDate(isoStr: string): Date {
  const [year, month, day] = isoStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(isoStr: string, options?: Intl.DateTimeFormatOptions): string {
  const d = parseIsoDate(isoStr);
  return d.toLocaleDateString('en-US', options || { month: 'short', day: 'numeric', year: 'numeric' });
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function differenceInCalendarDays(later: Date, earlier: Date): number {
  const utc1 = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate());
  const utc2 = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
  return Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
}

export interface CycleStatus {
  currentDay: number;
  phase: CyclePhase;
  phaseName: string;
  phaseDescription: string;
  fertilityStatus: 'Low' | 'Medium' | 'High' | 'Peak (Ovulation)';
  daysUntilNextPeriod: number;
  nextPeriodDate: string;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  cyclePercent: number;
}

export function calculateCycleStatus(settings: CycleSettings, today: Date = new Date()): CycleStatus {
  const lastStart = parseIsoDate(settings.lastPeriodStart);
  const diffDays = differenceInCalendarDays(today, lastStart);

  // Normalize to 1 .. cycleLength (handling missed cycles or ongoing tracking)
  let currentDay = (diffDays % settings.cycleLength);
  if (currentDay < 0) {
    currentDay += settings.cycleLength;
  }
  currentDay += 1; // 1-indexed

  // Estimated Ovulation is typically 14 days before next period
  const ovulationDay = Math.max(settings.periodLength + 2, settings.cycleLength - 14);
  const fertileStartDay = Math.max(settings.periodLength + 1, ovulationDay - 5);
  const fertileEndDay = Math.min(settings.cycleLength, ovulationDay + 1);

  let phase: CyclePhase = 'follicular';
  let phaseName = 'Follicular Phase';
  let phaseDescription = 'Rising estrogen promotes natural clarity, optimism, and renewed physical vitality.';
  let fertilityStatus: 'Low' | 'Medium' | 'High' | 'Peak (Ovulation)' = 'Low';

  if (currentDay <= settings.periodLength) {
    phase = 'menstrual';
    phaseName = 'Menstrual Phase';
    phaseDescription = 'Hormone levels reset. Prioritize warmth, gentle rest, hydration, and comfortable organic pads.';
    fertilityStatus = 'Low';
  } else if (currentDay === ovulationDay) {
    phase = 'ovulation';
    phaseName = 'Ovulation Day';
    phaseDescription = 'Luteinizing hormone (LH) surge releases an egg. Peak energy, communication, and high body temperature.';
    fertilityStatus = 'Peak (Ovulation)';
  } else if (currentDay >= fertileStartDay && currentDay <= fertileEndDay) {
    phase = 'ovulation';
    phaseName = 'Fertile Window';
    phaseDescription = 'Sperm can survive up to 5 days in cervical fluid. Optimal conception probability.';
    fertilityStatus = currentDay >= ovulationDay - 2 ? 'High' : 'Medium';
  } else if (currentDay > fertileEndDay) {
    phase = 'luteal';
    phaseName = 'Luteal Phase';
    phaseDescription = 'Progesterone peaks then gradually dips. You may experience PMS, food cravings, or inward introspection.';
    fertilityStatus = 'Low';
  }

  const daysRemaining = settings.cycleLength - currentDay + 1;
  const cycleCount = Math.floor(diffDays / settings.cycleLength);
  const currentCycleStartDate = addDays(lastStart, cycleCount * settings.cycleLength);
  const nextPeriodDateObj = addDays(currentCycleStartDate, settings.cycleLength);
  const ovulationDateObj = addDays(currentCycleStartDate, ovulationDay - 1);
  const fertileStartObj = addDays(currentCycleStartDate, fertileStartDay - 1);
  const fertileEndObj = addDays(currentCycleStartDate, fertileEndDay - 1);

  const cyclePercent = Math.min(100, Math.round((currentDay / settings.cycleLength) * 100));

  return {
    currentDay,
    phase,
    phaseName,
    phaseDescription,
    fertilityStatus,
    daysUntilNextPeriod: daysRemaining,
    nextPeriodDate: formatDateToIso(nextPeriodDateObj),
    ovulationDate: formatDateToIso(ovulationDateObj),
    fertileWindowStart: formatDateToIso(fertileStartObj),
    fertileWindowEnd: formatDateToIso(fertileEndObj),
    cyclePercent,
  };
}

export function getUpcomingCycles(settings: CycleSettings, count = 3): Array<{
  cycleIndex: number;
  startDate: string;
  endDate: string;
  fertileStart: string;
  ovulationDate: string;
}> {
  const currentStatus = calculateCycleStatus(settings);
  const results = [];
  const baseStart = parseIsoDate(currentStatus.nextPeriodDate);
  const ovulationOffset = settings.cycleLength - 14;

  for (let i = 0; i < count; i++) {
    const cycleStart = addDays(baseStart, i * settings.cycleLength);
    const cycleEnd = addDays(cycleStart, settings.periodLength - 1);
    const ovDate = addDays(cycleStart, ovulationOffset - 1);
    const fStart = addDays(ovDate, -5);

    results.push({
      cycleIndex: i + 1,
      startDate: formatDateToIso(cycleStart),
      endDate: formatDateToIso(cycleEnd),
      fertileStart: formatDateToIso(fStart),
      ovulationDate: formatDateToIso(ovDate),
    });
  }

  return results;
}

// Predict status for any arbitrary calendar date
export function getStatusForDate(dateIso: string, settings: CycleSettings): {
  phase: CyclePhase;
  phaseName: string;
  isPeriodDay: boolean;
  isFertileDay: boolean;
  isOvulationDay: boolean;
} {
  const targetDate = parseIsoDate(dateIso);
  const lastStart = parseIsoDate(settings.lastPeriodStart);
  const diffDays = differenceInCalendarDays(targetDate, lastStart);

  let dayInCycle = (diffDays % settings.cycleLength);
  if (dayInCycle < 0) dayInCycle += settings.cycleLength;
  dayInCycle += 1;

  const ovulationDay = Math.max(settings.periodLength + 2, settings.cycleLength - 14);
  const fertileStartDay = Math.max(settings.periodLength + 1, ovulationDay - 5);
  const fertileEndDay = Math.min(settings.cycleLength, ovulationDay + 1);

  const isPeriodDay = dayInCycle <= settings.periodLength;
  const isOvulationDay = dayInCycle === ovulationDay;
  const isFertileDay = dayInCycle >= fertileStartDay && dayInCycle <= fertileEndDay;

  let phase: CyclePhase = 'follicular';
  let phaseName = 'Follicular';

  if (isPeriodDay) {
    phase = 'menstrual';
    phaseName = 'Menstrual';
  } else if (isFertileDay) {
    phase = 'ovulation';
    phaseName = isOvulationDay ? 'Ovulation Day' : 'Fertile Window';
  } else if (dayInCycle > fertileEndDay) {
    phase = 'luteal';
    phaseName = 'Luteal';
  }

  return {
    phase,
    phaseName,
    isPeriodDay,
    isFertileDay,
    isOvulationDay,
  };
}
