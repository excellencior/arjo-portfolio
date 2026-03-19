import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-primary-60 dark:bg-dark-60 transition-colors duration-500">
      {!isAdmin && <Navbar />}
      <main className={`${isAdmin ? 'pt-0' : 'pt-20'} pb-12 px-6 max-w-6xl mx-auto text-primary-30 dark:text-dark-30`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
