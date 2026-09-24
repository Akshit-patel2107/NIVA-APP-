import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Droplet,
  QrCode,
  Package,
  Calendar,
  Leaf,
  Heart,
  Award,
  Info,
  CheckCircle2,
  X,
  Clock,
} from 'lucide-react';
import { useCycle } from '../context/CycleContext';
import { NIVA_PRODUCTS } from '../data/mockData';
import { NIVAProduct, BatchVerificationResult } from '../types';
import { formatDisplayDate } from '../utils/cycleEngine';

export function PadStoreAndEcosystem() {
  const {
    cycleStatus,
    isCarePlus,
    setIsCarePlus,
    padInventory,
    restockPads,
  } = useCycle();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<NIVAProduct | null>(null);
  const [activePadSuccess, setActivePadSuccess] = useState<string | null>(null);

  // QR Code Scanner / Batch Code state
  const [qrInput, setQrInput] = useState<string>('NIVA-ORG-2849');
  const [isVerifyingQR, setIsVerifyingQR] = useState<boolean>(false);
  const [batchResult, setBatchResult] = useState<BatchVerificationResult | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  // Filter products
  const filteredProducts = NIVA_PRODUCTS.filter((prod) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'day') return prod.category === 'daily';
    if (categoryFilter === 'night') return prod.category === 'night';
    if (categoryFilter === 'teen') return prod.category === 'teen';
    if (categoryFilter === 'combo') return prod.category === 'combo';
    if (categoryFilter === 'maternity') return prod.category === 'maternity';
    return true;
  });

  // Verify batch code handler
  const handleVerifyBatch = async (codeToVerify?: string) => {
    const code = (codeToVerify || qrInput).trim().toUpperCase();
    if (!code) return;

    setIsVerifyingQR(true);
    setQrError(null);
    setSyncSuccess(false);

    try {
      const res = await fetch(`/api/qr/verify/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok || !data.verified) {
        throw new Error(data.error || 'Invalid or unrecognized batch code');
      }
      setBatchResult(data.batch);
    } catch (err: any) {
      setBatchResult(null);
      setQrError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setIsVerifyingQR(false);
    }
  };

  // Sync verified pack with app inventory
  const handleSyncToInventory = () => {
    if (batchResult) {
      restockPads(batchResult.padCount, batchResult.batchNumber, batchResult.productName);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    }
  };

  // Set pad as active in personal tracker
  const handleSetCurrentPad = (product: NIVAProduct) => {
    restockPads(0, padInventory.activeBatchCode, product.name);
    setActivePadSuccess(product.id);
    setTimeout(() => setActivePadSuccess(null), 3000);
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-16">
      {/* Brand Hero & Ecosystem Vision */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#2D2328]/08 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#7D2840] uppercase tracking-wider">
              The NIVA Menstrual Ecosystem
            </span>
            <span className="text-xs text-[#64555D]">·</span>
            <span className="text-xs text-[#64555D]">Physical Pad Meets Smart Companion</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D2328] text-balance">
            Pure Organic Protection. Smart Digital Synchrony.
          </h1>

          <p className="text-sm text-[#64555D] leading-relaxed">
            At NIVA, we design hypoallergenic, zero-toxin organic cotton pads that respect sensitive skin, paired with an intelligent companion app. Use this guide to explore pad absorbency specifications, verify your packaging QR code, and track your pad hygiene routine.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#2D2328]">
            <span className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>100% GOTS Organic Cotton</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#2D2328] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#C54B6C]" />
              <span>0% Chlorine, Perfumes, or Dyes</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#2D2328] font-medium">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Dermatest® "Excellent" Sensitive Rating</span>
            </span>
          </div>
        </div>
      </div>

      {/* QR Code Batch Authenticator & Digital Sync */}
      <div className="bg-gradient-to-br from-[#FFF5F7] via-white to-[#FAF7F5] rounded-2xl p-6 sm:p-8 border border-[#C54B6C]/20 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#2D2328]/08">
          <div>
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#C54B6C]" />
              <h2 className="text-xl font-serif font-bold text-[#2D2328]">
                NIVA QR Authenticator & Pack Sync
              </h2>
            </div>
            <p className="text-xs text-[#64555D] mt-1 max-w-xl">
              Every NIVA sanitary pad box contains an authentication QR code. Scan or enter your code to verify pure organic provenance, dermatological certification, and automatically synchronize your pack in your digital tracker.
            </p>
          </div>

          {/* Quick preset codes */}
          <div className="text-xs space-y-1.5">
            <span className="text-[#64555D] block">Sample Verified Batch Codes:</span>
            <div className="flex flex-wrap gap-1.5">
              {['NIVA-ORG-2849', 'NIVA-NIGHT-9481', 'NIVA-TEEN-1102'].map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setQrInput(code);
                    handleVerifyBatch(code);
                  }}
                  className="px-2.5 py-1 rounded bg-white border border-[#2D2328]/10 text-[11px] font-mono text-[#2D2328] hover:border-[#C54B6C] transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input & verification view */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="e.g. NIVA-ORG-2849 or scan with camera"
              className="w-full px-4 py-2.5 rounded-xl border border-[#2D2328]/15 bg-white text-xs text-[#2D2328] focus:outline-none focus:ring-1 focus:ring-[#C54B6C] font-mono uppercase"
            />
          </div>
          <button
            onClick={() => handleVerifyBatch()}
            disabled={isVerifyingQR}
            className="px-5 py-2.5 bg-[#C54B6C] text-white text-xs font-semibold rounded-xl hover:bg-[#B33F5E] transition-colors flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifyingQR ? 'Verifying Batch...' : 'Authenticate Batch'}</span>
          </button>
        </div>

        {qrError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-[#7D2840]">
            {qrError}
          </div>
        )}

        {/* Verified Batch Result Card */}
        {batchResult && (
          <div className="mt-6 p-5 bg-white rounded-xl border border-emerald-300 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#2D2328]/06">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-xs font-bold text-emerald-800">
                    Authentic Verified NIVA Sanitary Pad
                  </span>
                  <div className="text-sm font-semibold text-[#2D2328]">
                    {batchResult.productName}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Batch: {batchResult.batchNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-[#FAF7F5] rounded-lg">
                <span className="text-[#64555D] block">Core Material:</span>
                <span className="font-semibold text-[#2D2328]">{batchResult.coreMaterial}</span>
              </div>
              <div className="p-2.5 bg-[#FAF7F5] rounded-lg">
                <span className="text-[#64555D] block">Safety Testing:</span>
                <span className="font-semibold text-emerald-800">{batchResult.testedBy}</span>
              </div>
              <div className="p-2.5 bg-[#FAF7F5] rounded-lg">
                <span className="text-[#64555D] block">Toxin Profile:</span>
                <span className="font-semibold text-[#2D2328]">{batchResult.toxins}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FDF2F4] rounded-lg text-xs text-[#7D2840] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C54B6C] shrink-0" />
                <span>{batchResult.bonusPerk}</span>
              </div>
              <button
                onClick={handleSyncToInventory}
                className="px-3.5 py-1.5 bg-[#C54B6C] text-white rounded-lg font-semibold hover:bg-[#B33F5E] transition-colors whitespace-nowrap text-xs shadow-xs"
              >
                {syncSuccess ? '✓ Synced (+ ' + batchResult.padCount + ' Pads)' : 'Add +' + batchResult.padCount + ' Pads to Tracker'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Specifications & Sizing Guide */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#2D2328]">
              Pad Specifications & Sizing Guide
            </h2>
            <p className="text-xs text-[#64555D] mt-0.5">
              Engineered for anatomical movement, certified hypoallergenic protection, and flow synchronization.
            </p>
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/08 text-xs overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All Pads' },
              { id: 'day', label: 'Daytime' },
              { id: 'night', label: 'Overnight' },
              { id: 'teen', label: 'Teen Kits' },
              { id: 'combo', label: 'Cycle Bundles' },
              { id: 'maternity', label: 'Maternity' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
                  categoryFilter === tab.id
                    ? 'bg-white text-[#2D2328] shadow-xs'
                    : 'text-[#64555D] hover:text-[#2D2328]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const isCurrentPad = padInventory.productName === prod.name;
            const isJustUpdated = activePadSuccess === prod.id;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-[#2D2328]/08 hover:border-[#C54B6C]/30 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Product Visual Container */}
                <div className="relative h-48 bg-gradient-to-b from-[#FDF2F4] to-[#FAF7F5] p-6 flex flex-col items-center justify-center border-b border-[#2D2328]/06">
                  {prod.isPopular && (
                    <span className="absolute top-3 left-3 text-[11px] font-semibold text-[#7D2840] bg-white px-2 py-0.5 rounded shadow-xs">
                      Popular Fit
                    </span>
                  )}
                  <span className="absolute top-3 right-3 text-[11px] font-medium text-[#64555D]">
                    {prod.lengthMm}mm
                  </span>

                  {/* Stylized vector pad packaging emblem */}
                  <div className="w-20 h-28 bg-white rounded-2xl shadow-sm border border-[#C54B6C]/20 flex flex-col items-center justify-between p-2 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full flex justify-between items-center text-[8px] font-serif text-[#C54B6C] font-bold">
                      <span>NIVA</span>
                      <span>100% ORG</span>
                    </div>
                    <div className="w-8 h-12 rounded-full border border-dashed border-[#C54B6C]/40 flex items-center justify-center">
                      <Droplet className="w-4 h-4 text-[#C54B6C] fill-[#C54B6C]/30" />
                    </div>
                    <span className="text-[8px] text-[#64555D] uppercase tracking-tighter">
                      {prod.count} Pads
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[11px] text-[#64555D]">
                    <span>Absorbency:</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((drop) => (
                        <Droplet
                          key={drop}
                          className={`w-3 h-3 ${
                            drop <= prod.absorbencyDrops
                              ? 'text-[#C54B6C] fill-[#C54B6C]'
                              : 'text-[#D0C7CC]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#64555D]">
                      <span>{prod.flowType}</span>
                      <span>{prod.count} pads / pack</span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#2D2328] mt-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-[#64555D] mt-1 line-clamp-2">
                      {prod.tagline}
                    </p>

                    <ul className="mt-3 space-y-1 text-xs text-[#64555D]">
                      {prod.features.slice(0, 2).map((feat, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Specification & Selection Actions */}
                  <div className="pt-3 border-t border-[#2D2328]/08 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#64555D]">Best Suited For:</span>
                      <span className="text-emerald-800 font-medium">
                        {prod.category === 'night' ? 'Overnight Sleep' : prod.category === 'teen' ? 'Petite / First Periods' : 'Active Daytime'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="py-2 px-3 text-xs font-medium text-[#2D2328] bg-[#FAF7F5] border border-[#2D2328]/10 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-1"
                      >
                        <Info className="w-3.5 h-3.5 text-[#64555D]" />
                        <span>Specs & Care</span>
                      </button>

                      <button
                        onClick={() => handleSetCurrentPad(prod)}
                        className={`py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs ${
                          isJustUpdated || isCurrentPad
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#C54B6C] text-white hover:bg-[#B33F5E]'
                        }`}
                      >
                        {isJustUpdated ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Set as Active!</span>
                          </>
                        ) : isCurrentPad ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Active in Tracker</span>
                          </>
                        ) : (
                          <span>Use in Tracker</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-xl border border-[#2D2328]/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#2D2328]/08 flex items-center justify-between bg-[#FAF7F5]">
              <div>
                <span className="text-xs font-semibold text-[#7D2840]">
                  {selectedProduct.lengthMm}mm · {selectedProduct.flowType}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#2D2328]">
                  {selectedProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-lg text-[#64555D] hover:text-[#2D2328] hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs text-[#2D2328] leading-relaxed flex-1">
              <div>
                <span className="font-semibold text-[#64555D] block mb-1 uppercase tracking-wider text-[11px]">
                  Description & Fit
                </span>
                <p className="text-[#3D3237] leading-relaxed">
                  {selectedProduct.tagline}
                </p>
              </div>

              <div>
                <span className="font-semibold text-[#64555D] block mb-1 uppercase tracking-wider text-[11px]">
                  Material Profile
                </span>
                <p className="p-3 bg-[#FAF7F5] rounded-xl border border-[#2D2328]/06 text-[#3D3237]">
                  {selectedProduct.materialDescription}
                </p>
              </div>

              <div>
                <span className="font-semibold text-[#64555D] block mb-1.5 uppercase tracking-wider text-[11px]">
                  Key Engineering Features
                </span>
                <ul className="space-y-1.5">
                  {selectedProduct.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-[#FDF2F4] rounded-xl border border-[#C54B6C]/20 text-[#7D2840] flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#C54B6C] shrink-0 mt-0.5" />
                <span>
                  <strong>Hygiene Schedule:</strong> Change every 4 to 6 hours during daytime wear to keep the vulvar microbiome healthy and prevent bacterial friction.
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-[#2D2328]/08 bg-[#FAF7F5] flex items-center justify-between">
              <span className="text-xs text-[#64555D]">
                Pack of {selectedProduct.count} Pads
              </span>
              <button
                onClick={() => {
                  handleSetCurrentPad(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#C54B6C] rounded-lg hover:bg-[#B33F5E] transition-colors"
              >
                Set as Active Pad in Tracker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wellness Membership / Care+ Tier Guide */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#2D2328]/08 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-semibold text-[#7D2840] uppercase tracking-wider">
            Accessible Digital Wellness
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D2328]">
            NIVA Companion Features
          </h2>
          <p className="text-xs text-[#64555D]">
            All core period tracking, pad hygiene timers, and QR batch authentication tools are completely free forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
          {/* Free Standard Tier */}
          <div className="p-6 rounded-2xl border border-[#2D2328]/10 bg-[#FAF7F5] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-[#64555D] uppercase tracking-wider">
                  Always Included
                </span>
                <h3 className="text-xl font-serif font-bold text-[#2D2328] mt-0.5">
                  NIVA Core (Free)
                </h3>
                <div className="text-2xl font-serif font-bold text-[#2D2328] mt-2">
                  $0{' '}
                  <span className="text-xs font-sans font-normal text-[#64555D]">
                    / forever
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-[#64555D]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cycle & fertile window prediction calendar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Smart pad change timer & hygiene alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Symptom, mood, and water intake tracker</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NIVA pad QR authenticity & batch verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Emergency health hotline directory & teen guide</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-[#2D2328]/08 text-xs text-[#64555D] text-center">
              Active by default on all accounts
            </div>
          </div>

          {/* Premium NIVA Care+ Tier */}
          <div className="p-6 rounded-2xl border-2 border-[#C54B6C] bg-white flex flex-col justify-between space-y-6 shadow-sm relative">
            <span className="absolute -top-3 right-6 bg-[#C54B6C] text-white text-[11px] font-semibold px-3 py-0.5 rounded-full">
              Advanced Digital Health
            </span>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-[#7D2840] uppercase tracking-wider">
                  Full Digital Health Suite
                </span>
                <h3 className="text-xl font-serif font-bold text-[#2D2328] mt-0.5">
                  NIVA Care+
                </h3>
                <div className="text-2xl font-serif font-bold text-[#2D2328] mt-2">
                  Optional{' '}
                  <span className="text-xs font-sans font-normal text-[#64555D]">
                    digital membership
                  </span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-[#2D2328]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C54B6C] shrink-0" />
                  <span>Unlimited personalized AI cycle reports & Q&A</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C54B6C] shrink-0" />
                  <span>Doctor-ready symptom export (PDF summary for Gynecologist)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C54B6C] shrink-0" />
                  <span>Teen cycle coaching & hormone balance recipes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C54B6C] shrink-0" />
                  <span>24/7 confidential tele-nurse chat guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C54B6C] shrink-0" />
                  <span>Multi-cycle hormonal variance analytics</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setIsCarePlus(!isCarePlus)}
              className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl transition-colors shadow-xs ${
                isCarePlus
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-[#C54B6C] text-white hover:bg-[#B33F5E]'
              }`}
            >
              {isCarePlus ? '✓ Care+ Active (Click to Toggle)' : 'Activate NIVA Care+'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
