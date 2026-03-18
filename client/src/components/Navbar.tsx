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
  { name: 'Home', path: '/', icon: Home },
  { name: 'Photography', path: '/photography', icon: Camera },
  { name: 'Academics', path: '/academics', icon: GraduationCap },
  { name: 'Extra', path: '/extra', icon: Trophy },
  { name: 'Blog', path: '/blog', icon: FileText },
  { name: 'Contact', path: '/contact', icon: Mail },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300">
      <nav className="flex items-center gap-1 md:gap-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon size={18} />
              <span className="hidden md:inline">{item.name}</span>
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
