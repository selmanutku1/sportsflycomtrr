import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './firebase';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';
import { sanitizeCorruptedStorageOnBoot } from './utils/safeStorage';

sanitizeCorruptedStorageOnBoot();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary fallbackTitle="Sistem arayüzü yeniden başlatılıyor">
      <ThemeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  </StrictMode>,
);
