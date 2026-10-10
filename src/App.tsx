import React, { useState } from 'react';
import { StudentProvider, useStudent, AppView } from './context/StudentContext';
import { SplashScreen } from './components/SplashScreen';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RoadmapView } from './components/RoadmapView';
import { PracticeView } from './components/PracticeView';
import { AITutorView } from './components/AITutorView';
import { NotesView } from './components/NotesView';
import { AnalyticsView } from './components/AnalyticsView';
import { VideosView } from './components/VideosView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { NotificationsView } from './components/NotificationsView';
import { AuthModal } from './components/AuthModal';
import { OllamaStatusModal } from './components/OllamaStatusModal';
import { DeviceViewportSwitcher } from './components/DeviceViewportSwitcher';

const AppContent: React.FC = () => {
  const { activeView, deviceScene, showOnboarding, setShowOnboarding } = useStudent();

  const renderActiveView = () => {
    switch (activeView) {
      case 'roadmap':
        return <RoadmapView />;
      case 'practice':
        return <PracticeView />;
      case 'tutor':
        return <AITutorView />;
      case 'notes':
        return <NotesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'videos':
        return <VideosView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  const mainApplication = (
    <div className="min-h-full bg-[#FAF7F2] text-[#292524] flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <main className="flex-1 pb-16">
        {renderActiveView()}
      </main>
      <AuthModal />
      <OllamaStatusModal />
    </div>
  );

  // Full Screen Responsive View
  if (deviceScene === 'responsive') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] relative">
        {mainApplication}
        <DeviceViewportSwitcher />
        {showOnboarding && <SplashScreen onDismiss={() => setShowOnboarding(false)} />}
      </div>
    );
  }

  // Device Frame Specifications for scenes (Mobile, Tablet, Laptop)
  const frameSpecs = {
    mobile: {
      width: 'max-w-[390px]',
      height: 'h-[844px]',
      label: 'Mobile Preview • 390 × 844',
      radius: 'rounded-[46px]',
      bezel: 'border-[10px] border-[#292524]',
    },
    tablet: {
      width: 'max-w-[768px]',
      height: 'h-[1024px]',
      label: 'Tablet Preview • 768 × 1024',
      radius: 'rounded-[38px]',
      bezel: 'border-[12px] border-[#292524]',
    },
    laptop: {
      width: 'max-w-[1024px]',
      height: 'h-[680px]',
      label: 'Laptop Preview • 1024 × 680',
      radius: 'rounded-[26px]',
      bezel: 'border-[10px] border-[#3D342F]',
    },
  }[deviceScene];

  return (
    <div className="min-h-screen bg-[#1E1B18] flex flex-col items-center justify-start py-8 px-4 overflow-y-auto selection:bg-[#EBE5DA]">
      {/* Device Scene Label */}
      <div className="mb-4 text-center">
        <span className="text-xs font-bold text-stone-300 bg-stone-800/90 px-4 py-1.5 rounded-full border border-stone-700 shadow-md">
          {frameSpecs.label}
        </span>
      </div>

      {/* Realistic Device Hardware Frame */}
      <div
        className={`w-full ${frameSpecs.width} ${frameSpecs.height} ${frameSpecs.radius} ${frameSpecs.bezel} bg-black shadow-2xl overflow-hidden relative flex flex-col shrink-0`}
      >
        {/* Mobile Camera Pill / Dynamic Island */}
        {deviceScene === 'mobile' && (
          <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-900 mr-2" />
            <div className="w-1.5 h-1.5 rounded-full bg-stone-900" />
          </div>
        )}

        {/* Scrollable Viewport */}
        <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-[#FAF7F2]">
          {mainApplication}
        </div>
      </div>

      <DeviceViewportSwitcher />
      {showOnboarding && <SplashScreen onDismiss={() => setShowOnboarding(false)} />}
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return true;
  });

  return (
    <StudentProvider>
      {showSplash ? (
        <SplashScreen onDismiss={() => setShowSplash(false)} />
      ) : (
        <AppContent />
      )}
    </StudentProvider>
  );
}
