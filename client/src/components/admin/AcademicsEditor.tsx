import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save } from 'lucide-react';
import CustomModal from './CustomModal';

interface AcademicsEditorProps {
  content: any[];
  setContent: (content: any[]) => void;
  onSave: (content: any[]) => void;
}

const AcademicsEditor: React.FC<AcademicsEditorProps> = ({ content, setContent, onSave }) => {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState<number | null>(null);

  const handleAdd = () => {
    setEditingItem({ title: '', institution: '', start_year: new Date().getFullYear(), end_year: null, description: '' });
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any, index: number) => {
    setEditingItem({ ...item });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    const newContent = [...content];
    if (editingIndex !== null) {
      newContent[editingIndex] = editingItem;
    } else {
      newContent.push(editingItem);
    }
    setContent(newContent);
    onSave(newContent);
    setIsModalOpen(false);
  };

  const handleRemove = () => {
    if (indexToRemove === null) return;
    const newContent = content.filter((_, i) => i !== indexToRemove);
    setContent(newContent);
    onSave(newContent);
    setIsDeleteModalOpen(false);
    setIndexToRemove(null);
  };

  const confirmRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setIndexToRemove(index);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-emerald-100 dark:border-emerald-900 pb-2 uppercase tracking-wide">
        <h2 className="text-2xl font-aladin text-emerald-600">Academics</h2>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-md font-aladin text-base hover:bg-emerald-700 transition-all shadow-md"
        >
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <div className="space-y-3">
        {content && content.length > 0 ? (
          content.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => handleEdit(item, idx)}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md flex justify-between items-center group border border-transparent hover:border-emerald-500/20 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <div>
                <h3 className="font-aladin text-lg text-slate-900 dark:text-white uppercase leading-tight">{item.title || 'Untitled Entry'}</h3>
                <p className="text-[10px] font-aladin text-slate-400 uppercase tracking-wider">
                  {item.institution} {item.start_year && ` • ${item.start_year} - ${item.end_year || 'Present'}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  className="p-2 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Edit"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={(e) => confirmRemove(e, idx)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-400 font-aladin text-xl opacity-60">
            No academic entries yet. Document your learning journey!
          </div>
        )}
      </div>


      {/* Edit Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndex !== null ? 'Edit Academic Entry' : 'Add Academic Entry'}
        footer={
          <button 
            onClick={handleModalSave}
            className="px-4 py-1.5 bg-emerald-600 text-white rounded-md flex items-center justify-center gap-1.5 font-aladin text-base hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
          >
            <Save size={16} /> Confirm Entry
          </button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Degree / Title</label>
            <input 
              value={editingItem?.title || ''}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-emerald-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
              placeholder="e.g. Bachelor of Science"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Institution</label>
              <input 
                value={editingItem?.institution || ''}
                onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-emerald-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Start Year</label>
              <input 
                type="number"
                value={editingItem?.start_year || ''}
                onChange={(e) => setEditingItem({ ...editingItem, start_year: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-emerald-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
                placeholder="2019"
              />
            </div>
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">End Year (or blank for Present)</label>
              <input 
                type="number"
                value={editingItem?.end_year || ''}
                onChange={(e) => setEditingItem({ ...editingItem, end_year: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-emerald-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
                placeholder="2023"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Description</label>
            <textarea 
              value={editingItem?.description || ''}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-emerald-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400 h-32 resize-y"
            />
          </div>
        </div>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Removal"
        size="sm"
        footer={
          <>
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-aladin text-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button 
              onClick={handleRemove}
              className="px-4 py-1.5 bg-red-600 text-white rounded-md font-aladin text-lg hover:bg-red-700"
            >
              Remove
            </button>
          </>
        }
      >
        <p className="font-aladin text-xl text-slate-600 dark:text-slate-400">
          Are you sure you want to remove this academic entry? You will need to save changes to persist this removal.
        </p>
      </CustomModal>
    </div>
  );
};


export default AcademicsEditor;
