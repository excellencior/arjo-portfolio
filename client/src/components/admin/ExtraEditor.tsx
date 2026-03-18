import React from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

interface ExtraEditorProps {
  content: any[];
  setContent: (content: any[]) => void;
  onSave: () => void;
}

const ExtraEditor: React.FC<ExtraEditorProps> = ({ content, setContent, onSave }) => {
  const handleAdd = () => {
    setContent([...content, { title: '', role: '', description: '' }]);
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
      <div className="flex justify-between items-center border-b border-orange-100 dark:border-orange-900 pb-2">
        <h2 className="text-4xl font-aladin text-orange-600">Edit Extracurriculars</h2>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-aladin hover:bg-orange-700 transition-all"
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
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Title</label>
                  <input 
                    value={item.title}
                    onChange={(e) => handleChange(idx, 'title', e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl outline-none font-aladin text-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Role</label>
                  <input 
                    value={item.role}
                    onChange={(e) => handleChange(idx, 'role', e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl outline-none font-aladin text-xl"
                  />
                </div>
              </div>
              <div>
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
        className="flex items-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-xl font-aladin text-xl hover:bg-orange-700 transition-all"
      >
        <Save size={20} /> Save Extracurriculars
      </button>
    </div>
  );
};

export default ExtraEditor;
