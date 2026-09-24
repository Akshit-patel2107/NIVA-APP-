import React, { useState, useEffect } from 'react';
import {
  Heart,
  Shield,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  AlertTriangle,
  Clock,
  Lock,
  Calendar,
  Activity,
  Smile,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCycle } from '../context/CycleContext';
import { GirlsHealthProfile, LifeStage, FlowBaseline, DysmenorrheaLevel } from '../types';

interface GirlsHealthSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteSetup?: (profile: GirlsHealthProfile) => void;
  isInitialRegistration?: boolean;
}

export function GirlsHealthSetupModal({
  isOpen,
  onClose,
  onCompleteSetup,
  isInitialRegistration = false,
}: GirlsHealthSetupModalProps) {
  const { healthProfile, updateHealthProfile, isAuthenticated } = useAuth();
  const { updateSettings, restockPads } = useCycle();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 4;

  const [form, setForm] = useState<GirlsHealthProfile>({
    lifeStage: healthProfile?.lifeStage || 'regular',
    age: healthProfile?.age || 24,
    averageCycleLength: healthProfile?.averageCycleLength || 28,
    isCycleIrregular: Boolean(healthProfile?.isCycleIrregular),
    averagePeriodLength: healthProfile?.averagePeriodLength || 5,
    flowBaseline: healthProfile?.flowBaseline || 'moderate',
    dysmenorrheaBaseline: healthProfile?.dysmenorrheaBaseline || 'mild',
    healthConditions: healthProfile?.healthConditions || [],
    primaryGoals: healthProfile?.primaryGoals || ['Track period reliably', 'Prevent skin irritation with organic pads'],
    padChangeReminderHours: healthProfile?.padChangeReminderHours || 4,
    discreetNotifications: Boolean(healthProfile?.discreetNotifications),
    periodNoticeDaysBefore: healthProfile?.periodNoticeDaysBefore || 2,
    pinCode: healthProfile?.pinCode || '',
    pinEnabled: Boolean(healthProfile?.pinEnabled && healthProfile?.pinCode),
    notes: healthProfile?.notes || '',
    doctorNotes: healthProfile?.doctorNotes || '',
  });

  useEffect(() => {
    if (healthProfile && isOpen) {
      setForm((prev) => ({
        ...prev,
        ...healthProfile,
      }));
    }
  }, [healthProfile, isOpen]);

  if (!isOpen) return null;

  const handleStageSelect = (stage: LifeStage) => {
    setForm((prev) => ({
      ...prev,
      lifeStage: stage,
      averageCycleLength: stage === 'teen' ? 26 : prev.averageCycleLength,
      isCycleIrregular: stage === 'teen' ? true : prev.isCycleIrregular,
      discreetNotifications: stage === 'teen' ? true : prev.discreetNotifications,
      padChangeReminderHours: stage === 'teen' ? 3.5 : prev.padChangeReminderHours,
    }));
  };

  const toggleCondition = (condition: string) => {
    setForm((prev) => {
      const exists = prev.healthConditions.includes(condition);
      return {
        ...prev,
        healthConditions: exists
          ? prev.healthConditions.filter((c) => c !== condition)
          : [...prev.healthConditions, condition],
      };
    });
  };

  const toggleGoal = (goal: string) => {
    setForm((prev) => {
      const exists = prev.primaryGoals.includes(goal);
      return {
        ...prev,
        primaryGoals: exists
          ? prev.primaryGoals.filter((g) => g !== goal)
          : [...prev.primaryGoals, goal],
      };
    });
  };

  const handleSave = async () => {
    // Synchronize to CycleContext settings
    updateSettings({
      cycleLength: form.averageCycleLength,
      periodLength: form.averagePeriodLength,
      isTeenMode: form.lifeStage === 'teen',
      padChangeIntervalHours: form.padChangeReminderHours,
    });

    if (onCompleteSetup) {
      onCompleteSetup(form);
    } else {
      await updateHealthProfile(form);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF7F5] rounded-3xl max-w-2xl w-full border border-[#2D2328]/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-[#F9EBEF] via-[#FDF2F4] to-[#FAF7F5] border-b border-[#2D2328]/08 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C54B6C] text-white flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2D2328]">
                Women’s & Girls’ Health Setup
              </h2>
              <p className="text-xs text-[#7B6A74]">
                Tailoring NIVA’s cycle predictions and pad reminders to your biology
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7B6A74] hover:bg-black/05 hover:text-[#2D2328] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-[#C54B6C] uppercase tracking-wider">
              Step {step} of {totalSteps}: {
                step === 1 ? 'Life Stage & Biological Age' :
                step === 2 ? 'Menstrual Cycle Baseline' :
                step === 3 ? 'Gynecological & Skin Considerations' :
                'Intimate Care & Privacy Lock'
              }
            </span>
            <span className="text-xs text-[#7B6A74] font-medium">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-[#2D2328]/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#C54B6C] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-6">
          {/* STEP 1: Life Stage */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2D2328] mb-1">
                  Which best describes your current stage of life?
                </label>
                <p className="text-xs text-[#7B6A74] mb-3">
                  This helps calibrate AI cycle sensitivity, school-friendly notifications, and hormonal phases.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'teen' as LifeStage,
                      title: 'Teen / First Cycles (12–18)',
                      desc: 'Menarche guidance, puberty education, irregular cycle allowances, school-safe alerts.',
                      badge: 'Teen Mode',
                    },
                    {
                      id: 'regular' as LifeStage,
                      title: 'Adult Regular (18–38)',
                      desc: 'Natural cycle tracking, energy and mood sync, ovulation and PMS management.',
                      badge: 'Reproductive',
                    },
                    {
                      id: 'fertility' as LifeStage,
                      title: 'Fertility & Conception Focus',
                      desc: 'Detailed fertile window, cervical mucus signs, ovulation day estimations.',
                      badge: 'Fertility Sync',
                    },
                    {
                      id: 'postpartum' as LifeStage,
                      title: 'Postpartum & Nursing Care',
                      desc: 'Recovery tracking, lochia flow, cycle return monitoring, gentle pelvic support.',
                      badge: 'Postpartum',
                    },
                    {
                      id: 'perimenopause' as LifeStage,
                      title: 'Perimenopause (38+)',
                      desc: 'Fluctuation awareness, night sweats, hormonal shifts, gentle transition care.',
                      badge: 'Hormonal Transition',
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleStageSelect(item.id)}
                      className={`text-left p-3.5 rounded-2xl border transition-all relative ${
                        form.lifeStage === item.id
                          ? 'border-[#C54B6C] bg-white ring-2 ring-[#C54B6C]/20 shadow-sm'
                          : 'border-[#2D2328]/10 bg-white/60 hover:bg-white hover:border-[#2D2328]/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-[#2D2328]">
                          {item.title}
                        </span>
                        {form.lifeStage === item.id && (
                          <div className="w-5 h-5 rounded-full bg-[#C54B6C] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#7B6A74] leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Input */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#2D2328] mb-1">
                  Your Age (Optional, for tailored medical norms)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="10"
                    max="65"
                    value={form.age || ''}
                    onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || undefined })}
                    placeholder="e.g. 16 or 28"
                    className="w-32 px-3 py-2 text-sm bg-white border border-[#2D2328]/15 rounded-xl focus:outline-none focus:border-[#C54B6C]"
                  />
                  <span className="text-xs text-[#7B6A74]">
                    {form.lifeStage === 'teen'
                      ? '🌸 NIVA Teen mode activates gentler language & school-discreet alerts.'
                      : 'Helps provide age-appropriate hormonal baseline insights.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Cycle Baseline */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2D2328] mb-1">
                  Average Cycle Length
                </label>
                <p className="text-xs text-[#7B6A74] mb-3">
                  Count from day 1 of one period to day 1 of your next period (standard is 28 days).
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="21"
                      max="45"
                      value={form.averageCycleLength}
                      onChange={(e) => setForm({ ...form, averageCycleLength: parseInt(e.target.value) })}
                      className="w-full accent-[#C54B6C]"
                    />
                    <div className="flex justify-between text-[11px] text-[#7B6A74] mt-1 font-mono">
                      <span>21 days (Short)</span>
                      <span>28 days (Average)</span>
                      <span>35 days (Long)</span>
                      <span>45 days</span>
                    </div>
                  </div>
                  <div className="w-16 h-12 bg-white rounded-xl border border-[#2D2328]/15 flex items-center justify-center font-bold text-lg text-[#C54B6C] font-mono">
                    {form.averageCycleLength}d
                  </div>
                </div>

                {/* Irregularity checkbox */}
                <label className="mt-3 flex items-center gap-2 cursor-pointer bg-white/70 p-2.5 rounded-xl border border-[#2D2328]/10">
                  <input
                    type="checkbox"
                    checked={form.isCycleIrregular}
                    onChange={(e) => setForm({ ...form, isCycleIrregular: e.target.checked })}
                    className="rounded text-[#C54B6C] focus:ring-[#C54B6C]"
                  />
                  <span className="text-xs text-[#2D2328] font-medium">
                    My cycle length varies or is irregular (common during teenage years or with PCOS)
                  </span>
                </label>
              </div>

              {/* Period Length */}
              <div>
                <label className="block text-sm font-semibold text-[#2D2328] mb-1">
                  Average Bleeding Duration (Days)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[3, 4, 5, 6, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setForm({ ...form, averagePeriodLength: days })}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        form.averagePeriodLength === days
                          ? 'bg-[#C54B6C] text-white border-[#C54B6C]'
                          : 'bg-white text-[#2D2328] border-[#2D2328]/15 hover:border-[#C54B6C]/40'
                      }`}
                    >
                      {days} {days === 7 ? '7+ Days' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flow Baseline & Cramps Baseline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2328] mb-1">
                    Typical Flow Intensity
                  </label>
                  <select
                    value={form.flowBaseline}
                    onChange={(e) => setForm({ ...form, flowBaseline: e.target.value as FlowBaseline })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#2D2328]/15 rounded-xl focus:outline-none focus:border-[#C54B6C]"
                  >
                    <option value="light">Light Flow (Pantiliners & Day Comfort)</option>
                    <option value="moderate">Moderate / Balanced (Day Comfort)</option>
                    <option value="heavy">Heavy Flow (Overnight Sanctuary)</option>
                    <option value="very_heavy">Very Heavy / Frequent Changes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2328] mb-1">
                    Typical Cramping / Pain Severity
                  </label>
                  <select
                    value={form.dysmenorrheaBaseline}
                    onChange={(e) => setForm({ ...form, dysmenorrheaBaseline: e.target.value as DysmenorrheaLevel })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#2D2328]/15 rounded-xl focus:outline-none focus:border-[#C54B6C]"
                  >
                    <option value="none">None / Barely Noticeable</option>
                    <option value="mild">Mild (Manageable without medication)</option>
                    <option value="moderate">Moderate (Requires heat pad or rest)</option>
                    <option value="severe">Severe / Debilitating (Dysmenorrhea)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Gynecological & Skin Considerations */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2D2328] mb-1">
                  Health Factors & Sensitivities
                </label>
                <p className="text-xs text-[#7B6A74] mb-3">
                  Selecting relevant factors personalizes medical wellness tips and highlights pad suitability.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'Sensitive Skin / Pad Allergy',
                      title: 'Sensitive Skin / Rashes',
                      desc: 'Irritation from synthetic or bleached pads. NIVA 100% organic cotton is certified safe.',
                    },
                    {
                      id: 'PCOS',
                      title: 'PCOS (Polycystic Ovaries)',
                      desc: 'Longer cycles, delayed ovulation, and hormonal fluctuations.',
                    },
                    {
                      id: 'Endometriosis',
                      title: 'Endometriosis / Pelvic Pain',
                      desc: 'Deep cramping, inflammation support, and gentle heat therapy.',
                    },
                    {
                      id: 'PMDD',
                      title: 'PMDD / Severe PMS',
                      desc: 'Heightened mood shifts and serotonin drops during luteal phase.',
                    },
                    {
                      id: 'Teen Puberty Changes',
                      title: 'Teen Puberty Growth',
                      desc: 'New cycle establishment and emotional reassurance.',
                    },
                    {
                      id: 'Thyroid Irregularity',
                      title: 'Thyroid Balance',
                      desc: 'Metabolism and cycle duration connections.',
                    },
                  ].map((cond) => {
                    const isSelected = form.healthConditions.includes(cond.id);
                    return (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => toggleCondition(cond.id)}
                        className={`text-left p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-[#FDF2F4] border-[#C54B6C] ring-1 ring-[#C54B6C]'
                            : 'bg-white border-[#2D2328]/10 hover:border-[#2D2328]/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#2D2328]">
                            {cond.title}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#C54B6C] stroke-[3]" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#7B6A74] leading-relaxed">
                          {cond.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Goals */}
              <div>
                <label className="block text-xs font-semibold text-[#2D2328] mb-2">
                  What are your top wellness goals?
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Track period reliably',
                    'Prevent skin irritation with organic pads',
                    'Manage cramps & symptoms',
                    'Predict fertile window',
                    'Sync energy & workouts to cycle',
                    'Discreet school reminders',
                    'Teen puberty confidence',
                  ].map((goal) => {
                    const active = form.primaryGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleGoal(goal)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-[#C54B6C] text-white border-[#C54B6C]'
                            : 'bg-white text-[#2D2328] border-[#2D2328]/15 hover:border-[#C54B6C]/40'
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Intimate Hygiene & Privacy PIN */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Pad Hygiene Timer */}
              <div className="bg-white p-4 rounded-2xl border border-[#2D2328]/10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#C54B6C]" />
                  <span className="text-sm font-semibold text-[#2D2328]">
                    Pad Replacement Reminder Interval
                  </span>
                </div>
                <p className="text-xs text-[#7B6A74] mb-3">
                  Gynecologists recommend changing sanitary pads every 3 to 6 hours to prevent bacterial growth and maintain skin barrier health.
                </p>

                <div className="grid grid-cols-4 gap-2">
                  {[3, 3.5, 4, 5].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setForm({ ...form, padChangeReminderHours: hours })}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        form.padChangeReminderHours === hours
                          ? 'bg-[#C54B6C] text-white border-[#C54B6C]'
                          : 'bg-white text-[#2D2328] border-[#2D2328]/15 hover:border-[#C54B6C]'
                      }`}
                    >
                      {hours} Hours {hours === 4 ? '(Recommended)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discreet Notifications Toggle */}
              <div className="bg-white p-4 rounded-2xl border border-[#2D2328]/10 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="discreetToggle"
                  checked={form.discreetNotifications}
                  onChange={(e) => setForm({ ...form, discreetNotifications: e.target.checked })}
                  className="mt-1 rounded text-[#C54B6C] focus:ring-[#C54B6C]"
                />
                <label htmlFor="discreetToggle" className="cursor-pointer text-xs">
                  <span className="font-semibold text-sm text-[#2D2328] block mb-0.5">
                    Discreet Notification Masking
                  </span>
                  <span className="text-[#7B6A74] leading-relaxed block">
                    Disguises cycle and pad notifications as "Hydration Break" or "Health Pause" so friends, family, or classmates looking at your screen don’t see private cycle details.
                  </span>
                </label>
              </div>

              {/* 4-Digit Security PIN Lock */}
              <div className="bg-white p-4 rounded-2xl border border-[#2D2328]/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#C54B6C]" />
                    <span className="text-sm font-semibold text-[#2D2328]">
                      Private Medical PIN Lock
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.pinEnabled}
                    onChange={(e) => setForm({ ...form, pinEnabled: e.target.checked })}
                    className="rounded text-[#C54B6C] focus:ring-[#C54B6C]"
                  />
                </div>
                <p className="text-xs text-[#7B6A74] mb-3">
                  Lock your intimate symptoms, notes, and cycle calendar behind a 4-digit PIN when sharing your phone with family or peers.
                </p>

                {form.pinEnabled && (
                  <div className="flex items-center gap-3">
                    <input
                      type="password"
                      maxLength={4}
                      pattern="[0-9]*"
                      value={form.pinCode || ''}
                      onChange={(e) => setForm({ ...form, pinCode: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="4-digit PIN"
                      className="w-32 px-3 py-2 text-center tracking-widest font-mono text-base font-bold bg-[#FAF7F5] border border-[#2D2328]/15 rounded-xl focus:outline-none focus:border-[#C54B6C]"
                    />
                    <span className="text-xs text-[#7B6A74]">
                      {form.pinCode && form.pinCode.length === 4
                        ? '✅ PIN ready'
                        : 'Enter 4 numbers (e.g. 1234)'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 bg-white border-t border-[#2D2328]/08 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-[#64555D] hover:text-[#2D2328] flex items-center gap-1 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#C54B6C] hover:bg-[#B33F5E] rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#C54B6C] hover:bg-[#B33F5E] rounded-xl flex items-center gap-2 shadow-md transition-all hover:scale-[1.02]"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save & Apply Health Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
