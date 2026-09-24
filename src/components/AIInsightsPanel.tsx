import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Send,
  AlertCircle,
  Coffee,
  Activity,
  Heart,
  ShieldAlert,
  HelpCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import { useCycle } from '../context/CycleContext';
import { AIInsight } from '../types';
import { formatDateToIso } from '../utils/cycleEngine';

const QUICK_QUESTIONS = [
  'Why do I feel more tired in the luteal phase right before my period?',
  'How do I know if my menstrual cramps are normal or a sign of endometriosis?',
  'What are the best natural foods and teas for period bloating and cramps?',
  'Is it normal for a teenager\'s period to be irregular during the first two years?',
  'How does organic cotton help prevent intimate rashes and chafing?',
];

export function AIInsightsPanel() {
  const { cycleStatus, settings, dailyLogs, isCarePlus, setIsCarePlus } = useCycle();
  const todayIso = formatDateToIso(new Date());
  const todayLog = dailyLogs[todayIso];

  // AI Insights State
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  // Interactive AI Companion Chat State
  const [question, setQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    q: string;
    answer: string;
    redFlags?: string | null;
    disclaimer: string;
  }>>([
    {
      q: 'How does ovulation affect my energy levels and body temperature?',
      answer: 'During the 24 to 48 hours surrounding ovulation, estrogen and testosterone reach their monthly peak. This dual surge enhances verbal clarity, confidence, and metabolic stamina. Basal body temperature also rises by approximately 0.5°F (0.3°C) immediately after ovulation due to the initial secretion of progesterone.',
      redFlags: null,
      disclaimer: 'AI insights provide personalized wellness guidance based on your logged patterns and are not medical diagnoses.',
    },
  ]);

  // Fetch AI insights for current cycle state
  const fetchCycleInsights = async () => {
    setIsLoadingInsight(true);
    setInsightError(null);
    try {
      const payload = {
        cycleDay: cycleStatus.currentDay,
        cycleLength: settings.cycleLength,
        periodLength: settings.periodLength,
        phase: cycleStatus.phaseName,
        symptoms: todayLog?.symptoms || [],
        moods: todayLog?.moods || [],
        notes: todayLog?.notes || '',
      };

      const res = await fetch('/api/ai/cycle-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to generate insights from AI engine');
      }

      const data = await res.json();
      setInsight(data);
    } catch (err: any) {
      console.error(err);
      setInsightError('Unable to generate AI analysis at this moment. You can still use the interactive companion below.');
    } finally {
      setIsLoadingInsight(false);
    }
  };

  useEffect(() => {
    fetchCycleInsights();
  }, [cycleStatus.currentDay, cycleStatus.phase]);

  // Handle Ask Companion
  const handleAskQuestion = async (customQ?: string) => {
    const qToSend = customQ || question;
    if (!qToSend.trim()) return;

    setIsAsking(true);
    try {
      const res = await fetch('/api/ai/ask-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qToSend,
          userContext: {
            cycleDay: cycleStatus.currentDay,
            phase: cycleStatus.phaseName,
            symptoms: todayLog?.symptoms || [],
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get companion response');
      }

      const data = await res.json();
      setChatHistory((prev) => [
        {
          q: qToSend,
          answer: data.answer,
          redFlags: data.redFlags,
          disclaimer: data.disclaimer || 'AI guidance is for informational wellness purposes only.',
        },
        ...prev,
      ]);
      setQuestion('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#2D2328]/08 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#FDF2F4] text-[#C54B6C] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase tracking-wider text-[#64555D] font-medium">
                Advanced Menstrual AI Guidance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2328] mt-1">
              Personalized Cycle Intelligence
            </h1>
            <p className="text-xs text-[#64555D] mt-1">
              Synthesizing your Day {cycleStatus.currentDay} {cycleStatus.phaseName} signals with biological hormone research.
            </p>
          </div>

          <button
            onClick={fetchCycleInsights}
            disabled={isLoadingInsight}
            className="px-4 py-2 text-xs font-semibold text-[#2D2328] bg-[#FAF7F5] border border-[#2D2328]/10 rounded-lg hover:bg-white transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInsight ? 'animate-spin text-[#C54B6C]' : ''}`} />
            <span>{isLoadingInsight ? 'Analyzing Cycle...' : 'Refresh Insights'}</span>
          </button>
        </div>

        {/* Mandatory Medical Disclaimer Banner */}
        <div className="mt-6 p-3.5 bg-[#FAF7F5] border border-[#C54B6C]/20 rounded-xl flex items-start gap-2.5 text-xs text-[#64555D]">
          <AlertCircle className="w-4 h-4 text-[#C54B6C] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#2D2328] font-semibold">Important Medical Notice:</strong>{' '}
            NIVA AI insights provide personalized wellness guidance based on your self-logged cycle data and are strictly not medical diagnoses, contraceptive devices, or clinical prescriptions. Always consult a licensed gynecologist or healthcare physician for medical concerns.
          </span>
        </div>
      </div>

      {/* Main Cycle Insights Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Biological Summary & Body Signals */}
        <div className="bg-white rounded-2xl p-6 border border-[#2D2328]/08 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#C54B6C]" />
            <h3 className="text-base font-serif font-bold text-[#2D2328]">
              Hormone State & Biological Rhythm
            </h3>
          </div>

          {isLoadingInsight ? (
            <div className="space-y-3 py-6 animate-pulse">
              <div className="h-4 bg-[#FAF7F5] rounded w-3/4" />
              <div className="h-4 bg-[#FAF7F5] rounded w-full" />
              <div className="h-4 bg-[#FAF7F5] rounded w-5/6" />
            </div>
          ) : insight ? (
            <div className="space-y-4 text-xs text-[#2D2328] leading-relaxed">
              <div className="p-3.5 bg-[#FDF2F4]/60 border border-[#C54B6C]/15 rounded-xl">
                <p className="font-medium text-[#7D2840]">
                  {insight.summary}
                </p>
              </div>

              <div>
                <span className="font-semibold block text-[#64555D] mb-1 uppercase tracking-wider text-[11px]">
                  Connecting Symptoms to Hormones:
                </span>
                <p className="text-[#64555D] leading-relaxed">
                  {insight.bodySignals}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#64555D]">
              Click refresh to generate your cycle phase analysis.
            </p>
          )}
        </div>

        {/* Card 2: Phase Nutrition, Movement & Intimate Hygiene */}
        <div className="bg-white rounded-2xl p-6 border border-[#2D2328]/08 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-[#C54B6C]" />
            <h3 className="text-base font-serif font-bold text-[#2D2328]">
              Tailored Phase Nourishment & Care
            </h3>
          </div>

          {isLoadingInsight ? (
            <div className="space-y-3 py-6 animate-pulse">
              <div className="h-4 bg-[#FAF7F5] rounded w-full" />
              <div className="h-4 bg-[#FAF7F5] rounded w-2/3" />
            </div>
          ) : insight ? (
            <div className="space-y-3.5 text-xs text-[#2D2328]">
              <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/06 flex items-start gap-2.5">
                <Coffee className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2D2328]">Nutritional Alignment:</strong>
                  <span className="text-[#64555D]">{insight.nutritionTip}</span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/06 flex items-start gap-2.5">
                <Activity className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2D2328]">Exercise & Physical Rest:</strong>
                  <span className="text-[#64555D]">{insight.movementTip}</span>
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/06 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#C54B6C] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#2D2328]">NIVA Pad & Hygiene Tip:</strong>
                  <span className="text-[#64555D]">{insight.padAdvice}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Ask NIVA Health Companion Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#2D2328]/08 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#C54B6C]" />
            <h2 className="text-xl font-serif font-bold text-[#2D2328]">
              Ask the NIVA Menstrual Companion
            </h2>
          </div>
          <p className="text-xs text-[#64555D] mt-1">
            Confidential, friendly, and non-judgmental guidance for cycle changes, puberty questions, cramps, and pad hygiene.
          </p>
        </div>

        {/* Preset quick question chips */}
        <div className="space-y-2">
          <span className="text-xs text-[#64555D] font-medium flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Common Questions to Explore:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskQuestion(q)}
                disabled={isAsking}
                className="text-xs text-left px-3 py-1.5 rounded-lg bg-[#FAF7F5] border border-[#2D2328]/08 text-[#2D2328] hover:border-[#C54B6C]/40 hover:bg-[#FDF2F4] transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
            placeholder="Ask anything about periods, cramps, pad types, ovulation, or mood swings..."
            disabled={isAsking}
            className="w-full pl-4 pr-24 py-3 rounded-xl border border-[#2D2328]/15 text-xs text-[#2D2328] focus:outline-none focus:ring-1 focus:ring-[#C54B6C] bg-[#FAF7F5]"
          />
          <button
            onClick={() => handleAskQuestion()}
            disabled={isAsking || !question.trim()}
            className="absolute right-2 top-2 px-3.5 py-1.5 bg-[#C54B6C] text-white rounded-lg text-xs font-semibold hover:bg-[#B33F5E] transition-colors flex items-center gap-1 disabled:opacity-40"
          >
            <span>{isAsking ? 'Thinking...' : 'Ask'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chat / Answers stream */}
        <div className="space-y-4 pt-2">
          {chatHistory.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#FAF7F5] border border-[#2D2328]/08 space-y-2 text-xs"
            >
              <div className="font-semibold text-[#2D2328] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C54B6C]" />
                <span>Q: "{item.q}"</span>
              </div>

              <div className="text-[#4F4249] leading-relaxed whitespace-pre-line pl-3.5 border-l-2 border-[#C54B6C]/30">
                {item.answer}
              </div>

              {item.redFlags && (
                <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-[#7D2840] flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#C54B6C] shrink-0 mt-0.5" />
                  <span>
                    <strong>Medical Evaluation Alert:</strong> {item.redFlags}
                  </span>
                </div>
              )}

              <div className="text-[11px] text-[#64555D] italic pt-1">
                {item.disclaimer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
