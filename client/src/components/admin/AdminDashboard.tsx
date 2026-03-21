const API_URL = import.meta.env.VITE_API_URL;

import { motion, AnimatePresence } from 'framer-motion';
import { Home, FileText, Camera, GraduationCap, Sparkles, Search, LogOut, Globe, Palette } from 'lucide-react';
import HomeEditor from './HomeEditor';
import BlogEditor from './BlogEditor';
import AcademicsEditor from './AcademicsEditor';
import ExtraEditor from './ExtraEditor';
import BrandingEditor from './BrandingEditor';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBranding } from '../../context/BrandingContext';

interface AdminDashboardProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  content: any;
  token: string | null;
  setContent: (content: any) => void;
  onSaveHome: () => void;
  onSaveAcademics: (data?: any[]) => void;
  onSaveExtra: (data?: any[]) => void;
  onFetchContent: (type: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  activeTab, onTabChange, content, token, setContent, onSaveHome, onSaveAcademics, onSaveExtra, onFetchContent, onLogout 
}) => {
  const { branding } = useBranding();
  const [searchQuery, setSearchQuery] = useState('');
  const isDevModeAllowed = import.meta.env.VITE_DEV_MODE_ALLOWED === 'true';
  
  // 10-minute Inactivity Logout
  useEffect(() => {
    if (!token || isDevModeAllowed) return;
    
    let timer: any;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        onLogout();
      }, 10 * 60 * 1000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearTimeout(timer);
    };
  }, [token, onLogout, isDevModeAllowed]);

  const filteredContent = () => {
    if (!Array.isArray(content)) return [];
    if (!searchQuery.trim()) return content;
    
    return content.filter((item: any) => {
      const searchStr = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(searchStr) ||
        item.institution?.toLowerCase().includes(searchStr) ||
        item.description?.toLowerCase().includes(searchStr) ||
        item.role?.toLowerCase().includes(searchStr) ||
        item.excerpt?.toLowerCase().includes(searchStr)
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto w-full h-full flex flex-col p-6 overflow-hidden">
      {/* Search Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {branding.active_logo_id ? (
            <img 
              src={`${API_URL}/api/branding/logo?t=${branding.updated_at || Date.now()}`} 
              alt="Admin Logo" 
              className="w-auto h-12 dark:invert" 
            />
          ) : (
            <span className="text-3xl font-aladin font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
              P
            </span>
          )}
          <div className="flex flex-col">
            <p className="text-xs font-aladin text-slate-500 uppercase tracking-widest mt-0.5 opacity-80">Welcome back</p>
          </div>
        </div>
        {activeTab === 'blog' && (
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 rounded-md border border-gray-200 dark:border-gray-800 outline-none focus:border-blue-500 transition-all font-arial text-sm placeholder:font-arial placeholder:text-slate-400"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">
        {/* Sidebar - Fixed Height within the flex-1 row */}
        <div className="w-full md:w-64 space-y-1.5 shrink-0 overflow-hidden">
          <Link 
            to="/" 
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all mb-2"
          >
            <Globe size={18} /> Go to main site
          </Link>
          <button 
            onClick={() => onTabChange('home')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg transition-all ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <Home size={18} /> Home Page
          </button>
          <button 
            onClick={() => onTabChange('blog')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg transition-all ${activeTab === 'blog' ? 'bg-purple-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <FileText size={18} /> Blog Posts
          </button>
          <button 
            onClick={() => onTabChange('academics')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg transition-all ${activeTab === 'academics' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <GraduationCap size={18} /> Academics
          </button>
          <button 
            onClick={() => onTabChange('extra')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg transition-all ${activeTab === 'extra' ? 'bg-orange-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <Sparkles size={18} /> Extra
          </button>
          <button 
            onClick={() => onTabChange('branding')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg transition-all ${activeTab === 'branding' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <Palette size={18} /> Branding
          </button>
          <button 
            onClick={() => {/* Photography logic */}}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg bg-white dark:bg-slate-900 text-slate-400 border border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed"
          >
            <Camera size={18} /> Photography
          </button>
          <div className="pt-4">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-aladin text-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-200 dark:border-red-900/50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm relative overflow-y-auto flex flex-col custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && content && (
                <HomeEditor content={content} setContent={setContent} onSave={onSaveHome} token={token} />
              )}

              {activeTab === 'blog' && content && (
                <BlogEditor posts={filteredContent()} token={token} onRefresh={() => onFetchContent('blog')} onLogout={onLogout} />
              )}

              {activeTab === 'academics' && content && (
                <AcademicsEditor content={filteredContent()} setContent={setContent} onSave={onSaveAcademics} />
              )}

              {activeTab === 'extra' && content && (
                <ExtraEditor content={filteredContent()} setContent={setContent} onSave={onSaveExtra} />
              )}
              {activeTab === 'branding' && (
                <BrandingEditor token={token} onLogout={onLogout} />
              )}

              {searchQuery && filteredContent()?.length === 0 && (
                <div className="text-center py-20 opacity-50">
                  <Search size={48} className="mx-auto mb-4" />
                  <p className="font-aladin text-2xl">No items match your search.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
