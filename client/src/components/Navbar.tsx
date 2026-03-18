import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, GraduationCap, Trophy, FileText, Mail } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ThemeToggle from './ThemeToggle';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Home', path: '/', icon: Home, accent: 'text-slate-950', darkAccent: 'text-white', bg: 'bg-gray-100/80 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm' },
  { name: 'Photography', path: '/photography', icon: Camera, accent: 'text-blue-950', darkAccent: 'text-white', bg: 'bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 shadow-sm' },
  { name: 'Academics', path: '/academics', icon: GraduationCap, accent: 'text-emerald-950', darkAccent: 'text-white', bg: 'bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 shadow-sm' },
  { name: 'Extra', path: '/extra', icon: Trophy, accent: 'text-rose-950', darkAccent: 'text-white', bg: 'bg-rose-50/80 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 shadow-sm' },
  { name: 'Blog', path: '/blog', icon: FileText, accent: 'text-pink-950', darkAccent: 'text-white', bg: 'bg-pink-50/80 dark:bg-pink-950/60 border border-pink-100 dark:border-pink-900 shadow-sm' },
  { name: 'Contact', path: '/contact', icon: Mail, accent: 'text-cyan-950', darkAccent: 'text-white', bg: 'bg-cyan-50/80 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-900 shadow-sm' },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-3 py-1 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300">
      <nav className="flex items-center gap-1 md:gap-2">
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
                  className={cn("absolute inset-0 rounded-xl -z-10 transition-colors duration-300", item.bg)}
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
    </div>
  );
};

export default Navbar;
