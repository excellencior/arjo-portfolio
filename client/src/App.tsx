import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
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

import { Linkedin, Facebook, Twitter, Github, Instagram, Youtube, Mail, Link as LinkIcon, ExternalLink, Camera, User } from 'lucide-react';

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
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] -right-[5%] w-[35%] h-[35%] bg-purple-400/10 blur-[100px] rounded-full" 
        />
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Profile Image Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="lg:col-span-5 flex justify-center lg:justify-end"
        >
          <div className="relative group">
            <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-[40px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl relative z-10">
              {content.updated_at ? (
                <img 
                  src={`${API_URL}/api/content/home/image?t=${content.updated_at}`} 
                  alt={content.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                  <User size={120} />
                </div>
              )}
            </div>
            {/* Decorative Frames */}
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[50px] -z-10 blur-xl group-hover:blur-2xl transition-all duration-700 opacity-60" />
            <div className="absolute top-8 -right-8 w-24 h-24 bg-blue-600/10 rounded-full blur-3xl" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="lg:col-span-7 text-center lg:text-left space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-aladin text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em]">
              The Sanctuary of
            </h2>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-aladin leading-tight text-slate-900 dark:text-white uppercase [text-shadow:0_4px_8px_rgba(0,0,0,0.1)] dark:[text-shadow:0_4px_12px_rgba(0,0,0,0.5)]">
              {content.title}
            </h1>
            <p className="text-xl md:text-2xl font-aladin text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              {content.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            {content.links?.map((link: any, idx: number) => (
              <a
                key={idx}
                href={link.to.startsWith('http') ? link.to : `https://${link.to}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 group"
              >
                <span className="text-slate-400 group-hover:text-blue-500 transition-colors duration-300">
                  {getSocialIcon(link.text)}
                </span>
                <span className="font-aladin text-lg text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors duration-300 capitalize">
                  {link.text === 'other' ? 'Link' : link.text}
                </span>
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-blue-400/50" />
              </a>
            ))}
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
