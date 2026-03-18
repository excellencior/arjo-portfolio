import React from 'react';
import { Save } from 'lucide-react';

interface HomeEditorProps {
  content: any;
  setContent: (content: any) => void;
  onSave: () => void;
}

const HomeEditor: React.FC<HomeEditorProps> = ({ content, setContent, onSave }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-aladin text-blue-600 border-b border-blue-100 dark:border-blue-900 pb-2">Edit Home Page</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-mono text-slate-500 mb-1 uppercase">Main Title</label>
          <input 
            value={content.title}
            onChange={(e) => setContent({...content, title: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-blue-500 outline-none font-aladin text-2xl"
          />
        </div>
        <div>
          <label className="block text-sm font-mono text-slate-500 mb-1 uppercase">Subtitle</label>
          <textarea 
            value={content.subtitle}
            onChange={(e) => setContent({...content, subtitle: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-blue-500 outline-none font-aladin text-xl h-24"
          />
        </div>
        <button 
          onClick={onSave}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-aladin text-xl hover:bg-blue-700 transition-all"
        >
          <Save size={20} /> Save Changes
        </button>
      </div>
    </div>
  );
};

export default HomeEditor;
