export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export type LifeStage = 'teen' | 'regular' | 'fertility' | 'postpartum' | 'perimenopause';
export type FlowBaseline = 'light' | 'moderate' | 'heavy' | 'very_heavy';
export type DysmenorrheaLevel = 'none' | 'mild' | 'moderate' | 'severe';

export interface GirlsHealthProfile {
  lifeStage: LifeStage;
  age?: number;
  averageCycleLength: number; // e.g. 28
  isCycleIrregular: boolean;
  averagePeriodLength: number; // e.g. 5
  flowBaseline: FlowBaseline;
  dysmenorrheaBaseline: DysmenorrheaLevel;
  healthConditions: string[]; // e.g. ['PCOS', 'Endometriosis', 'PMDD', 'Sensitive Skin / Pad Allergy', 'Thyroid Irregularity']
  primaryGoals: string[]; // e.g. ['Track period reliably', 'Manage cramps & symptoms', 'Predict fertile window', 'Prevent skin irritation with organic pads', 'Teen puberty confidence']
  padChangeReminderHours: number; // e.g. 4
  discreetNotifications: boolean; // disguise alerts as "Drink water" / "Health pause"
  periodNoticeDaysBefore: number; // e.g. 2
  pinCode?: string; // 4-digit security PIN for private medical data
  pinEnabled: boolean;
  notes?: string;
  doctorNotes?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isCarePlus: boolean;
  healthProfile: GirlsHealthProfile;
  settings: CycleSettings;
  padInventory: PadInventory;
  dailyLogs: Record<string, DailyLog>;
}

export interface AuthSession {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    isCarePlus: boolean;
  };
  token: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  flow: FlowIntensity;
  symptoms: string[];
  moods: string[];
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'egg-white' | 'watery' | '';
  sleepHours: number;
  waterGlasses: number;
  painLevel: number; // 0 to 10
  notes: string;
}

export interface CycleSettings {
  cycleLength: number; // default 28
  periodLength: number; // default 5
  lastPeriodStart: string; // YYYY-MM-DD
  isTeenMode: boolean;
  padChangeIntervalHours: number; // default 4
  notificationsEnabled: boolean;
}

export interface PadInventory {
  padsRemaining: number;
  activeBatchCode: string;
  lastChangedAt: string; // ISO string
  packSize: number;
  productName: string;
}

export interface AIInsight {
  summary: string;
  bodySignals: string;
  nutritionTip: string;
  movementTip: string;
  padAdvice: string;
  disclaimer: string;
}

export interface BatchVerificationResult {
  verified: boolean;
  batchNumber: string;
  productName: string;
  absorbency: string;
  coreMaterial: string;
  wings: string;
  toxins: string;
  testedBy: string;
  manufacturedDate: string;
  expiryDate: string;
  padCount: number;
  bonusPerk: string;
}

export interface NIVAProduct {
  id: string;
  name: string;
  tagline: string;
  category: 'daily' | 'night' | 'teen' | 'combo' | 'maternity';
  flowType: string;
  absorbencyDrops: number; // 1-5
  lengthMm: number;
  count: number;
  price?: number;
  originalPrice?: number;
  features: string[];
  materialDescription: string;
  bestFor: string;
  isPopular?: boolean;
}

export interface AcademyArticle {
  id: string;
  title: string;
  category: 'Basics' | 'Teen' | 'Science' | 'Hygiene' | 'Nutrition';
  readTime: string;
  summary: string;
  content: string[];
  keyTakeaways: string[];
}
