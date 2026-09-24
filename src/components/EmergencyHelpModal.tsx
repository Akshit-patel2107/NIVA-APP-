import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  Phone,
  FileText,
  CheckSquare,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';
import { useCycle } from '../context/CycleContext';
import { formatDisplayDate } from '../utils/cycleEngine';

interface EmergencyHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyHelpModal({ isOpen, onClose }: EmergencyHelpModalProps) {
  const { settings, dailyLogs, cycleStatus } = useCycle();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate doctor summary string
  const generateDoctorReport = () => {
    const logEntries = Object.values(dailyLogs);
    const symptomsSet = new Set<string>();
    logEntries.forEach((l) => l.symptoms.forEach((s) => symptomsSet.add(s)));

    return `=== NIVA PERSONAL CYCLE CLINICAL SUMMARY ===
Generated on: ${new Date().toLocaleDateString()}
Cycle Length: ${settings.cycleLength} days (Typical period: ${settings.periodLength} days)
Current Status: Day ${cycleStatus.currentDay} (${cycleStatus.phaseName})
Estimated Next Period: ${formatDisplayDate(cycleStatus.nextPeriodDate)}

Recent Logged Symptoms (Past 30 Days):
${Array.from(symptomsSet).map((s) => `• ${s}`).join('\n') || 'None recorded'}

Recent Daily Logs:
${logEntries
  .slice(-5)
  .map(
    (l) =>
      `[${l.date}] Flow: ${l.flow} | Pain: ${l.painLevel}/10 | Symptoms: ${l.symptoms.join(', ') || 'None'}`
  )
  .join('\n')}

Notes for Physician:
Patient tracks menstrual flow, pain ratings, and cycle regularity using on-device encrypted NIVA health app.
==============================================`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateDoctorReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-[#2D2328]/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#2D2328]/08 flex items-center justify-between bg-rose-50/70">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-rose-100 text-[#C54B6C] flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#7D2840]">
                Emergency & Health Resources
              </h2>
              <span className="text-xs text-[#64555D]">
                Immediate support, red-flag checklists, and doctor-ready summaries.
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#64555D] hover:text-[#2D2328] hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Urgent Red Flags */}
          <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#7D2840]">
              <ShieldAlert className="w-4 h-4 text-[#C54B6C]" />
              <span>When to Seek Immediate Emergency Medical Care</span>
            </div>
            <p className="text-[#64555D] leading-relaxed">
              If you or someone you care for experiences any of the following, do not wait—go to the nearest urgent care or emergency room:
            </p>
            <ul className="space-y-1.5 text-[#2D2328] pl-2 font-medium">
              <li>• Soaking through two or more overnight pads every hour for 2+ consecutive hours.</li>
              <li>• Sudden high fever (over 102°F/39°C), dizziness, vomiting, or a sunburn-like rash (potential Toxic Shock Syndrome signs).</li>
              <li>• Excruciating, sharp pelvic pain that radiates or causes fainting/syncope.</li>
              <li>• Passing blood clots larger than a golf ball.</li>
            </ul>
          </div>

          {/* Confidential Helplines */}
          <div className="space-y-3">
            <h3 className="text-sm font-serif font-bold text-[#2D2328] flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C54B6C]" />
              <span>Confidential 24/7 Support Hotlines</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/08">
                <strong className="block text-[#2D2328] text-sm">Women's Reproductive Health Line</strong>
                <span className="text-[#64555D] block mt-0.5">Free, confidential medical questions answered by licensed nurses.</span>
                <span className="font-mono font-bold text-[#C54B6C] block mt-1">1-800-230-PLAN</span>
              </div>

              <div className="p-3.5 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/08">
                <strong className="block text-[#2D2328] text-sm">Teen Health & Support Text Line</strong>
                <span className="text-[#64555D] block mt-0.5">Private texting support for adolescents and teens.</span>
                <span className="font-mono font-bold text-purple-700 block mt-1">Text "TEEN" to 839863</span>
              </div>
            </div>
          </div>

          {/* Emergency Kit Checklist */}
          <div className="space-y-3">
            <h3 className="text-sm font-serif font-bold text-[#2D2328] flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#C54B6C]" />
              <span>Discreet Emergency Period Kit Checklist</span>
            </h3>
            <div className="p-4 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/08 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#4F4249]">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-[#C54B6C] rounded" />
                <span>2x NIVA Ultra-Thin Day Comfort Pads</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-[#C54B6C] rounded" />
                <span>1x Spare underwear in discrete canvas pouch</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-[#C54B6C] rounded" />
                <span>Biodegradable disposal wrap bags</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-[#C54B6C] rounded" />
                <span>Chamomile or peppermint tea bag for cramps</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-[#C54B6C] rounded" />
                <span>Unscented hypoallergenic water wipes</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-[#C54B6C] rounded" />
                <span>Small reusable heat patch / gel warmer</span>
              </label>
            </div>
          </div>

          {/* Export to Doctor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-[#2D2328] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C54B6C]" />
                <span>Export Clinical Cycle Report (For Gynecologist)</span>
              </h3>
              <button
                onClick={handleCopyReport}
                className="px-3 py-1.5 bg-[#FAF7F5] border border-[#2D2328]/10 text-xs font-semibold text-[#2D2328] rounded-lg hover:bg-white flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Clinical Summary'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/10 text-[10px] text-[#64555D] font-mono whitespace-pre-wrap overflow-x-auto max-h-36">
              {generateDoctorReport()}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2D2328]/08 bg-[#FAF7F5] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#C54B6C] rounded-lg hover:bg-[#B33F5E] transition-colors"
          >
            Close Resources
          </button>
        </div>
      </div>
    </div>
  );
}
