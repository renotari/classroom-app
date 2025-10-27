/**
 * Main App Component
 * Entry point dell'applicazione Classroom Management Tool
 */

import { useState, useEffect } from 'react';
import { ThemeProvider } from './components/Common/ThemeProvider';
import { MainLayout } from './components/Layout/MainLayout';
import { MicrophonePermissionFlow } from './components/MicrophoneOnboarding/MicrophonePermissionFlow';
import { hasShownMicrophoneOnboarding } from './hooks/useMicrophonePermission';
import './App.css';

function App() {
  const [showMicrophoneOnboarding, setShowMicrophoneOnboarding] = useState(false);

  // Check if user has seen onboarding on mount
  useEffect(() => {
    const hasOnboarded = hasShownMicrophoneOnboarding();
    if (!hasOnboarded) {
      setShowMicrophoneOnboarding(true);
    }
  }, []);

  return (
    <ThemeProvider>
      {/* Microphone Permission Onboarding Modal */}
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
