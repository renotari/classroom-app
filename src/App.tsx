/**
 * Main App Component
 * Entry point dell'applicazione Classroom Management Tool
 */

import { ThemeProvider } from './components/Common/ThemeProvider';
import { MainLayout } from './components/Layout/MainLayout';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  );
}

export default App;
