import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  CycleSettings,
  DailyLog,
  PadInventory,
  GirlsHealthProfile,
} from '../types';
import {
  calculateCycleStatus,
  formatDateToIso,
  addDays,
  CycleStatus,
} from '../utils/cycleEngine';
import { useAuth } from './AuthContext';

interface CycleContextType {
  settings: CycleSettings;
  updateSettings: (newSettings: Partial<CycleSettings>) => void;
  discreetMode: boolean;
  setDiscreetMode: React.Dispatch<React.SetStateAction<boolean>>;
  dailyLogs: Record<string, DailyLog>;
  saveDailyLog: (log: DailyLog) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isLogModalOpen: boolean;
  setIsLogModalOpen: (open: boolean) => void;
  openLogModalForDate: (date: string) => void;
  padInventory: PadInventory;
  changePadNow: () => void;
  restockPads: (count: number, batchCode?: string, productName?: string) => void;
  cycleStatus: CycleStatus;
  isCarePlus: boolean;
  setIsCarePlus: (val: boolean) => void;
  timeSinceLastPadChangeMinutes: number;
  isPadChangeDue: boolean;
  resetAllData: () => void;
  healthProfile: GirlsHealthProfile;
}

const STORAGE_KEY = 'niva_menstrual_wellness_v1';

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export function CycleProvider({ children }: { children: React.ReactNode }) {
  const { user, initialAccountData, syncAccountData, healthProfile } = useAuth();

  // Compute default initial lastPeriodStart to 13 days ago (puts user at Day 14 Ovulation Window for immediate richness)
  const defaultLastPeriodStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 13);
    return formatDateToIso(d);
  }, []);

  const [settings, setSettings] = useState<CycleSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      cycleLength: 28,
      periodLength: 5,
      lastPeriodStart: defaultLastPeriodStart,
      isTeenMode: false,
      padChangeIntervalHours: 4,
      notificationsEnabled: true,
    };
  });

  const [discreetMode, setDiscreetMode] = useState<boolean>(() => {
    return Boolean(healthProfile?.discreetNotifications);
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateToIso(new Date()));
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [isCarePlus, setIsCarePlus] = useState<boolean>(false);

  const [padInventory, setPadInventory] = useState<PadInventory>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_inventory`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      padsRemaining: 12,
      activeBatchCode: 'NIVA-ORG-2849',
      lastChangedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      packSize: 14,
      productName: 'NIVA Ultra-Thin Day Comfort',
    };
  });

  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }

    const today = new Date();
    const todayIso = formatDateToIso(today);
    const dayAgo1 = formatDateToIso(addDays(today, -1));
    const dayAgo2 = formatDateToIso(addDays(today, -2));
    const startIso = defaultLastPeriodStart;

    return {
      [startIso]: {
        date: startIso,
        flow: 'heavy',
        symptoms: ['Cramps', 'Lower Back Ache', 'Fatigue'],
        moods: ['Sensitive', 'Low Energy'],
        sleepHours: 7.5,
        waterGlasses: 6,
        painLevel: 5,
        notes: 'Cycle started in morning. Used NIVA Day Comfort with heating pad.',
      },
      [dayAgo2]: {
        date: dayAgo2,
        flow: 'none',
        symptoms: ['Mild Breast Tenderness'],
        moods: ['Energized', 'Calm'],
        cervicalMucus: 'creamy',
        sleepHours: 8,
        waterGlasses: 8,
        painLevel: 1,
        notes: 'Good energy, went for a 30m brisk walk.',
      },
      [dayAgo1]: {
        date: dayAgo1,
        flow: 'none',
        symptoms: ['Clear High Energy'],
        moods: ['Joyful', 'Energetic'],
        cervicalMucus: 'egg-white',
        sleepHours: 7.5,
        waterGlasses: 9,
        painLevel: 0,
        notes: 'Fertile window sensation, cervical mucus stretchy.',
      },
      [todayIso]: {
        date: todayIso,
        flow: 'none',
        symptoms: ['Mild Lower Abdomen Twinge', 'Good Skin'],
        moods: ['Focused', 'Calm'],
        cervicalMucus: 'egg-white',
        sleepHours: 8,
        waterGlasses: 7,
        painLevel: 1,
        notes: 'Ovulation peak feeling. Hydrating with mint lemon water.',
      },
    };
  });

  // Whenever user switches or logs in and backend provides account data:
  useEffect(() => {
    if (initialAccountData) {
      if (initialAccountData.settings) {
        setSettings(initialAccountData.settings);
      }
      if (initialAccountData.padInventory) {
        setPadInventory(initialAccountData.padInventory);
      }
      if (initialAccountData.dailyLogs) {
        setDailyLogs(initialAccountData.dailyLogs);
      }
      if (typeof initialAccountData.isCarePlus === 'boolean') {
        setIsCarePlus(initialAccountData.isCarePlus);
      }
    }
  }, [initialAccountData]);

  // Synchronize discreet mode with healthProfile preferences
  useEffect(() => {
    if (healthProfile?.discreetNotifications !== undefined) {
      setDiscreetMode(healthProfile.discreetNotifications);
    }
  }, [healthProfile?.discreetNotifications]);

  // Calculate live cycle status
  const cycleStatus = useMemo(() => {
    return calculateCycleStatus(settings);
  }, [settings]);

  // Track elapsed pad change timer
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const timeSinceLastPadChangeMinutes = useMemo(() => {
    const last = new Date(padInventory.lastChangedAt).getTime();
    const diff = Math.max(0, now - last);
    return Math.floor(diff / (1000 * 60));
  }, [now, padInventory.lastChangedAt]);

  const isPadChangeDue = useMemo(() => {
    const targetMinutes = (settings.padChangeIntervalHours || 4) * 60;
    return timeSinceLastPadChangeMinutes >= targetMinutes;
  }, [timeSinceLastPadChangeMinutes, settings.padChangeIntervalHours]);

  // Persist state changes locally
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(dailyLogs));
    } catch (e) {
      console.error(e);
    }
  }, [dailyLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(padInventory));
    } catch (e) {
      console.error(e);
    }
  }, [padInventory]);

  const updateSettings = (newSettings: Partial<CycleSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      syncAccountData({ settings: merged });
      return merged;
    });
  };

  const saveDailyLog = (log: DailyLog) => {
    setDailyLogs((prev) => {
      const updated = {
        ...prev,
        [log.date]: log,
      };
      syncAccountData({ dailyLogs: updated });
      return updated;
    });
  };

  const openLogModalForDate = (date: string) => {
    setSelectedDate(date);
    setIsLogModalOpen(true);
  };

  const changePadNow = () => {
    setPadInventory((prev) => {
      const updated = {
        ...prev,
        padsRemaining: Math.max(0, prev.padsRemaining - 1),
        lastChangedAt: new Date().toISOString(),
      };
      syncAccountData({ padInventory: updated });
      return updated;
    });
  };

  const restockPads = (count: number, batchCode?: string, productName?: string) => {
    setPadInventory((prev) => {
      const updated = {
        ...prev,
        padsRemaining: prev.padsRemaining + count,
        activeBatchCode: batchCode || prev.activeBatchCode,
        productName: productName || prev.productName,
      };
      syncAccountData({ padInventory: updated });
      return updated;
    });
  };

  const handleSetCarePlus = (val: boolean) => {
    setIsCarePlus(val);
    syncAccountData({ isCarePlus: val });
  };

  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_settings`);
    localStorage.removeItem(`${STORAGE_KEY}_logs`);
    localStorage.removeItem(`${STORAGE_KEY}_inventory`);
    window.location.reload();
  };

  return (
    <CycleContext.Provider
      value={{
        settings,
        updateSettings,
        discreetMode,
        setDiscreetMode,
        dailyLogs,
        saveDailyLog,
        selectedDate,
        setSelectedDate,
        isLogModalOpen,
        setIsLogModalOpen,
        openLogModalForDate,
        padInventory,
        changePadNow,
        restockPads,
        cycleStatus,
        isCarePlus,
        setIsCarePlus: handleSetCarePlus,
        timeSinceLastPadChangeMinutes,
        isPadChangeDue,
        resetAllData,
        healthProfile,
      }}
    >
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  const context = useContext(CycleContext);
  if (!context) {
    throw new Error('useCycle must be used within a CycleProvider');
  }
  return context;
}
