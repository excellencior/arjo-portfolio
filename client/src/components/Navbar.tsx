import { useState, useRef } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Camera, GraduationCap, Trophy, FileText, Mail } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ThemeToggle from './ThemeToggle';

import { useBranding } from '../context/BrandingContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
// ... ( Photography, Academics, etc. )
  { name: 'Photography', path: '/photography', icon: Camera, accent: 'text-blue-950', darkAccent: 'text-white', bg: 'bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 shadow-sm' },
  { name: 'Academics', path: '/academics', icon: GraduationCap, accent: 'text-emerald-950', darkAccent: 'text-white', bg: 'bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 shadow-sm' },
  { name: 'Extra', path: '/extra', icon: Trophy, accent: 'text-rose-950', darkAccent: 'text-white', bg: 'bg-rose-50/80 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 shadow-sm' },
  { name: 'Blog', path: '/blog', icon: FileText, accent: 'text-pink-950', darkAccent: 'text-white', bg: 'bg-pink-50/80 dark:bg-pink-950/60 border border-pink-100 dark:border-pink-900 shadow-sm' },
  { name: 'Contact', path: '/contact', icon: Mail, accent: 'text-cyan-950', darkAccent: 'text-white', bg: 'bg-cyan-50/80 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-900 shadow-sm' },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Navbar = () => {
  const { branding } = useBranding();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    
    // Clear stop timeout
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    if (latest > previous && latest > 100) {
      // Scrolling down
      setVisible(false);
    } else {
      // Scrolling up
      setVisible(true);
    }

    // Set stop timeout to show navbar
    scrollTimeout.current = setTimeout(() => {
      setVisible(true);
    }, 1000);

    lastScrollY.current = latest;
  });

  return (
    <motion.div 
      initial={{ x: "-50%", y: 0 }}
      animate={{ x: "-50%", y: visible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-4 left-1/2 z-50 px-3 py-1 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm"
    >
      <nav className="flex items-center gap-1 md:gap-2">
        <Link 
          to="/" 
          className={cn(
            "relative flex items-center justify-center shrink-0 px-3 py-2 rounded-xl transition-all duration-300",
            location.pathname !== '/' && "hover:bg-gray-50 dark:hover:bg-slate-900"
          )}
        >
          {location.pathname === '/' && (
            <motion.div
              layoutId="nav-pill"
              className="absolute inset-0 rounded-xl -z-10 bg-gray-100/80 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <img 
            src={`${API_URL}/api/branding/logo?t=${branding.updated_at || Date.now()}`} 
            alt="Logo" 
            className="h-6 w-auto object-contain transition-transform hover:scale-105 dark:invert" 
          />
        </Link>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-aladin transition-all duration-300",
                !isActive && "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className={cn("absolute inset-0 rounded-xl -z-10", item.bg)}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon size={16} className={isActive ? cn(item.accent, `dark:${item.darkAccent}`) : ""} />
              <span className={cn(
                "hidden md:inline text-lg font-bold",
                isActive ? cn(item.accent, `dark:${item.darkAccent}`) : ""
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
        <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-800">
          <ThemeToggle />
        </div>
      </nav>
    </motion.div>
  );
};

export default Navbar;
