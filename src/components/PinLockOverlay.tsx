import React, { useState } from 'react';
import { Lock, Shield, Eye, EyeOff, Heart, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function PinLockOverlay() {
  const { isLocked, unlockWithPin, healthProfile, user } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const verify = async (pinAttempt: string) => {
    const success = await unlockWithPin(pinAttempt);
    if (!success) {
      setError(true);
      setTimeout(() => {
        setPin('');
      }, 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF7F5] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-xs w-full flex flex-col items-center">
        {/* App Logo */}
        <div className="w-16 h-16 rounded-3xl bg-[#FDF2F4] border border-[#C54B6C]/20 flex items-center justify-center mb-4 shadow-sm text-[#C54B6C]">
          <Lock className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-serif font-bold text-[#2D2328] mb-1">
          NIVA Health Vault
        </h1>
        <p className="text-xs text-[#7B6A74] mb-6">
          Confidential cycle & intimate symptoms lock for{' '}
          <span className="font-semibold text-[#2D2328]">{user?.name || 'Account'}</span>
        </p>

        {/* PIN Indicators */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 scale-110 animate-bounce'
                    : filled
                    ? 'bg-[#C54B6C] scale-105'
                    : 'bg-[#2D2328]/15'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="text-xs font-semibold text-rose-600 mb-4 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Incorrect PIN. Please try again.</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-white border border-[#2D2328]/10 text-xl font-semibold text-[#2D2328] hover:bg-[#FDF2F4] active:scale-95 transition-all shadow-sm"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-white border border-[#2D2328]/10 text-xl font-semibold text-[#2D2328] hover:bg-[#FDF2F4] active:scale-95 transition-all shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-white border border-[#2D2328]/10 text-xs font-bold text-[#7B6A74] hover:bg-rose-50 hover:text-rose-700 active:scale-95 transition-all shadow-sm"
          >
            DEL
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#7B6A74]">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local device protection active</span>
        </div>
      </div>
    </div>
  );
}
