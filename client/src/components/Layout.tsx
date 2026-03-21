import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const animationKey = isAdmin ? '/admin' : location.pathname;

  return (
    <div className={cn(
      "bg-primary-60 dark:bg-dark-60 transition-colors duration-500 flex flex-col",
      isAdmin ? "h-screen overflow-hidden" : "min-h-screen"
    )}>
      {!isAdmin && <Navbar />}
      <main className={cn(
        "text-primary-30 dark:text-dark-30 flex-1 flex flex-col min-h-0",
        isAdmin ? "w-full" : "max-w-6xl mx-auto w-full px-6"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={animationKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col min-h-0"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
