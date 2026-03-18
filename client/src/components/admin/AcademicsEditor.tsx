import React from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

interface AcademicsEditorProps {
  content: any[];
  setContent: (content: any[]) => void;
  onSave: () => void;
}

const AcademicsEditor: React.FC<AcademicsEditorProps> = ({ content, setContent, onSave }) => {
  const handleAdd = () => {
    setContent([...content, { title: '', institution: '', duration: '', description: '', category: '' }]);
  };

  const handleRemove = (index: number) => {
    setContent(content.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], [field]: value };
    setContent(newContent);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-emerald-100 dark:border-emerald-900 pb-2">
        <h2 className="text-4xl font-aladin text-emerald-600">Edit Academics</h2>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-aladin hover:bg-emerald-700 transition-all"
        >
          <Plus size={18} /> Add Entry
        </button>
      </div>

      <div className="space-y-6">
        {content && Array.isArray(content) && content.map((item, idx) => (
          <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 relative group">
            <button 
              onClick={() => handleRemove(idx)}
              className="absolute top-4 right-4 p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all"
            >
              <Trash2 size={20} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Degree / Title</label>
                <input 
                  value={item.title}
                  onChange={(e) => handleChange(idx, 'title', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl outline-none font-aladin text-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Institution</label>
                <input 
                  value={item.institution}
                  onChange={(e) => handleChange(idx, 'institution', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl outline-none font-aladin text-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Duration</label>
                <input 
                  value={item.duration}
                  onChange={(e) => handleChange(idx, 'duration', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl outline-none font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Stage / Category (e.g. University, School)</label>
                <input 
                  value={item.category || ''}
                  onChange={(e) => handleChange(idx, 'category', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl outline-none font-mono text-sm border-2 border-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Description</label>
                <textarea 
                  value={item.description}
                  onChange={(e) => handleChange(idx, 'description', e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl outline-none font-aladin text-lg h-24"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onSave}
        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-aladin text-xl hover:bg-emerald-700 transition-all"
      >
        <Save size={20} /> Save Academics
      </button>
    </div>
  );
};

export default AcademicsEditor;
