import React, { useState, useEffect } from 'react';
import {
  X,
  Droplet,
  Heart,
  Smile,
  Moon,
  Plus,
  Minus,
  Save,
  Trash2,
} from 'lucide-react';
import { useCycle } from '../context/CycleContext';
import { DailyLog, FlowIntensity } from '../types';
import { formatDisplayDate } from '../utils/cycleEngine';

const SYMPTOM_OPTIONS = [
  'Cramps',
  'Bloating',
  'Headache',
  'Tender Breasts',
  'Fatigue',
  'Lower Back Ache',
  'Acne',
  'Nausea',
  'Cravings',
  'Insomnia',
  'Brain Fog',
  'Ovulation Pain',
  'High Energy',
  'Chills',
];

const MOOD_OPTIONS = [
  'Calm',
  'Energized',
  'Sensitive',
  'Irritable',
  'Anxious',
  'Joyful',
  'Low Energy',
  'Focused',
  'Moody',
  'Vulnerable',
];

const CERVICAL_OPTIONS: Array<{ key: DailyLog['cervicalMucus']; label: string; desc: string }> = [
  { key: 'dry', label: 'Dry', desc: 'Typical post-period' },
  { key: 'sticky', label: 'Sticky', desc: 'Early follicular' },
  { key: 'creamy', label: 'Creamy', desc: 'Transitioning' },
  { key: 'egg-white', label: 'Egg-White / Stretchy', desc: 'Peak fertile signal' },
  { key: 'watery', label: 'Watery', desc: 'High estrogen' },
];

export function DailyLogModal() {
  const {
    isLogModalOpen,
    setIsLogModalOpen,
    selectedDate,
    dailyLogs,
    saveDailyLog,
    discreetMode,
  } = useCycle();

  const [flow, setFlow] = useState<FlowIntensity>('none');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [cervicalMucus, setCervicalMucus] = useState<DailyLog['cervicalMucus']>('');
  const [sleepHours, setSleepHours] = useState<number>(8);
  const [waterGlasses, setWaterGlasses] = useState<number>(6);
  const [painLevel, setPainLevel] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Hydrate modal when opened
  useEffect(() => {
    if (isLogModalOpen) {
      const existing = dailyLogs[selectedDate];
      if (existing) {
        setFlow(existing.flow);
        setSymptoms(existing.symptoms || []);
        setMoods(existing.moods || []);
        setCervicalMucus(existing.cervicalMucus || '');
        setSleepHours(existing.sleepHours ?? 8);
        setWaterGlasses(existing.waterGlasses ?? 6);
        setPainLevel(existing.painLevel ?? 0);
        setNotes(existing.notes || '');
      } else {
        setFlow('none');
        setSymptoms([]);
        setMoods([]);
        setCervicalMucus('');
        setSleepHours(8);
        setWaterGlasses(6);
        setPainLevel(0);
        setNotes('');
      }
    }
  }, [isLogModalOpen, selectedDate, dailyLogs]);

  if (!isLogModalOpen) return null;

  const toggleSymptom = (item: string) => {
    setSymptoms((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const toggleMood = (item: string) => {
    setMoods((prev) =>
      prev.includes(item) ? prev.filter((m) => m !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    const updated: DailyLog = {
      date: selectedDate,
      flow,
      symptoms,
      moods,
      cervicalMucus,
      sleepHours,
      waterGlasses,
      painLevel,
      notes,
    };
    saveDailyLog(updated);
    setIsLogModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-xl border border-[#2D2328]/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#2D2328]/08 flex items-center justify-between bg-[#FAF7F5]">
          <div>
            <span className="text-xs text-[#64555D] font-medium block">
              {discreetMode ? 'Daily Health Log' : 'Menstrual & Symptom Log'}
            </span>
            <h3 className="text-lg font-serif font-bold text-[#2D2328]">
              {formatDisplayDate(selectedDate, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
          </div>
          <button
            onClick={() => setIsLogModalOpen(false)}
            className="p-2 rounded-lg text-[#64555D] hover:text-[#2D2328] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Flow intensity */}
          <div>
            <label className="text-xs font-semibold text-[#2D2328] block mb-2">
              {discreetMode ? 'Fluid / Activity Flow' : 'Period Bleeding Flow'}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['none', 'spotting', 'light', 'medium', 'heavy'] as FlowIntensity[]).map((level) => {
                const isSelected = flow === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFlow(level)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-medium capitalize transition-all ${
                      isSelected
                        ? 'bg-[#C54B6C] text-white border-[#C54B6C] shadow-xs'
                        : 'bg-[#FAF7F5] border-[#2D2328]/08 text-[#2D2328] hover:bg-white'
                    }`}
                  >
                    <Droplet className={`w-3.5 h-3.5 mx-auto mb-1 ${isSelected ? 'text-white' : 'text-[#C54B6C]'}`} />
                    <span>{level}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Physical Symptoms */}
          <div>
            <label className="text-xs font-semibold text-[#2D2328] block mb-2">
              Physical Symptoms
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((sym) => {
                const isSelected = symptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-[#FDF2F4] border-[#C54B6C] text-[#7D2840] font-medium'
                        : 'bg-white border-[#2D2328]/10 text-[#64555D] hover:border-[#2D2328]/30'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Moods */}
          <div>
            <label className="text-xs font-semibold text-[#2D2328] block mb-2">
              Emotional Mood & Energy
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = moods.includes(mood);
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-purple-100 border-purple-400 text-purple-950 font-medium'
                        : 'bg-white border-[#2D2328]/10 text-[#64555D] hover:border-[#2D2328]/30'
                    }`}
                  >
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cervical Mucus / Discharge */}
          <div>
            <label className="text-xs font-semibold text-[#2D2328] block mb-2">
              Cervical Fluid / Mucus (Fertility Indicator)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CERVICAL_OPTIONS.map((opt) => {
                const isSelected = cervicalMucus === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setCervicalMucus(isSelected ? '' : opt.key)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 text-amber-950 font-medium'
                        : 'bg-white border-[#2D2328]/08 text-[#64555D] hover:border-[#2D2328]/20'
                    }`}
                  >
                    <span className="font-semibold block text-[#2D2328]">{opt.label}</span>
                    <span className="text-[10px] text-[#64555D]">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pain Scale (0-10) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#2D2328]">
                Pain & Cramp Intensity (0 = None, 10 = Severe)
              </label>
              <span className="text-xs font-bold text-[#C54B6C] tabular-nums">
                {painLevel} / 10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(parseInt(e.target.value))}
              className="w-full accent-[#C54B6C]"
            />
          </div>

          {/* Water & Sleep Counters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/08">
              <span className="text-xs text-[#64555D] block mb-2">Water Hydration</span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                  className="p-1 rounded bg-white border text-[#2D2328]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-semibold tabular-nums text-[#2D2328]">
                  {waterGlasses} glasses
                </span>
                <button
                  type="button"
                  onClick={() => setWaterGlasses(waterGlasses + 1)}
                  className="p-1 rounded bg-white border text-[#2D2328]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/08">
              <span className="text-xs text-[#64555D] block mb-2">Sleep Duration</span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSleepHours(Math.max(0, sleepHours - 0.5))}
                  className="p-1 rounded bg-white border text-[#2D2328]"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-semibold tabular-nums text-[#2D2328]">
                  {sleepHours} hrs
                </span>
                <button
                  type="button"
                  onClick={() => setSleepHours(sleepHours + 0.5)}
                  className="p-1 rounded bg-white border text-[#2D2328]"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Personal Journal Notes */}
          <div>
            <label className="text-xs font-semibold text-[#2D2328] block mb-1">
              Private Journal & Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Worked from home, hot bath, ginger tea, mild afternoon cramps..."
              className="w-full p-3 rounded-xl border border-[#2D2328]/15 text-xs text-[#2D2328] focus:outline-none focus:ring-1 focus:ring-[#C54B6C]"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#2D2328]/08 bg-[#FAF7F5] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsLogModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-[#64555D] hover:text-[#2D2328]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#C54B6C] rounded-lg hover:bg-[#B33F5E] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Log</span>
          </button>
        </div>
      </div>
    </div>
  );
}
