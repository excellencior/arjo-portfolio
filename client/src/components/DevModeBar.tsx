import { useDevMode } from '../context/DevModeContext';
import { motion } from 'framer-motion';
import { Shield, ShieldOff, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

const DevModeBar = () => {
  const { isDevMode, isDevModeAllowed, toggleDevMode } = useDevMode();

  if (!isDevModeAllowed) return null;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed bottom-4 right-4 z-[100] flex items-center gap-3 px-4 py-2 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-500",
        isDevMode 
          ? "bg-amber-500/90 border-amber-400 text-amber-950" 
          : "bg-slate-900/90 border-slate-800 text-slate-400"
      )}
    >
      <div className="flex items-center gap-2">
        {isDevMode ? <ShieldOff size={18} className="animate-pulse" /> : <Shield size={18} />}
        <span className="font-aladin text-sm uppercase tracking-wider font-bold">
          {isDevMode ? "Dev Mode: Bypass Active" : "Dev Mode: Secured"}
        </span>
      </div>
      
      <div className="h-4 w-px bg-current opacity-20" />

      <button
        onClick={toggleDevMode}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
          isDevMode ? "bg-amber-950/20" : "bg-slate-700"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            isDevMode ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>

      {isDevMode && (
        <div className="flex items-center gap-1 text-[10px] font-mono bg-amber-950/10 px-2 py-0.5 rounded-full border border-amber-950/10">
          <AlertTriangle size={10} />
          <span>BYPASSING ADMIN AUTH</span>
        </div>
      )}
    </motion.div>
  );
};

export default DevModeBar;
