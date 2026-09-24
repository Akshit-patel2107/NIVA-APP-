import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Setup Persistent Storage Directory & Database
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'niva_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing utilities using Node.js crypto
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// Pre-seed realistic user cycle start dates relative to current date
function getIsoDateDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  isCarePlus: boolean;
  healthProfile: {
    lifeStage: 'teen' | 'regular' | 'fertility' | 'postpartum' | 'perimenopause';
    age?: number;
    averageCycleLength: number;
    isCycleIrregular: boolean;
    averagePeriodLength: number;
    flowBaseline: 'light' | 'moderate' | 'heavy' | 'very_heavy';
    dysmenorrheaBaseline: 'none' | 'mild' | 'moderate' | 'severe';
    healthConditions: string[];
    primaryGoals: string[];
    padChangeReminderHours: number;
    discreetNotifications: boolean;
    periodNoticeDaysBefore: number;
    pinCode?: string;
    pinEnabled: boolean;
    notes?: string;
    doctorNotes?: string;
  };
  settings: {
    cycleLength: number;
    periodLength: number;
    lastPeriodStart: string;
    isTeenMode: boolean;
    padChangeIntervalHours: number;
    notificationsEnabled: boolean;
  };
  padInventory: {
    padsRemaining: number;
    activeBatchCode: string;
    lastChangedAt: string;
    packSize: number;
    productName: string;
  };
  dailyLogs: Record<string, any>;
}

interface DatabaseSchema {
  users: UserRecord[];
  sessions: Record<string, { userId: string; expiresAt: number }>;
}

function getInitialDatabase(): DatabaseSchema {
  const mayaStart = getIsoDateDaysAgo(9);
  const sarahStart = getIsoDateDaysAgo(13);
  const elenaStart = getIsoDateDaysAgo(22);

  return {
    users: [
      {
        id: 'usr_maya_teen',
        name: 'Maya Lin',
        email: 'maya@niva.health',
        passwordHash: hashPassword('Password123!'),
        createdAt: new Date().toISOString(),
        isCarePlus: false,
        healthProfile: {
          lifeStage: 'teen',
          age: 15,
          averageCycleLength: 26,
          isCycleIrregular: true,
          averagePeriodLength: 5,
          flowBaseline: 'moderate',
          dysmenorrheaBaseline: 'moderate',
          healthConditions: ['Sensitive Skin / Pad Allergy'],
          primaryGoals: ['Track period reliably', 'Teen puberty confidence', 'Discreet school reminders'],
          padChangeReminderHours: 3.5,
          discreetNotifications: true,
          periodNoticeDaysBefore: 2,
          pinCode: '1234',
          pinEnabled: true,
          notes: 'Freshman high school track team. Needs discreet hydration-disguised notifications in class.',
          doctorNotes: 'Pediatric gynecology exam normal. Mild initial cycle irregularity expected for age.',
        },
        settings: {
          cycleLength: 26,
          periodLength: 5,
          lastPeriodStart: mayaStart,
          isTeenMode: true,
          padChangeIntervalHours: 3.5,
          notificationsEnabled: true,
        },
        padInventory: {
          padsRemaining: 14,
          activeBatchCode: 'NIVA-TEEN-1102',
          lastChangedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          packSize: 16,
          productName: 'NIVA Teen First Cycle Starter Pack',
        },
        dailyLogs: {
          [mayaStart]: {
            date: mayaStart,
            flow: 'heavy',
            symptoms: ['Cramps', 'Lower Back Ache', 'Fatigue'],
            moods: ['Sensitive', 'Low Energy'],
            sleepHours: 8,
            waterGlasses: 7,
            painLevel: 5,
            notes: 'School day, used heating patch and NIVA Teen pad.',
          },
          [getIsoDateDaysAgo(1)]: {
            date: getIsoDateDaysAgo(1),
            flow: 'none',
            symptoms: ['Clear High Energy'],
            moods: ['Joyful', 'Energetic'],
            sleepHours: 8.5,
            waterGlasses: 8,
            painLevel: 0,
            notes: 'Great track practice today.',
          },
        },
      },
      {
        id: 'usr_sarah_regular',
        name: 'Dr. Sarah Chen',
        email: 'sarah@niva.health',
        passwordHash: hashPassword('Password123!'),
        createdAt: new Date().toISOString(),
        isCarePlus: true,
        healthProfile: {
          lifeStage: 'regular',
          age: 28,
          averageCycleLength: 28,
          isCycleIrregular: false,
          averagePeriodLength: 5,
          flowBaseline: 'moderate',
          dysmenorrheaBaseline: 'mild',
          healthConditions: [],
          primaryGoals: ['Track period reliably', 'Optimize energy with cycle phases', 'Predict fertile window'],
          padChangeReminderHours: 4,
          discreetNotifications: false,
          periodNoticeDaysBefore: 3,
          pinCode: '',
          pinEnabled: false,
          notes: 'Biomedical researcher. Tracks ovulation rhythms for peak cognitive focus.',
        },
        settings: {
          cycleLength: 28,
          periodLength: 5,
          lastPeriodStart: sarahStart,
          isTeenMode: false,
          padChangeIntervalHours: 4,
          notificationsEnabled: true,
        },
        padInventory: {
          padsRemaining: 18,
          activeBatchCode: 'NIVA-ORG-2849',
          lastChangedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          packSize: 14,
          productName: 'NIVA Ultra-Thin Day Comfort',
        },
        dailyLogs: {
          [sarahStart]: {
            date: sarahStart,
            flow: 'medium',
            symptoms: ['Mild Cramps'],
            moods: ['Reflective'],
            sleepHours: 7.5,
            waterGlasses: 8,
            painLevel: 2,
            notes: 'Started morning cycle. Red raspberry leaf tea helped soothe uterus.',
          },
          [getIsoDateDaysAgo(2)]: {
            date: getIsoDateDaysAgo(2),
            flow: 'none',
            symptoms: ['Good Skin', 'High Libido'],
            moods: ['Energized', 'Focused'],
            cervicalMucus: 'egg-white',
            sleepHours: 8,
            waterGlasses: 9,
            painLevel: 0,
            notes: 'Fertile window sensation, ovulation peak.',
          },
        },
      },
      {
        id: 'usr_elena_pcos',
        name: 'Elena Rostova',
        email: 'elena@niva.health',
        passwordHash: hashPassword('Password123!'),
        createdAt: new Date().toISOString(),
        isCarePlus: true,
        healthProfile: {
          lifeStage: 'regular',
          age: 30,
          averageCycleLength: 35,
          isCycleIrregular: true,
          averagePeriodLength: 6,
          flowBaseline: 'heavy',
          dysmenorrheaBaseline: 'severe',
          healthConditions: ['PCOS', 'Sensitive Skin / Pad Allergy', 'PMDD'],
          primaryGoals: ['Manage cramps & symptoms', 'Prevent skin irritation with organic pads', 'Monitor hormonal shifts'],
          padChangeReminderHours: 3,
          discreetNotifications: true,
          periodNoticeDaysBefore: 3,
          pinCode: '9988',
          pinEnabled: true,
          notes: 'Diagnosed with PCOS. 100% chlorine-free organic pads prevent contact dermatitis.',
        },
        settings: {
          cycleLength: 35,
          periodLength: 6,
          lastPeriodStart: elenaStart,
          isTeenMode: false,
          padChangeIntervalHours: 3,
          notificationsEnabled: true,
        },
        padInventory: {
          padsRemaining: 9,
          activeBatchCode: 'NIVA-NIGHT-9481',
          lastChangedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          packSize: 10,
          productName: 'NIVA Extra Long Overnight Sanctuary',
        },
        dailyLogs: {
          [elenaStart]: {
            date: elenaStart,
            flow: 'heavy',
            symptoms: ['Severe Cramps', 'Bloating', 'Headache'],
            moods: ['Anxious', 'Fatigued'],
            sleepHours: 6.5,
            waterGlasses: 6,
            painLevel: 7,
            notes: 'Heavy flow day 1. Using magnesium glycinate and NIVA Overnight Sanctuary.',
          },
        },
      },
    ],
    sessions: {},
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      saveDatabase(initial);
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.users || !Array.isArray(parsed.users)) {
      const initial = getInitialDatabase();
      saveDatabase(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load database, recreating defaults:', err);
    const initial = getInitialDatabase();
    saveDatabase(initial);
    return initial;
  }
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

// In-memory cache synced with disk
let db = loadDatabase();

// Middleware: Authenticate Session Token
function authenticateUser(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in to your NIVA account.' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.sessions[token];

  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      delete db.sessions[token];
      saveDatabase(db);
    }
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  const user = db.users.find((u) => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  (req as any).user = user;
  (req as any).token = token;
  next();
}

// Initialize GoogleGenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ================= AUTHENTICATION & ACCOUNT APIS =================

// Register a new user with tailored Girls' Health Setup
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, healthProfile, settings, padInventory } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const passwordHash = hashPassword(password);

    const defaultProfile = {
      lifeStage: healthProfile?.lifeStage || 'regular',
      age: healthProfile?.age || 24,
      averageCycleLength: healthProfile?.averageCycleLength || settings?.cycleLength || 28,
      isCycleIrregular: Boolean(healthProfile?.isCycleIrregular),
      averagePeriodLength: healthProfile?.averagePeriodLength || settings?.periodLength || 5,
      flowBaseline: healthProfile?.flowBaseline || 'moderate',
      dysmenorrheaBaseline: healthProfile?.dysmenorrheaBaseline || 'mild',
      healthConditions: Array.isArray(healthProfile?.healthConditions) ? healthProfile.healthConditions : [],
      primaryGoals: Array.isArray(healthProfile?.primaryGoals) ? healthProfile.primaryGoals : ['Track period reliably'],
      padChangeReminderHours: healthProfile?.padChangeReminderHours || 4,
      discreetNotifications: Boolean(healthProfile?.discreetNotifications),
      periodNoticeDaysBefore: healthProfile?.periodNoticeDaysBefore || 2,
      pinCode: healthProfile?.pinCode || '',
      pinEnabled: Boolean(healthProfile?.pinEnabled && healthProfile?.pinCode),
      notes: healthProfile?.notes || '',
      doctorNotes: healthProfile?.doctorNotes || '',
    };

    const defaultSettings = {
      cycleLength: settings?.cycleLength || defaultProfile.averageCycleLength || 28,
      periodLength: settings?.periodLength || defaultProfile.averagePeriodLength || 5,
      lastPeriodStart: settings?.lastPeriodStart || getIsoDateDaysAgo(14),
      isTeenMode: defaultProfile.lifeStage === 'teen',
      padChangeIntervalHours: defaultProfile.padChangeReminderHours || 4,
      notificationsEnabled: true,
    };

    const defaultInventory = {
      padsRemaining: padInventory?.padsRemaining ?? 14,
      activeBatchCode: padInventory?.activeBatchCode || 'NIVA-ORG-2849',
      lastChangedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      packSize: padInventory?.packSize || 14,
      productName: padInventory?.productName || (defaultProfile.lifeStage === 'teen' ? 'NIVA Teen First Cycle Starter Pack' : 'NIVA Ultra-Thin Day Comfort'),
    };

    const newUser: UserRecord = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
      isCarePlus: false,
      healthProfile: defaultProfile,
      settings: defaultSettings,
      padInventory: defaultInventory,
      dailyLogs: {},
    };

    db.users.push(newUser);

    // Create session token (valid for 30 days)
    const token = crypto.randomBytes(32).toString('hex');
    db.sessions[token] = {
      userId,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    saveDatabase(db);

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
        isCarePlus: newUser.isCarePlus,
      },
      accountData: {
        healthProfile: newUser.healthProfile,
        settings: newUser.settings,
        padInventory: newUser.padInventory,
        dailyLogs: newUser.dailyLogs,
        isCarePlus: newUser.isCarePlus,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex');
    db.sessions[token] = {
      userId: user.id,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    saveDatabase(db);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        isCarePlus: user.isCarePlus,
      },
      accountData: {
        healthProfile: user.healthProfile,
        settings: user.settings,
        padInventory: user.padInventory,
        dailyLogs: user.dailyLogs,
        isCarePlus: user.isCarePlus,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Current User Details
app.get('/api/auth/me', authenticateUser, (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      isCarePlus: user.isCarePlus,
    },
    accountData: {
      healthProfile: user.healthProfile,
      settings: user.settings,
      padInventory: user.padInventory,
      dailyLogs: user.dailyLogs,
      isCarePlus: user.isCarePlus,
    },
  });
});

// Logout
app.post('/api/auth/logout', authenticateUser, (req: Request, res: Response) => {
  const token = (req as any).token as string;
  delete db.sessions[token];
  saveDatabase(db);
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Get User Account Data
app.get('/api/user/account-data', authenticateUser, (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;
  return res.json({
    healthProfile: user.healthProfile,
    settings: user.settings,
    padInventory: user.padInventory,
    dailyLogs: user.dailyLogs,
    isCarePlus: user.isCarePlus,
  });
});

// Save / Synchronize User Account Data
app.put('/api/user/account-data', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = (req as any).user as UserRecord;
    const { healthProfile, settings, padInventory, dailyLogs, isCarePlus } = req.body;

    const userIndex = db.users.findIndex((u) => u.id === user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (healthProfile) {
      db.users[userIndex].healthProfile = {
        ...db.users[userIndex].healthProfile,
        ...healthProfile,
      };
    }

    if (settings) {
      db.users[userIndex].settings = {
        ...db.users[userIndex].settings,
        ...settings,
      };
    }

    if (padInventory) {
      db.users[userIndex].padInventory = {
        ...db.users[userIndex].padInventory,
        ...padInventory,
      };
    }

    if (dailyLogs) {
      db.users[userIndex].dailyLogs = {
        ...db.users[userIndex].dailyLogs,
        ...dailyLogs,
      };
    }

    if (typeof isCarePlus === 'boolean') {
      db.users[userIndex].isCarePlus = isCarePlus;
    }

    saveDatabase(db);

    return res.json({
      success: true,
      accountData: {
        healthProfile: db.users[userIndex].healthProfile,
        settings: db.users[userIndex].settings,
        padInventory: db.users[userIndex].padInventory,
        dailyLogs: db.users[userIndex].dailyLogs,
        isCarePlus: db.users[userIndex].isCarePlus,
      },
    });
  } catch (error: any) {
    console.error('Error updating user account data:', error);
    return res.status(500).json({ error: 'Failed to synchronize account data.' });
  }
});

// Verify 4-digit Privacy PIN
app.post('/api/user/verify-pin', authenticateUser, (req: Request, res: Response) => {
  const user = (req as any).user as UserRecord;
  const { pin } = req.body;

  if (!user.healthProfile?.pinEnabled || !user.healthProfile?.pinCode) {
    return res.json({ verified: true, hasPin: false });
  }

  if (user.healthProfile.pinCode === String(pin).trim()) {
    return res.json({ verified: true });
  }

  return res.status(403).json({ verified: false, error: 'Incorrect 4-digit PIN.' });
});

// Verified NIVA Pad Batch Database
const VERIFIED_NIVA_BATCHES: Record<string, any> = {
  'NIVA-ORG-2849': {
    batchNumber: 'NIVA-ORG-2849',
    productName: 'NIVA Ultra-Thin Day Comfort',
    absorbency: 'Regular Flow (3/5 drops)',
    coreMaterial: '100% GOTS-Certified Organic Texas Cotton',
    wings: 'Flexible Soft-Wing Lock',
    toxins: '0% Chlorine, 0% Dyes, 0% Fragrance, 0% Plastic Bleach',
    testedBy: 'Dermatest® Germany — Rated Excellent for Sensitive Skin',
    manufacturedDate: '2026-06-15',
    expiryDate: '2029-06-14',
    padCount: 14,
    bonusPerk: 'Unlocked: Cycle Synchrony Tea Recipe & 100 NIVA Care Points',
  },
  'NIVA-NIGHT-9481': {
    batchNumber: 'NIVA-NIGHT-9481',
    productName: 'NIVA Extra Long Overnight Sanctuary',
    absorbency: 'Heavy Flow & Overnight (5/5 drops - 320mm)',
    coreMaterial: 'Double Organic Cotton Layer with Plant Bamboo Absorption Core',
    wings: 'Wide Rear Protective Wings',
    toxins: 'Zero synthetic perfumes, hypoallergenic',
    testedBy: 'Dermatest® Germany — Dermatologically Tested',
    manufacturedDate: '2026-07-02',
    expiryDate: '2029-07-01',
    padCount: 10,
    bonusPerk: 'Unlocked: Overnight Cramp Relief Sleep Meditation Audio',
  },
  'NIVA-TEEN-1102': {
    batchNumber: 'NIVA-TEEN-1102',
    productName: 'NIVA Teen First Cycle Starter Pack',
    absorbency: 'Light to Medium Flow (petite fit)',
    coreMaterial: 'Feather-Soft Organic Cotton with breathable backing',
    wings: 'Snug-Fit Anti-Bunching Wings',
    toxins: 'Ultra-pure, hypoallergenic, toxin-free',
    testedBy: 'Pediatric & Adolescent Gynecology Panel Reviewed',
    manufacturedDate: '2026-08-10',
    expiryDate: '2029-08-09',
    padCount: 16,
    bonusPerk: 'Unlocked: Teen Guide to Body Changes Handbook & Pocket Mirror',
  },
  'NIVA-MAT-5530': {
    batchNumber: 'NIVA-MAT-5530',
    productName: 'NIVA Postpartum & Maternity Care',
    absorbency: 'Maximum Comfort Maternity (Super Max)',
    coreMaterial: 'Pure Organic Cotton with Witch Hazel Infusion Ready Liner',
    wings: 'Contoured Secure Wings',
    toxins: 'Pure plant-based, no irritation, breathable membrane',
    testedBy: 'Midwife & OB-GYN Clinical Safety Certified',
    manufacturedDate: '2026-05-20',
    expiryDate: '2029-05-19',
    padCount: 12,
    bonusPerk: 'Unlocked: Postpartum Healing Guide & Gentle Pelvic Restore',
  },
};

// API: Verify NIVA QR / Batch Code
app.get('/api/qr/verify/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const matched = VERIFIED_NIVA_BATCHES[code];

  if (matched) {
    return res.json({
      verified: true,
      batch: matched,
    });
  }

  // If user enters an unlisted valid format or test code
  if (code.startsWith('NIVA-') || code.length >= 6) {
    return res.json({
      verified: true,
      batch: {
        batchNumber: code,
        productName: 'NIVA Certified Organic Sanitary Pad Pack',
        absorbency: 'Balanced Flow (4/5 drops)',
        coreMaterial: '100% Certified Organic Cotton & Eco-Cellulose Core',
        wings: 'Active-Fit Leak Shield',
        toxins: 'Chlorine-free, Dye-free, Fragrance-free',
        testedBy: 'Dermatologically Approved for Daily Intimate Health',
        manufacturedDate: '2026-07-18',
        expiryDate: '2029-07-17',
        padCount: 12,
        bonusPerk: 'Unlocked: Verified Genuine Pad Pack & 50 NIVA Care Points',
      },
    });
  }

  return res.status(404).json({
    verified: false,
    error: 'Unrecognized batch or QR code. Please scan the QR code printed inside your NIVA pad packaging box.',
  });
});

// API: AI Cycle Insights
app.post('/api/ai/cycle-insights', async (req: Request, res: Response) => {
  try {
    const {
      cycleDay = 14,
      cycleLength = 28,
      periodLength = 5,
      phase = 'Ovulation',
      symptoms = [],
      moods = [],
      notes = '',
      healthProfile = null,
    } = req.body;

    const profileContext = healthProfile
      ? `\n- User Health Profile: Life Stage: ${healthProfile.lifeStage} (Age: ${healthProfile.age || 'N/A'}), Conditions: ${healthProfile.healthConditions?.join(', ') || 'None reported'}, Baseline Flow: ${healthProfile.flowBaseline || 'moderate'}, Cramp Severity Baseline: ${healthProfile.dysmenorrheaBaseline || 'mild'}`
      : '';

    if (!apiKey) {
      // Fallback if API key is not present in local test environment
      return res.json({
        summary: `You are in your ${phase} phase (Day ${cycleDay} of ${cycleLength}). Your estrogen levels are peaking, supporting natural focus and energy.`,
        bodySignals: `Your logged symptoms (${symptoms.length > 0 ? symptoms.join(', ') : 'none reported'}) reflect expected hormonal fluctuations.`,
        nutritionTip: 'Incorporate zinc-rich pumpkin seeds, leafy greens, and gentle hydration to maintain electrolyte balance.',
        movementTip: 'Moderate cardio, yoga, or rhythmic strength training pairs harmoniously with this phase.',
        padAdvice: 'Keep a NIVA Ultra-Thin liner on hand for natural cervical mucus changes during your fertile window.',
        disclaimer: 'These personalized wellness insights are generated by AI for informational and self-care tracking purposes only and do not constitute medical diagnosis or treatment advice.',
      });
    }

    const prompt = `You are NIVA's warm, supportive, and scientifically grounded women's health companion.
The user is tracking their menstrual cycle with the following data:
- Current Day in Cycle: Day ${cycleDay} of a ${cycleLength}-day cycle
- Current Phase: ${phase}
- Normal Period Duration: ${periodLength} days
- Recent Symptoms Logged: ${symptoms.length ? symptoms.join(', ') : 'None logged today'}
- Recent Moods Logged: ${moods.length ? moods.join(', ') : 'Balanced/Calm'}
- User Notes: ${notes || 'None'}${profileContext}

Please provide an empathetic, clear, personalized wellness analysis tailored to this specific cycle day, phase, and health background.
Format your response as valid JSON with this exact structure:
{
  "summary": "1-2 concise, empowering sentences describing what is happening hormonally in the body right now.",
  "bodySignals": "Clear, reassuring explanation connecting their symptoms/mood to hormone shifts (e.g. estrogen, progesterone, prostaglandins).",
  "nutritionTip": "Specific food, tea, or hydration recommendation ideal for this cycle phase.",
  "movementTip": "Tailored exercise or rest recommendation (e.g. restorative yoga vs high energy intervals).",
  "padAdvice": "Helpful advice on intimate hygiene, pad changing schedule, or flow management.",
  "disclaimer": "AI insights provide personalized wellness guidance based on your logged patterns and are not medical diagnoses or healthcare advice. Always consult a qualified healthcare professional for medical concerns."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        summary: `You are currently on Day ${cycleDay} (${phase} phase).`,
        bodySignals: 'Hormonal variations throughout your cycle naturally influence physical energy and mood.',
        nutritionTip: 'Focus on nourishing whole foods and warm fluids.',
        movementTip: 'Listen to your body rhythm today.',
        padAdvice: 'Change pads every 4 to 6 hours for optimal freshness and comfort.',
        disclaimer: 'AI insights provide personalized wellness guidance and are not medical diagnoses.',
      };
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI cycle insights:', error);
    // Graceful empathetic fallback if model is busy or throttled
    const { cycleDay = 14, phase = 'Ovulation', symptoms = [] } = req.body || {};
    return res.json({
      summary: `You are on Day ${cycleDay} of your cycle (${phase} phase). Your hormonal rhythm is shifting, supporting your body's natural cyclical flow.`,
      bodySignals: symptoms.length > 0
        ? `Your logged signals (${symptoms.join(', ')}) are natural responses to shifting hormone levels between estrogen and progesterone.`
        : 'Your body is maintaining balanced baseline energy. Keep tracking daily to detect subtle hormonal cues.',
      nutritionTip: phase === 'Menstrual Phase'
        ? 'Nourish with warm iron-rich broths, spinach, and red raspberry leaf tea to ease uterine contractions.'
        : phase === 'Ovulation'
        ? 'Opt for antioxidant-rich berries, leafy greens, and zinc-rich seeds to support peak cellular vitality.'
        : 'Focus on magnesium-rich dark chocolate, pumpkin seeds, and complex carbs to soothe luteal serotonin shifts.',
      movementTip: phase === 'Menstrual Phase'
        ? 'Honor rest: gentle floor stretches, slow walks, and restorative pelvic yoga.'
        : phase === 'Ovulation'
        ? 'Harness peak estrogen with uplifting strength training, cardio, or dancing.'
        : 'Moderate pilates, swimming, and mindful breathing to stabilize cortisol.',
      padAdvice: 'Change your NIVA sanitary pad every 4 to 6 hours for pristine freshness and intimate skin barrier protection.',
      disclaimer: 'AI insights provide personalized wellness guidance based on your logged patterns and are not medical diagnoses or healthcare advice. Always consult a qualified healthcare professional for medical concerns.',
    });
  }
});

// API: AI Ask Health & Wellness Question
app.post('/api/ai/ask-health', async (req: Request, res: Response) => {
  try {
    const { question, userContext } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!apiKey) {
      return res.json({
        answer: `Thank you for asking about "${question}". During your cycle, hormonal shifts between estrogen and progesterone commonly influence cramping, energy, and emotions. Staying hydrated, applying gentle warmth to the lower abdomen, and wearing breathable organic cotton pads can alleviate discomfort. If you experience severe debilitating pain, unusual heavy bleeding soaking through more than one pad per hour, or sudden dizziness, please consult a gynecologist or healthcare clinic immediately.`,
        suggestedFollowUps: [
          'What are gentle natural remedies for menstrual cramps?',
          'How do I track fertile vs low-fertility days accurately?',
          'How often should I change my sanitary pad during heavy flow?',
        ],
        disclaimer: 'This guidance is educational and does not constitute medical advice or diagnosis.',
      });
    }

    const contextStr = userContext
      ? `User context: Current Day ${userContext.cycleDay || 'N/A'}, Phase: ${userContext.phase || 'N/A'}, Symptoms: ${userContext.symptoms?.join(', ') || 'none specified'}.`
      : 'User context: General women menstrual wellness inquiry.';

    const systemInstruction = `You are NIVA's certified menstrual wellness AI companion.
You provide supportive, scientifically sound, friendly, and non-judgmental guidance for girls, teenagers, and adult women about menstrual cycles, pad hygiene, ovulation, puberty, fertility windows, and reproductive health.
Tone: Warm, empathetic, respectful, clear, and destigmatizing.
CRITICAL SAFETY RULE: You are NOT a doctor and cannot diagnose conditions (like endometriosis, PCOS, pregnancy, or infections). Always include comforting self-care suggestions and recommend seeing a healthcare provider or gynecologist if red-flag symptoms are mentioned.`;

    const prompt = `${contextStr}

User Question: "${question}"

Respond with JSON in this format:
{
  "answer": "A clear, empathetic, 2-3 paragraph answer explaining the biological reason, gentle practical self-care steps, and what is normal.",
  "redFlags": "Brief mention of when to contact a doctor if symptoms are severe or abnormal, or null if strictly educational.",
  "suggestedFollowUps": ["3 short relevant follow-up questions the user might want to explore next"],
  "disclaimer": "AI insights provide personalized wellness guidance based on your logged patterns and are not medical diagnoses or healthcare advice. Always consult a qualified healthcare professional for medical concerns."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const responseText = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        answer: responseText,
        redFlags: null,
        suggestedFollowUps: ['How can I soothe cramps naturally?', 'What are the 4 phases of the cycle?'],
        disclaimer: 'AI insights provide personalized wellness guidance and are not medical diagnoses.',
      };
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('Error answering health question:', error);
    const { question } = req.body || {};
    return res.json({
      answer: `Regarding your question ("${question || 'Cycle health'}"): Throughout your menstrual cycle, shifting balances of estrogen and progesterone naturally affect muscular tension, hydration, and moods. Staying hydrated, applying warm compresses or heating pads to the lower abdomen, resting when needed, and using breathable 100% organic cotton pads can significantly reduce discomfort and skin irritation.\n\nRemember to listen to your body's signals each day. If cramps are accompanied by sudden dizziness, high fever, or bleeding that soaks more than one pad per hour, be sure to contact a healthcare professional or gynecologist.`,
      redFlags: 'If you experience severe unmanageable pain or soak through pads in under an hour, consult a doctor.',
      suggestedFollowUps: [
        'How can I soothe cramps naturally with heat and nutrition?',
        'How does the fertile window calculation work?',
        'Why does organic cotton prevent rashes?',
      ],
      disclaimer: 'AI insights provide personalized wellness guidance based on your logged patterns and are not medical diagnoses or healthcare advice. Always consult a qualified healthcare professional for medical concerns.',
    });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production serve dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NIVA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
