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
  { name: 'Home', path: '/', icon: Home, color: 'from-black via-slate-900 to-slate-950', darkColor: 'from-white via-slate-100 to-slate-200', accent: 'text-slate-950', darkAccent: 'text-slate-100', bg: 'bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 shadow-sm' },
  { name: 'Photography', path: '/photography', icon: Camera, color: 'from-black via-blue-900 to-blue-950', darkColor: 'from-blue-200 via-blue-900 to-indigo-200', accent: 'text-blue-950', darkAccent: 'text-blue-200', bg: 'bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 shadow-sm' },
  { name: 'Academics', path: '/academics', icon: GraduationCap, color: 'from-black via-emerald-900 to-emerald-950', darkColor: 'from-emerald-200 via-emerald-900 to-teal-200', accent: 'text-emerald-950', darkAccent: 'text-emerald-200', bg: 'bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 shadow-sm' },
  { name: 'Extra', path: '/extra', icon: Trophy, color: 'from-black via-rose-900 to-rose-950', darkColor: 'from-rose-200 via-rose-900 to-orange-200', accent: 'text-rose-950', darkAccent: 'text-rose-200', bg: 'bg-rose-50 dark:bg-rose-900/40 border border-rose-100 dark:border-rose-800 shadow-sm' },
  { name: 'Blog', path: '/blog', icon: FileText, color: 'from-black via-pink-900 to-pink-950', darkColor: 'from-pink-200 via-pink-900 to-purple-200', accent: 'text-pink-950', darkAccent: 'text-pink-200', bg: 'bg-pink-50 dark:bg-pink-900/40 border border-pink-100 dark:border-pink-800 shadow-sm' },
  { name: 'Contact', path: '/contact', icon: Mail, color: 'from-black via-cyan-900 to-cyan-950', darkColor: 'from-cyan-200 via-cyan-900 to-blue-200', accent: 'text-cyan-950', darkAccent: 'text-cyan-200', bg: 'bg-cyan-50 dark:bg-cyan-900/40 border border-cyan-100 dark:border-cyan-800 shadow-sm' },
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
                isActive 
                  ? "text-transparent" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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
                "hidden md:inline text-lg",
                isActive && `bg-gradient-to-r ${item.color} dark:${item.darkColor} bg-clip-text text-transparent`
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
