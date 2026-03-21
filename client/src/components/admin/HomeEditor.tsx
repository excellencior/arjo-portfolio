import React, { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import CustomModal from './CustomModal';

interface HomeEditorProps {
  content: any;
  setContent: (content: any) => void;
  onSave: () => void;
}

const HomeEditor: React.FC<HomeEditorProps> = ({ content, setContent, onSave }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState<number | null>(null);

  const confirmRemove = (index: number) => {
    setIndexToRemove(index);
    setIsDeleteModalOpen(true);
  };

  const handleRemove = () => {
    if (indexToRemove === null) return;
    const newLinks = content.links.filter((_: any, i: number) => i !== indexToRemove);
    setContent({...content, links: newLinks});
    setIsDeleteModalOpen(false);
    setIndexToRemove(null);
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-aladin text-blue-600 border-b border-blue-100 dark:border-blue-900 pb-2 uppercase tracking-wide">Edit Home Page</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-aladin text-slate-500 mb-1 uppercase tracking-wider">Main Title</label>
          <input 
            value={content.title}
            onChange={(e) => setContent({...content, title: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-blue-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-aladin text-slate-500 mb-1 uppercase tracking-wider">Subtitle</label>
          <textarea 
            value={content.subtitle}
            onChange={(e) => setContent({...content, subtitle: e.target.value})}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-blue-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400 h-24 resize-y"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-aladin text-slate-500 uppercase tracking-wider">Quick Links</label>
            <button 
              onClick={() => setContent({...content, links: [...(content.links || []), { text: '', to: '' }]})}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-all font-aladin uppercase tracking-wider"
            >
              + Add Link
            </button>
          </div>
          <div className="space-y-3">
            {content.links?.map((link: any, idx: number) => (
              <div key={idx} className="flex gap-2 items-center group">
                <input 
                  value={link.text}
                  placeholder="Platform (e.g. LinkedIn)"
                  onChange={(e) => {
                    const newLinks = [...content.links];
                    newLinks[idx].text = e.target.value;
                    setContent({...content, links: newLinks});
                  }}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-blue-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
                />
                <input 
                  value={link.to}
                  placeholder="Profile URL (e.g. linkedin.com/in/pujan)"
                  onChange={(e) => {
                    const newLinks = [...content.links];
                    newLinks[idx].to = e.target.value;
                    setContent({...content, links: newLinks});
                  }}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-blue-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
                />
                <button 
                  onClick={() => confirmRemove(idx)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        {(content.title || content.subtitle) && (
          <button 
            onClick={onSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-md font-aladin text-base hover:bg-blue-700 transition-all shadow-md"
          >
            <Save size={16} /> Save Changes
          </button>
        )}
      </div>
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
          Are you sure you want to remove this quick link? You will need to save changes to persist this removal.
        </p>
      </CustomModal>
    </div>
  );
};

export default HomeEditor;
