import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import CustomModal from '../components/admin/CustomModal';
import { CheckCircle2, Info, X, Loader2 } from 'lucide-react';

type AlertType = 'info' | 'success' | 'error' | 'confirm';

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: ReactNode;
  onConfirm?: () => void | Promise<void>;
}

interface ToastState {
  id: number;
  type: 'success' | 'info';
  title: string;
  message: ReactNode;
  exiting?: boolean;
}

interface AlertContextType {
  showAlert: (title: string, message: ReactNode, type?: AlertType) => void;
  showConfirm: (title: string, message: ReactNode, onConfirm: () => void | Promise<void>) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

let toastIdCounter = 0;

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [confirming, setConfirming] = useState(false);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  // Auto-dismiss toasts
  useEffect(() => {
    const activeToasts = toasts.filter(t => !t.exiting);
    if (activeToasts.length === 0) return;
    
    const timers = activeToasts.map(toast => 
      setTimeout(() => dismissToast(toast.id), 3000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  const showAlert = (title: string, message: ReactNode, type: AlertType = 'info') => {
    // Success and info use toast; error uses modal
    if (type === 'success' || type === 'info') {
      const id = ++toastIdCounter;
      setToasts(prev => [...prev, { id, type, title, message }]);
    } else {
      setAlertState({ isOpen: true, type, title, message });
    }
  };

  const showConfirm = (title: string, message: ReactNode, onConfirm: () => void | Promise<void>) => {
    setAlertState({ isOpen: true, type: 'confirm', title, message, onConfirm });
    setConfirming(false);
  };

  const handleClose = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = async () => {
    if (alertState.onConfirm) {
      setConfirming(true);
      try {
        await alertState.onConfirm();
      } catch (e) {
        console.error('Confirm action failed:', e);
      } finally {
        setConfirming(false);
      }
    }
    handleClose();
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 min-w-[280px] max-w-[400px] ${
              toast.exiting 
                ? 'opacity-0 translate-x-4' 
                : 'opacity-100 translate-x-0 animate-slide-in'
            } ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200'
                : 'bg-blue-50/95 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-200'
            }`}
          >
            {toast.type === 'success' 
              ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              : <Info size={18} className="text-blue-500 shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className="font-aladin text-sm font-bold uppercase tracking-wider">{toast.title}</p>
              <p className="font-arial text-xs opacity-80 truncate">{toast.message}</p>
            </div>
            <button 
              onClick={() => dismissToast(toast.id)} 
              className="opacity-40 hover:opacity-100 transition-opacity shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal for confirm & error only */}
      <CustomModal
        isOpen={alertState.isOpen}
        onClose={handleClose}
        title={alertState.title}
        size="sm"
        variant={alertState.type === 'confirm' ? 'danger' : 'default'}
        footer={
          <div className="flex gap-3 w-full justify-end">
            {alertState.type === 'confirm' ? (
              <>
                <button 
                  onClick={handleClose}
                  disabled={confirming}
                  className="px-4 py-1.5 rounded-md font-aladin text-base transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="px-4 py-1.5 rounded-md font-aladin text-base transition-all bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 disabled:opacity-70 flex items-center gap-2 min-w-[100px] justify-center"
                >
                  {confirming ? <><Loader2 size={16} className="animate-spin" /> Working...</> : 'Confirm'}
                </button>
              </>
            ) : (
              <button 
                onClick={handleClose}
                className="px-4 py-1.5 rounded-md font-aladin text-base transition-all bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
              >
                Close
              </button>
            )}
          </div>
        }
      >
        <p className="font-aladin text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
          {alertState.message}
        </p>
      </CustomModal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
