import { motion } from 'framer-motion';
import { useBranding } from './context/BrandingContext';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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

import { Linkedin, Facebook, Twitter, Github, Instagram, Youtube, Mail, Link as LinkIcon, ExternalLink } from 'lucide-react';

const getSocialIcon = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('linkedin')) return <Linkedin size={20} />;
  if (lower.includes('facebook')) return <Facebook size={20} />;
  if (lower.includes('twitter') || lower.includes(' x ')) return <Twitter size={20} />;
  if (lower.includes('github')) return <Github size={20} />;
  if (lower.includes('instagram')) return <Instagram size={20} />;
  if (lower.includes('youtube')) return <Youtube size={20} />;
  if (lower.includes('mail') || lower.includes('email')) return <Mail size={20} />;
  return <LinkIcon size={20} />;
};

const Home = () => {
  const { branding } = useBranding();
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
      <div className="text-center font-aladin text-2xl animate-pulse opacity-50">Unveiling the Sanctuary...</div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-3xl space-y-8"
      >
        {/* Branding/Initial */}
        <div className="flex justify-center mb-4">
          {branding.active_logo_id ? (
            <img 
              src={`${API_URL}/api/branding/logo?t=${branding.updated_at || Date.now()}`} 
              alt="Logo" 
              className="h-16 w-auto object-contain dark:invert transition-transform hover:scale-110 duration-500"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <span className="text-4xl font-aladin font-bold text-white uppercase text-center ml-1">P</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-aladin bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent uppercase tracking-tight leading-none px-2">
            {content.title}
          </h1>
          <p className="text-xl md:text-2xl font-aladin text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed opacity-90">
            {content.subtitle}
          </p>
        </div>
        
        <div className="pt-8 flex flex-wrap justify-center items-center gap-4 md:gap-6">
          {content.links?.map((link: any, idx: number) => {
            const isInternal = link.to.startsWith('/');
            const url = isInternal ? link.to : (link.to.startsWith('http') ? link.to : `https://${link.to}`);
            
            const LinkComponent = isInternal ? Link : motion.a;
            const extraProps = isInternal ? { to: url } : { href: url, target: "_blank", rel: "noopener noreferrer" };

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (idx * 0.1), duration: 0.5 }}
              >
                {/* @ts-ignore - Dynamic component assignment with different prop types */}
                <LinkComponent
                  {...extraProps}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="group flex items-center gap-2.5 px-5 py-2.5 bg-white dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 pointer-events-auto"
                >
                  <span className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {getSocialIcon(link.text)}
                  </span>
                  <span className="font-aladin text-lg text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {link.text}
                  </span>
                  {!isInternal && <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-400" />}
                </LinkComponent>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
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
