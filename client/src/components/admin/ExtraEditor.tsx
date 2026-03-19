import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import CustomModal from './CustomModal';

interface ExtraEditorProps {
  content: any[];
  setContent: (content: any[]) => void;
  onSave: () => void;
}

const ExtraEditor: React.FC<ExtraEditorProps> = ({ content, setContent, onSave }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState<number | null>(null);

  const handleAdd = () => {
    setContent([...content, { title: '', role: '', description: '' }]);
  };

  const handleRemove = () => {
    if (indexToRemove === null) return;
    setContent(content.filter((_, i) => i !== indexToRemove));
    setIsDeleteModalOpen(false);
    setIndexToRemove(null);
  };

  const confirmRemove = (index: number) => {
    setIndexToRemove(index);
    setIsDeleteModalOpen(true);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newContent = [...content];
    newContent[index] = { ...newContent[index], [field]: value };
    setContent(newContent);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-orange-100 dark:border-orange-900 pb-2 uppercase tracking-wide">
        <h2 className="text-2xl font-aladin text-orange-600">Edit Extracurriculars</h2>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg font-aladin text-lg hover:bg-orange-700 transition-all shadow-md"
        >
          <Plus size={18} /> Add Entry
        </button>
      </div>

      <div className="space-y-6">
        {content && Array.isArray(content) && content.map((item, idx) => (
          <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-gray-700 relative group">
            <button 
              onClick={() => confirmRemove(idx)}
              className="absolute top-2 right-2 p-1.5 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Title</label>
                  <input 
                    value={item.title}
                    onChange={(e) => handleChange(idx, 'title', e.target.value)}
                    className="w-full px-4 py-1.5 bg-white dark:bg-slate-900 rounded-lg outline-none font-arial text-lg placeholder:font-arial"
                  />
                </div>
                <div>
                  <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Role</label>
                  <input 
                    value={item.role}
                    onChange={(e) => handleChange(idx, 'role', e.target.value)}
                    className="w-full px-4 py-1.5 bg-white dark:bg-slate-900 rounded-lg outline-none font-arial text-lg placeholder:font-arial"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Description</label>
                <textarea 
                  value={item.description}
                  onChange={(e) => handleChange(idx, 'description', e.target.value)}
                  className="w-full px-4 py-1.5 bg-white dark:bg-slate-900 rounded-lg outline-none font-arial text-base h-20 placeholder:font-arial"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onSave}
        className="flex items-center gap-2 px-5 py-1.5 bg-orange-600 text-white rounded-lg font-aladin text-base hover:bg-orange-700 transition-all shadow-md"
      >
        <Save size={20} /> Save Extracurriculars
      </button>
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Removal"
        size="sm"
        footer={
          <>
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-aladin text-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button 
              onClick={handleRemove}
              className="px-4 py-1.5 bg-red-600 text-white rounded-lg font-aladin text-lg hover:bg-red-700 shadow-md"
            >
              Remove
            </button>
          </>
        }
      >
        <p className="font-aladin text-xl text-slate-600 dark:text-slate-400">
          Are you sure you want to remove this entry? You will need to save changes to persist this removal.
        </p>
      </CustomModal>
    </div>
  );
};

export default ExtraEditor;
