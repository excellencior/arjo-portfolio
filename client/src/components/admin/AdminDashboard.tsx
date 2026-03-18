import { Home, FileText, Camera, GraduationCap, Sparkles } from 'lucide-react';
import HomeEditor from './HomeEditor';
import BlogEditor from './BlogEditor';
import AcademicsEditor from './AcademicsEditor';
import ExtraEditor from './ExtraEditor';

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
  return (
    <div className="max-w-6xl mx-auto pt-10 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => { onFetchContent('home'); setActiveTab('home'); }}
            className={`w-full flex items-center gap-3 px-6 py-3 rounded-xl font-aladin text-xl transition-all ${activeTab === 'home' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <Home size={20} /> Home Page
          </button>
          <button 
            onClick={() => { onFetchContent('blog'); setActiveTab('blog'); }}
            className={`w-full flex items-center gap-3 px-6 py-3 rounded-xl font-aladin text-xl transition-all ${activeTab === 'blog' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <FileText size={20} /> Blog Posts
          </button>
          <button 
            onClick={() => { onFetchContent('academics'); setActiveTab('academics'); }}
            className={`w-full flex items-center gap-3 px-6 py-3 rounded-xl font-aladin text-xl transition-all ${activeTab === 'academics' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <GraduationCap size={20} /> Academics
          </button>
          <button 
            onClick={() => { onFetchContent('extra'); setActiveTab('extra'); }}
            className={`w-full flex items-center gap-3 px-6 py-3 rounded-xl font-aladin text-xl transition-all ${activeTab === 'extra' ? 'bg-orange-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-gray-100 dark:border-gray-800'}`}
          >
            <Sparkles size={20} /> Extra
          </button>
          <button 
            onClick={() => {/* Photography logic */}}
            className="w-full flex items-center gap-3 px-6 py-3 rounded-xl font-aladin text-xl bg-white dark:bg-slate-900 text-slate-400 border border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed"
          >
            <Camera size={20} /> Photography
          </button>
          <div className="pt-10">
            <button 
              onClick={onLogout}
              className="w-full py-2 text-red-500 font-mono text-sm hover:underline"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-xl">
          {activeTab === 'home' && content && (
            <HomeEditor content={content} setContent={setContent} onSave={onSaveHome} />
          )}

          {activeTab === 'blog' && content && (
            <BlogEditor posts={content} token={token} onRefresh={() => onFetchContent('blog')} />
          )}

          {activeTab === 'academics' && content && (
            <AcademicsEditor content={content} setContent={setContent} onSave={onSaveAcademics} />
          )}

          {activeTab === 'extra' && content && (
            <ExtraEditor content={content} setContent={setContent} onSave={onSaveExtra} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
