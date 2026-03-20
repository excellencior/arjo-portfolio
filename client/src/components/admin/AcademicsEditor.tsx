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
    setEditingItem({ title: '', institution: '', duration: '', description: '', category: '' });
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
          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-aladin text-lg hover:bg-emerald-700 transition-all shadow-md"
        >
          <Plus size={18} /> Add Entry
        </button>
      </div>

      <div className="space-y-3">
        {content && content.length > 0 ? (
          content.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => handleEdit(item, idx)}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center group border border-transparent hover:border-emerald-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer shadow-sm"
            >
              <div>
                <h3 className="font-aladin text-lg text-slate-900 dark:text-white uppercase leading-tight">{item.title || 'Untitled Entry'}</h3>
                <p className="text-[10px] font-aladin text-slate-400 uppercase tracking-wider">
                  {item.institution} {item.duration && ` • ${item.duration}`}
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
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Degree / Title</label>
            <input 
              value={editingItem?.title || ''}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-arial text-lg border border-transparent focus:border-emerald-500 placeholder:font-arial"
              placeholder="e.g. Bachelor of Science"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Institution</label>
              <input 
                value={editingItem?.institution || ''}
                onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-arial text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Duration</label>
              <input 
                value={editingItem?.duration || ''}
                onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-arial text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Category</label>
            <input 
              value={editingItem?.category || ''}
              onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-arial text-sm"
              placeholder="e.g. University, High School"
            />
          </div>
          <div>
            <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Description</label>
            <textarea 
              value={editingItem?.description || ''}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-arial text-sm h-32"
            />
          </div>
          <button 
            onClick={handleModalSave}
            className="w-full py-2 bg-emerald-600 text-white rounded-lg flex items-center justify-center gap-2 font-aladin text-lg hover:bg-emerald-700 transition-all shadow-lg mt-2"
          >
            <Save size={18} /> Confirm Entry
          </button>
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
          Are you sure you want to remove this academic entry? You will need to save changes to persist this removal.
        </p>
      </CustomModal>
    </div>
  );
};


export default AcademicsEditor;
