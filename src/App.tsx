/**
 * Main App Component
 * Entry point dell'applicazione Classroom Management Tool
 */

import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/Common/ThemeProvider';
import { MainLayout } from './components/Layout/MainLayout';
import { MicrophonePermissionFlow } from './components/MicrophoneOnboarding/MicrophonePermissionFlow';
import { hasShownMicrophoneOnboarding, markMicrophoneOnboardingComplete } from './hooks/useMicrophonePermission';
import './App.css';

function App() {
  const [showMicrophoneOnboarding, setShowMicrophoneOnboarding] = useState(false);

  // Auto-mark onboarding as complete on mount to allow app usage
  // User can still request permission when accessing Noise Monitoring
  useEffect(() => {
    const hasOnboarded = hasShownMicrophoneOnboarding();
    if (!hasOnboarded) {
      // Auto-complete onboarding to prevent modal from blocking app
      // This allows users to start using the app immediately
      markMicrophoneOnboardingComplete();
    }
  }, []);

  return (
    <ThemeProvider>
      {/* Microphone Permission Onboarding Modal - Hidden until explicitly opened */}
      <MicrophonePermissionFlow
        isOpen={showMicrophoneOnboarding}
        onComplete={() => {
          setShowMicrophoneOnboarding(false);
        }}
      />

      {/* Main Application */}
      <MainLayout />
    </ThemeProvider>
  );
}

export default App;
