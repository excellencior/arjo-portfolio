import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, Send } from 'lucide-react';

interface AdminLoginProps {
  email: string;
  setEmail: (email: string) => void;
  code: string;
  setCode: (code: string) => void;
  step: string;
  setStep: (step: string) => void;
  loading: boolean;
  onSendCode: (e: React.FormEvent) => void;
  onVerifyCode: (e: React.FormEvent) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ 
  email, setEmail, code, setCode, step, setStep, loading, onSendCode, onVerifyCode 
}) => {
  if (step === 'email') {
    return (
      <div className="max-w-md mx-auto pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg"
        >
          <div className="text-center mb-8">
            <LogIn className="mx-auto text-blue-600 mb-4" size={48} />
            <h1 className="text-3xl font-aladin text-slate-900 dark:text-white">Admin Access</h1>
            <p className="text-slate-500 font-aladin text-sm">Enter your Gmail to receive a code</p>
          </div>
          <form onSubmit={onSendCode} className="space-y-4">
            <input 
              type="email" 
              placeholder="Gmail Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-md outline-none border border-transparent focus:border-blue-500 transition-all font-arial placeholder:font-arial"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-md font-aladin text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : <><Send size={20} /> Send Code</>}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-aladin text-slate-900 dark:text-white">Verify Identity</h1>
          <p className="text-slate-500 font-aladin text-sm">Code sent to {email}</p>
        </div>
        <form onSubmit={onVerifyCode} className="space-y-4">
          <input 
            type="text" 
            placeholder="6-digit Code" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-md outline-none border border-transparent focus:border-blue-500 text-center text-2xl tracking-[1em] font-arial placeholder:font-arial"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-md font-aladin text-xl hover:bg-emerald-700 transition-all"
          >
            {loading ? 'Verifying...' : 'Verify & Enter'}
          </button>
          <button 
            type="button" 
            onClick={() => setStep('email')}
            className="w-full text-slate-500 text-sm font-aladin hover:underline"
          >
            Back to Email
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
