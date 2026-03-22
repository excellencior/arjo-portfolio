import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save } from 'lucide-react';
import CustomModal from './CustomModal';

interface ExtraEditorProps {
  content: any[];
  setContent: (content: any[]) => void;
  onSave: (content: any[]) => void;
  token: string | null;
  onRefreshDrafts: () => void;
  draftKeys: string[];
}

const ExtraEditor: React.FC<ExtraEditorProps> = ({ content, setContent, onSave, token, onRefreshDrafts, draftKeys }) => {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState<number | null>(null);

  const getDraftKey = (item: any) => `draft_extra_${item?.id || 'new'}`;
  const API_URL = import.meta.env.VITE_API_URL;

  // Persistence: Restore draft when modal opens
  React.useEffect(() => {
    const fetchDraft = async () => {
      if (isModalOpen && editingItem) {
        try {
          const res = await fetch(`${API_URL}/api/drafts/${getDraftKey(editingItem)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const draft = await res.json();
            if (draft && JSON.stringify(draft.content) !== JSON.stringify(editingItem)) {
              setEditingItem(draft.content);
            }
          }
        } catch (e) {
          console.error('Failed to fetch draft');
        }
      }
    };
    fetchDraft();
  }, [isModalOpen, token]);

  const handleSaveDraft = async () => {
    if (editingItem) {
      try {
        const res = await fetch(`${API_URL}/api/drafts`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ key: getDraftKey(editingItem), content: editingItem })
        });
        if (res.ok) {
          onRefreshDrafts();
          setIsModalOpen(false);
        }
      } catch (err) {
        console.error('Failed to save draft');
      }
    }
  };

  const hasDraft = (item: any) => {
    return draftKeys.includes(getDraftKey(item));
  };

  const handleAdd = () => {
    setEditingItem({ title: '', role: '', description: '' });
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
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center border-b border-orange-100 dark:border-orange-900 pb-2 mb-4 uppercase tracking-wide shrink-0">
        <h2 className="text-2xl font-aladin text-orange-600">Extracurriculars</h2>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1 bg-orange-600 text-white rounded-md font-aladin text-base hover:bg-orange-700 transition-all shadow-md"
        >
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
        <div className="space-y-3">
        {content && content.length > 0 ? (
          content.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => handleEdit(item, idx)}
              className={`p-3 rounded-md flex justify-between items-center group border border-transparent hover:border-orange-500/20 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer ${
                hasDraft(item) ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-slate-50 dark:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-aladin text-lg text-slate-900 dark:text-white uppercase leading-tight">{item.title || 'Untitled Entry'}</h3>
                  {hasDraft(item) && (
                    <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[8px] font-bold rounded uppercase tracking-tighter">Draft</span>
                  )}
                </div>
                <p className="text-[10px] font-aladin text-slate-400 uppercase tracking-wider">
                  {item.role || 'No Role Specified'}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  className="p-2 text-orange-500 opacity-0 group-hover:opacity-100 transition-all"
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
            No extracurriculars recorded yet. Share your passions!
          </div>
        )}
        </div>
      </div>

      {/* Edit Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndex !== null ? 'Edit Entry' : 'Add Entry'}
        footer={
          <div className="flex justify-between w-full">
            <button 
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-aladin text-base hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700"
            >
              Save Draft
            </button>
            <button 
              onClick={handleModalSave}
              className="px-4 py-1.5 bg-orange-600 text-white rounded-md flex items-center justify-center gap-1.5 font-aladin text-base hover:bg-orange-700 transition-all shadow-md disabled:opacity-50"
            >
              <Save size={16} /> Confirm Entry
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Title</label>
            <input 
              value={editingItem?.title || ''}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-orange-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
              placeholder="e.g. Photography Club"
            />
          </div>
          <div>
            <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Role</label>
            <input 
              value={editingItem?.role || ''}
              onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-orange-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
              placeholder="e.g. Lead Photographer"
            />
          </div>
          <div>
            <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Description</label>
            <textarea 
              value={editingItem?.description || ''}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-orange-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400 h-32 resize-y"
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
          Are you sure you want to remove this entry? You will need to save changes to persist this removal.
        </p>
      </CustomModal>
    </div>
  );
};


export default ExtraEditor;
