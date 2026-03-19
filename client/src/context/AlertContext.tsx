import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomModal from '../components/admin/CustomModal';

type AlertType = 'info' | 'success' | 'error' | 'confirm';

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: ReactNode;
  onConfirm?: () => void;
}

interface AlertContextType {
  showAlert: (title: string, message: ReactNode, type?: AlertType) => void;
  showConfirm: (title: string, message: ReactNode, onConfirm: () => void) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (title: string, message: ReactNode, type: AlertType = 'info') => {
    setAlertState({ isOpen: true, type, title, message });
  };

  const showConfirm = (title: string, message: ReactNode, onConfirm: () => void) => {
    setAlertState({ isOpen: true, type: 'confirm', title, message, onConfirm });
  };

  const handleClose = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (alertState.onConfirm) alertState.onConfirm();
    handleClose();
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <CustomModal
        isOpen={alertState.isOpen}
        onClose={handleClose}
        title={alertState.title}
        size="sm"
        footer={
          <div className="flex gap-3 w-full justify-end">
            {alertState.type === 'confirm' ? (
              <>
                <button 
                  onClick={handleClose}
                  className="px-5 py-2 rounded-xl font-aladin text-lg transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl font-aladin text-lg transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  Confirm
                </button>
              </>
            ) : (
              <button 
                onClick={handleClose}
                className="px-5 py-2 rounded-xl font-aladin text-lg transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
              >
                Okay
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
