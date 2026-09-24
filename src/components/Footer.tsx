import React from 'react';
import { ShieldCheck, Heart, RefreshCw } from 'lucide-react';
import { useCycle } from '../context/CycleContext';

export function Footer() {
  const { resetAllData } = useCycle();

  return (
    <footer className="border-t border-[#2D2328]/10 bg-white/60 mt-16 text-xs text-[#64555D]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-lg font-serif font-bold text-[#2D2328]">
              NIVA
            </span>
            <p className="text-xs text-[#64555D] max-w-md">
              A modern, trustworthy menstrual wellness ecosystem combining certified organic cotton sanitary pads with an intelligent cycle companion.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted on-device health storage. Zero third-party ad tracking.</span>
          </div>
        </div>

        {/* Medical disclaimer note */}
        <p className="text-[11px] text-[#64555D] leading-relaxed border-t border-[#2D2328]/06 pt-4">
          Medical Disclaimer: NIVA provides self-care period tracking, cycle estimations, pad change reminders, and AI-assisted educational guidance. NIVA is not a diagnostic medical device, contraceptive tool, or doctor replacement. If you have severe, abnormal, or sudden gynecological symptoms, consult a qualified healthcare provider immediately.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] border-t border-[#2D2328]/06 pt-4 text-[#8C7D85]">
          <span>© {new Date().getFullYear()} NIVA Menstrual Care Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.confirm('Reset local tracking data to default demonstration state?')) {
                  resetAllData();
                }
              }}
              className="text-[#64555D] hover:text-[#C54B6C] transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Demo State</span>
            </button>
            <span>Made with care for women everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
