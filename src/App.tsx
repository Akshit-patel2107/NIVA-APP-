import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { AuthModal } from './components/AuthModal';
import { GirlsHealthSetupModal } from './components/GirlsHealthSetupModal';
import { PinLockOverlay } from './components/PinLockOverlay';
import { Footer } from './components/Footer';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const { isHealthSetupOpen, setIsHealthSetupOpen } = useAuth();

  const handleOpenQR = () => {
    setActiveTab('store');
    setTimeout(() => {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F5] text-[#2D2328]">
      {/* Top Navigation & Profile Header */}
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

      {/* Global Modals & Vault Protection */}
      <DailyLogModal />
      <EmergencyHelpModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
      <AuthModal />
      <GirlsHealthSetupModal
        isOpen={isHealthSetupOpen}
        onClose={() => setIsHealthSetupOpen(false)}
      />
      <PinLockOverlay />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CycleProvider>
        <MainApp />
      </CycleProvider>
    </AuthProvider>
  );
}
