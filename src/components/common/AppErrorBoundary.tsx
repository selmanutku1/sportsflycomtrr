import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  onResetToHome?: () => void;
  key?: React.Key;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'Beklenmeyen bir arayüz hatası oluştu.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[SportsFly ErrorBoundary]', error, errorInfo);
  }

  private handleRetry = () => {
    (this as any).setState({ hasError: false, errorMessage: '' });
  };

  private handleGoHome = () => {
    (this as any).setState({ hasError: false, errorMessage: '' });
    if ((this as any).props.onResetToHome) {
      (this as any).props.onResetToHome();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] w-full flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {(this as any).props.fallbackTitle || 'Bu modül yüklenirken geçici bir sorun oluştu'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Oturumunuz ve verileriniz güvende. Sayfayı yenileyerek veya ana ekrana dönerek işleminize kesintisiz devam edebilirsiniz.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Modülü Yenile
              </button>
              {(this as any).props.onResetToHome && (
                <button
                  type="button"
                  onClick={this.handleGoHome}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  Ana Sayfaya Dön
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
