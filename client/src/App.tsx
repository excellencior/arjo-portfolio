import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { cn } from './lib/utils';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';
import Photography from './pages/Photography';
import Academics from './pages/Academics';
import Extra from './pages/Extra';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

const API_URL = import.meta.env.VITE_API_URL;

import { Linkedin, Facebook, Twitter, Github, Instagram, Youtube, Mail, Link as LinkIcon, Camera, User } from 'lucide-react';

const SOCIAL_ICONS: Record<string, any> = {
  linkedin: <Linkedin size={22} />,
  facebook: <Facebook size={22} />,
  instagram: <Instagram size={22} />,
  twitter: <Twitter size={22} />,
  github: <Github size={22} />,
  youtube: <Youtube size={22} />,
  pinterest: <Camera size={22} />,
  mail: <Mail size={22} />,
  other: <LinkIcon size={22} />,
};

const getSocialIcon = (platform: string) => {
  return SOCIAL_ICONS[platform.toLowerCase()] || <LinkIcon size={22} />;
};

const Home = () => {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/content/home`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setContent(data);
        }
      })
      .catch(err => console.error('Failed to fetch home content', err));
  }, []);

  if (!content) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="text-center font-aladin text-2xl animate-pulse opacity-50">Opening the Sanctuary...</div>
    </div>
  );

  return (
    <div className="flex-1 px-4 pb-20 relative">
      {/* Subtle Background Accents */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-[15%] -left-[10%] w-[45%] h-[45%] bg-blue-400/5 blur-[140px] rounded-full" />
        <div className="absolute top-[50%] -right-[8%] w-[30%] h-[30%] bg-indigo-400/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-5xl w-full mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        {/* Profile Image & Links — Sticky on desktop */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full lg:w-[400px] shrink-0 flex flex-col items-center lg:sticky lg:top-28 lg:self-start gap-8 pt-6 lg:pt-14"
        >
          <div className="relative group">
            {/* Outer ring accent */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-purple-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden ring-[3px] ring-white/80 dark:ring-slate-700/80 shadow-sm relative z-10">
              {content.updated_at ? (
                <img 
                  src={`${API_URL}/api/content/home/image?t=${content.updated_at}`} 
                  alt={content.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                  <User size={100} />
                </div>
              )}
            </div>
          </div>

          {content.links && content.links.length > 0 && (
            <div className={cn(
              "flex flex-wrap justify-center gap-3 px-4 lg:px-0 mx-auto",
              content.links.length === 4 ? "max-w-[360px]" : "max-w-[520px]"
            )}>
              {content.links.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.to.startsWith('http') ? link.to : `https://${link.to}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-5 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300 group min-w-[120px] justify-center"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 transition-colors duration-300">
                    {getSocialIcon(link.text)}
                  </span>
                  <span className="font-aladin text-base text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300 capitalize">
                    {link.text === 'other' ? 'Link' : link.text}
                  </span>
                </a>
              ))}
            </div>
          )}

          {content.quote && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-[320px] text-center lg:text-right"
            >
              <div className="font-aladin text-base md:text-lg text-slate-400 dark:text-slate-500 italic leading-relaxed">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {content.quote}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex-1 text-center lg:text-left space-y-6 lg:pt-16"
        >
          <div className="space-y-3">
            <p className="text-sm md:text-base font-aladin text-blue-600/70 dark:text-blue-400/70 uppercase tracking-[0.3em]">
              The Sanctuary of
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-aladin leading-tight text-slate-900 dark:text-white uppercase">
              {content.title}
            </h1>
            <div className="text-lg md:text-xl font-aladin text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {content.subtitle}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="photography" element={<Photography />} />
            <Route path="academics" element={<Academics />} />
            <Route path="extra" element={<Extra />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:id" element={<BlogPost />} />
            <Route path="contact" element={<Contact />} />
            <Route path="admin/:tab?" element={<Admin />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
