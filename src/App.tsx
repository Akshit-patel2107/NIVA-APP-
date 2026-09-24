import React, { useState } from 'react';
import { CycleProvider, useCycle } from './context/CycleContext';
import { Header } from './components/Header';
import { DiscreetModeBanner } from './components/DiscreetModeBanner';
import { CycleDashboard } from './components/CycleDashboard';
import { CycleCalendarView } from './components/CycleCalendarView';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { PadStoreAndEcosystem } from './components/PadStoreAndEcosystem';
import { HealthAcademy } from './components/HealthAcademy';
import { DailyLogModal } from './components/DailyLogModal';
import { EmergencyHelpModal } from './components/EmergencyHelpModal';
import { Footer } from './components/Footer';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);

  const handleOpenQR = () => {
    setActiveTab('store');
    // Scroll smoothly to QR section if already on store
    setTimeout(() => {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F5] text-[#2D2328]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQR={handleOpenQR}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
      />

      {/* Discreet Mode Notification Banner */}
      <DiscreetModeBanner />

      {/* Main View Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <CycleDashboard
            onNavigateToCalendar={() => setActiveTab('calendar')}
            onNavigateToInsights={() => setActiveTab('insights')}
            onNavigateToStore={() => setActiveTab('store')}
            onOpenQR={handleOpenQR}
          />
        )}

        {activeTab === 'calendar' && <CycleCalendarView />}

        {activeTab === 'insights' && <AIInsightsPanel />}

        {activeTab === 'store' && <PadStoreAndEcosystem />}

        {activeTab === 'academy' && <HealthAcademy />}
      </main>

      {/* Global Modals */}
      <DailyLogModal />
      <EmergencyHelpModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CycleProvider>
      <MainApp />
    </CycleProvider>
  );
}
