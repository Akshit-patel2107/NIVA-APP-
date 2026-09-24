import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GirlsHealthProfile, UserAccount, CycleSettings, PadInventory, DailyLog } from '../types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isCarePlus: boolean;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  healthProfile?: Partial<GirlsHealthProfile>;
  settings?: Partial<CycleSettings>;
  padInventory?: Partial<PadInventory>;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  healthProfile: GirlsHealthProfile;
  updateHealthProfile: (profile: Partial<GirlsHealthProfile>) => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  quickLogin: (profileKey: 'maya' | 'sarah' | 'elena') => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'register';
  setAuthModalMode: (mode: 'signin' | 'register') => void;
  isHealthSetupOpen: boolean;
  setIsHealthSetupOpen: (open: boolean) => void;
  isLocked: boolean;
  unlockWithPin: (pin: string) => Promise<boolean>;
  lockApp: () => void;
  syncStatus: 'synced' | 'syncing' | 'offline';
  syncAccountData: (data: {
    settings?: Partial<CycleSettings>;
    padInventory?: Partial<PadInventory>;
    dailyLogs?: Record<string, DailyLog>;
    isCarePlus?: boolean;
    healthProfile?: Partial<GirlsHealthProfile>;
  }) => Promise<boolean>;
  initialAccountData: {
    settings?: CycleSettings;
    padInventory?: PadInventory;
    dailyLogs?: Record<string, DailyLog>;
    isCarePlus?: boolean;
  } | null;
}

const DEFAULT_HEALTH_PROFILE: GirlsHealthProfile = {
  lifeStage: 'regular',
  age: 26,
  averageCycleLength: 28,
  isCycleIrregular: false,
  averagePeriodLength: 5,
  flowBaseline: 'moderate',
  dysmenorrheaBaseline: 'mild',
  healthConditions: [],
  primaryGoals: ['Track period reliably', 'Optimize cycle energy'],
  padChangeReminderHours: 4,
  discreetNotifications: false,
  periodNoticeDaysBefore: 2,
  pinCode: '',
  pinEnabled: false,
  notes: '',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'niva_auth_token_v1';
const USER_KEY = 'niva_auth_user_v1';
const HEALTH_PROFILE_KEY = 'niva_health_profile_v1';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [healthProfile, setHealthProfile] = useState<GirlsHealthProfile>(() => {
    try {
      const saved = localStorage.getItem(HEALTH_PROFILE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_HEALTH_PROFILE;
    } catch {
      return DEFAULT_HEALTH_PROFILE;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register'>('signin');
  const [isHealthSetupOpen, setIsHealthSetupOpen] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [initialAccountData, setInitialAccountData] = useState<{
    settings?: CycleSettings;
    padInventory?: PadInventory;
    dailyLogs?: Record<string, DailyLog>;
    isCarePlus?: boolean;
  } | null>(null);

  // Initialize and check current session
  useEffect(() => {
    async function verifySession() {
      if (!token) {
        // If not logged in, set default initial state (Maya Lin demo is ready or guest)
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));

          if (data.accountData?.healthProfile) {
            setHealthProfile(data.accountData.healthProfile);
            localStorage.setItem(HEALTH_PROFILE_KEY, JSON.stringify(data.accountData.healthProfile));

            // Check if PIN lock is active on start
            if (data.accountData.healthProfile.pinEnabled && data.accountData.healthProfile.pinCode) {
              setIsLocked(true);
            }
          }

          if (data.accountData) {
            setInitialAccountData({
              settings: data.accountData.settings,
              padInventory: data.accountData.padInventory,
              dailyLogs: data.accountData.dailyLogs,
              isCarePlus: data.accountData.isCarePlus,
            });
          }
        } else {
          // Token invalid or expired
          setToken(null);
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch (e) {
        console.warn('Network offline or backend check failed, using local profile cache:', e);
        setSyncStatus('offline');
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, [token]);

  // Sync state to backend server
  const syncAccountData = useCallback(async (data: {
    settings?: Partial<CycleSettings>;
    padInventory?: Partial<PadInventory>;
    dailyLogs?: Record<string, DailyLog>;
    isCarePlus?: boolean;
    healthProfile?: Partial<GirlsHealthProfile>;
  }): Promise<boolean> => {
    if (!token) return false;

    try {
      setSyncStatus('syncing');
      const res = await fetch('/api/user/account-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSyncStatus('synced');
        return true;
      } else {
        setSyncStatus('offline');
        return false;
      }
    } catch (err) {
      console.error('Account sync error:', err);
      setSyncStatus('offline');
      return false;
    }
  }, [token]);

  // Login handler
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      if (data.accountData?.healthProfile) {
        setHealthProfile(data.accountData.healthProfile);
        localStorage.setItem(HEALTH_PROFILE_KEY, JSON.stringify(data.accountData.healthProfile));

        if (data.accountData.healthProfile.pinEnabled && data.accountData.healthProfile.pinCode) {
          setIsLocked(false); // unlock immediately upon fresh password login
        }
      }

      if (data.accountData) {
        setInitialAccountData({
          settings: data.accountData.settings,
          padInventory: data.accountData.padInventory,
          dailyLogs: data.accountData.dailyLogs,
          isCarePlus: data.accountData.isCarePlus,
        });
      }

      setIsAuthModalOpen(false);
      setSyncStatus('synced');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (payload: RegisterPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      if (data.accountData?.healthProfile) {
        setHealthProfile(data.accountData.healthProfile);
        localStorage.setItem(HEALTH_PROFILE_KEY, JSON.stringify(data.accountData.healthProfile));
      }

      if (data.accountData) {
        setInitialAccountData({
          settings: data.accountData.settings,
          padInventory: data.accountData.padInventory,
          dailyLogs: data.accountData.dailyLogs,
          isCarePlus: data.accountData.isCarePlus,
        });
      }

      setIsAuthModalOpen(false);
      setIsHealthSetupOpen(false);
      setSyncStatus('synced');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    } finally {
      setIsLoading(false);
    }
  };

  // Quick switch for demo testing accounts
  const quickLogin = async (profileKey: 'maya' | 'sarah' | 'elena') => {
    const credentials = {
      maya: { email: 'maya@niva.health', pass: 'Password123!' },
      sarah: { email: 'sarah@niva.health', pass: 'Password123!' },
      elena: { email: 'elena@niva.health', pass: 'Password123!' },
    }[profileKey];

    await login(credentials.email, credentials.pass);
  };

  // Logout handler
  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.warn('Logout request failed:', e);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(HEALTH_PROFILE_KEY);
      setHealthProfile(DEFAULT_HEALTH_PROFILE);
      setIsLocked(false);
      window.location.reload();
    }
  };

  // Update Girls Health Profile
  const updateHealthProfile = async (updated: Partial<GirlsHealthProfile>) => {
    const merged = { ...healthProfile, ...updated };
    setHealthProfile(merged);
    localStorage.setItem(HEALTH_PROFILE_KEY, JSON.stringify(merged));

    if (token) {
      await syncAccountData({ healthProfile: merged });
    }
  };

  // Verify PIN
  const unlockWithPin = async (pinInput: string): Promise<boolean> => {
    if (!healthProfile.pinEnabled || !healthProfile.pinCode) {
      setIsLocked(false);
      return true;
    }

    if (healthProfile.pinCode === pinInput.trim()) {
      setIsLocked(false);
      return true;
    }

    return false;
  };

  const lockApp = () => {
    if (healthProfile.pinEnabled && healthProfile.pinCode) {
      setIsLocked(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        healthProfile,
        updateHealthProfile,
        login,
        register,
        logout,
        quickLogin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isHealthSetupOpen,
        setIsHealthSetupOpen,
        isLocked,
        unlockWithPin,
        lockApp,
        syncStatus,
        syncAccountData,
        initialAccountData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
