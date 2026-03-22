import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Camera, GraduationCap, Trophy, FileText, Mail } from 'lucide-react';
import { cn } from '../lib/utils';
import ThemeToggle from './ThemeToggle';
import { useBranding } from '../context/BrandingContext';


const navItems = [
  {
    name: 'Photography', path: '/photography', icon: Camera,
    activeClass: 'text-blue-950 dark:text-white',
    bg: 'bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 shadow-sm',
  },
  {
    name: 'Academics', path: '/academics', icon: GraduationCap,
    activeClass: 'text-emerald-950 dark:text-white',
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 shadow-sm',
  },
  {
    name: 'Extra', path: '/extra', icon: Trophy,
    activeClass: 'text-violet-950 dark:text-white',
    bg: 'bg-violet-50/80 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-900 shadow-sm',
  },
  {
    name: 'Blog', path: '/blog', icon: FileText,
    activeClass: 'text-pink-950 dark:text-white',
    bg: 'bg-pink-50/80 dark:bg-pink-950/60 border border-pink-100 dark:border-pink-900 shadow-sm',
  },
  {
    name: 'Contact', path: '/contact', icon: Mail,
    activeClass: 'text-cyan-950 dark:text-white',
    bg: 'bg-cyan-50/80 dark:bg-cyan-950/60 border border-pink-100 dark:border-cyan-900 shadow-sm',
  },
];

const allItems = [
  {
    path: '/',
    bg: 'bg-gray-100/80 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm',
    activeClass: 'text-gray-900 dark:text-white',
  },
  ...navItems,
];

const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
  const { branding } = useBranding();
  const location = useLocation();
  const [visible, setVisible] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const navRef = useRef<HTMLElement | null>(null);

  const [pillStyle, setPillStyle] = useState<{
    left: number; width: number; top: number; height: number;
  } | null>(null);

  const activePath = location.pathname;
  const activeItem = allItems.find(i => i.path === activePath);

  const recalcPill = () => {
    const el = itemRefs.current[activePath];
    const nav = navRef.current;
    if (!el || !nav) return;
    const elRect = el.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    setPillStyle({
      left: elRect.left - navRect.left,
      top: elRect.top - navRect.top,
      width: elRect.width,
      height: elRect.height,
    });
  };

  useEffect(() => { recalcPill(); }, [activePath]);
  useEffect(() => { if (logoLoaded) recalcPill(); }, [logoLoaded]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const ro = new ResizeObserver(() => recalcPill());
    ro.observe(nav);
    return () => ro.disconnect();
  }, [activePath]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    if (latest > previous && latest > 100) {
      setVisible(false);
    } else {
      setVisible(true);
    }
    scrollTimeout.current = setTimeout(() => setVisible(true), 1000);
    lastScrollY.current = latest;
  });

  return (
    <motion.div
      initial={{ x: "-50%", y: 0 }}
      animate={{ x: "-50%", y: visible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-4 left-1/2 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-800 w-[95vw] min-[421px]:w-[80vw] min-[650px]:w-auto min-[650px]:max-w-[calc(100vw-2rem)]"
    >
      <nav ref={navRef} className="relative flex items-center justify-between min-[650px]:justify-start w-full gap-0.5 min-[650px]:gap-1 px-2 min-[650px]:px-3 py-1 flex-nowrap min-w-0">

        {/* Sliding pill */}
        {pillStyle && activeItem && (
          <motion.div
            className={cn("absolute rounded-md -z-10 pointer-events-none", activeItem.bg)}
            animate={{
              left: pillStyle.left,
              top: pillStyle.top,
              width: pillStyle.width,
              height: pillStyle.height,
            }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}

        {/* Home / Logo */}
        <Link
          ref={el => { itemRefs.current['/'] = el; }}
          to="/"
          className="relative flex items-center justify-center shrink-0 px-2 my-0.5 min-[650px]:px-2 py-1.5 rounded-md transition-colors duration-200 w-[2.5rem] min-[650px]:w-[3rem]"
        >
          {branding.active_logo_id ? (
            <img
              src={`${API_URL}/api/branding/logo?t=${branding.updated_at || Date.now()}`}
              alt="Logo"
              className="h-6 w-full object-contain transition-transform hover:scale-105 dark:invert"
              onLoad={() => setLogoLoaded(true)}
            />
          ) : (
            <span className="text-xl font-aladin font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse whitespace-nowrap">
              P
            </span>
          )}
        </Link>

        {/* Nav Items */}
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <Link
              key={item.path}
              ref={el => { itemRefs.current[item.path] = el; }}
              to={item.path}
              className={cn(
                "relative flex items-center gap-1 min-[650px]:gap-1.5 px-3 min-[650px]:px-3 py-2 min-[650px]:py-1.5 my-0.5 rounded-md text-sm font-aladin transition-colors duration-200 shrink-0",
                isActive
                  ? item.activeClass
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <item.icon size={14} />
              <span className="hidden min-[650px]:inline text-base font-bold">
                {item.name}
              </span>
            </Link>
          );
        })}

        <div className="shrink-0 ml-1 pl-2 border-l border-gray-200 dark:border-gray-800">
          <ThemeToggle />
        </div>
      </nav>
    </motion.div>
  );
};

export default Navbar;