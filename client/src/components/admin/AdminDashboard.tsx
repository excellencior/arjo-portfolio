import { Home, FileText, Camera, GraduationCap, Sparkles, Search, LogOut, Globe, Palette } from 'lucide-react';
import HomeEditor from './HomeEditor';
import BlogEditor from './BlogEditor';
import AcademicsEditor from './AcademicsEditor';
import ExtraEditor from './ExtraEditor';
import BrandingEditor from './BrandingEditor';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDevMode } from '../../context/DevModeContext';

interface AdminDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  content: any;
  token: string | null;
  setContent: (content: any) => void;
  onSaveHome: () => void;
  onSaveAcademics: () => void;
  onSaveExtra: () => void;
  onFetchContent: (type: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  activeTab, setActiveTab, content, token, setContent, onSaveHome, onSaveAcademics, onSaveExtra, onFetchContent, onLogout 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { isDevMode } = useDevMode();
  
  // 10-minute Inactivity Logout
  useEffect(() => {
    if (!token || isDevMode) return;
    
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
  }, [token, onLogout, isDevMode]);

  const filteredContent = () => {
    if (!content || !searchQuery) return content;
    if (activeTab === 'home') return content; // Search not applicable for single object
    
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
    <div className="max-w-6xl mx-auto pt-10 px-4">
      {/* Search Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 min-h-[60px]">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Admin Logo" className="w-auto h-12" />
          <div className="flex flex-col">
            <p className="text-sm font-aladin text-slate-500 uppercase tracking-widest mt-1 opacity-80">Welcome back</p>
          </div>
        </div>
        {activeTab === 'blog' && (
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 outline-none focus:border-blue-500 transition-all font-aladin placeholder:font-aladin text-base"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <Link 
            to="/" 
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-gray-200 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all mb-4"
          >
            <Globe size={18} /> Go to main site
          </Link>
          <button 
            onClick={() => { onFetchContent('home'); setActiveTab('home'); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg transition-all ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <Home size={18} /> Home Page
          </button>
          <button 
            onClick={() => { onFetchContent('blog'); setActiveTab('blog'); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg transition-all ${activeTab === 'blog' ? 'bg-purple-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <FileText size={18} /> Blog Posts
          </button>
          <button 
            onClick={() => { onFetchContent('academics'); setActiveTab('academics'); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg transition-all ${activeTab === 'academics' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <GraduationCap size={18} /> Academics
          </button>
          <button 
            onClick={() => { onFetchContent('extra'); setActiveTab('extra'); setSearchQuery(''); }}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-aladin text-lg transition-all ${activeTab === 'extra' ? 'bg-orange-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <Sparkles size={18} /> Extra
          </button>
          <button 
            onClick={() => { setActiveTab('branding'); setSearchQuery(''); }}
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
          <div className="pt-6">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-aladin text-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-200 dark:border-red-900/50"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-xl relative">
          {activeTab === 'home' && content && (
            <HomeEditor content={content} setContent={setContent} onSave={onSaveHome} />
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
