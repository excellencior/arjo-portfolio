import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, GripVertical, Loader2 } from 'lucide-react';
import CustomModal from './CustomModal';

interface AcademicsEditorProps {
  content: any[];
  setContent: (content: any[]) => void;
  onSave: (content: any[]) => Promise<any>;
  token: string | null;
  onRefreshDrafts: () => void;
  draftKeys: string[];
  isSaving?: boolean;
}

const AcademicsEditor: React.FC<AcademicsEditorProps> = ({ content, setContent, onSave, token, onRefreshDrafts, draftKeys, isSaving = false }) => {
  const [editingItem, setEditingItem] = useState<any>(null);
  const [originalItem, setOriginalItem] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState<number | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getDraftKey = (item: any) => `draft_academics_${item?.id || 'new'}`;
  const API_URL = import.meta.env.VITE_API_URL;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newContent = [...content];
    const [draggedItem] = newContent.splice(draggedIndex, 1);
    newContent.splice(targetIndex, 0, draggedItem);

    setContent(newContent);
    onSave(newContent);
    setDraggedIndex(null);
  };

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
          setDraftSaved(true);
          setTimeout(() => setDraftSaved(false), 2000);
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
    const newItem = { title: '', institution: '', start_year: new Date().getFullYear(), end_year: null, description: '' };
    setEditingItem(newItem);
    setOriginalItem(newItem);
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any, index: number) => {
    setEditingItem({ ...item });
    setOriginalItem({ ...item });
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const handleModalSave = async () => {
    const newContent = [...content];
    if (editingIndex !== null) {
      newContent[editingIndex] = editingItem;
    } else {
      newContent.push(editingItem);
    }
    setContent(newContent);
    const success = await onSave(newContent);
    if (success) {
      setIsModalOpen(false);
    }
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
      <div className="flex justify-between items-center border-b border-emerald-100 dark:border-emerald-900 pb-2 mb-4 uppercase tracking-wide shrink-0">
        <h2 className="text-2xl font-aladin text-emerald-600">Academics</h2>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-md font-aladin text-base hover:bg-emerald-700 transition-all shadow-md"
        >
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {content && content.length > 1 && (
        <p className="text-xs font-aladin text-slate-400 dark:text-slate-500 mb-3 italic shrink-0">
          💡 Tip: You can drag and drop cards to reorder your academic timeline.
        </p>
      )}

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
        <div className="space-y-3">
        {content && content.length > 0 ? (
          content.map((item, idx) => {
            const isDraggingThis = draggedIndex === idx;
            return (
              <div 
                key={idx} 
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => handleEdit(item, idx)}
                className={`p-3 rounded-md flex justify-between items-center group border border-transparent hover:border-emerald-500/20 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing ${
                  hasDraft(item) ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-slate-50 dark:bg-slate-800'
                } ${isDraggingThis ? 'opacity-40 scale-[0.98] border-dashed border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors shrink-0">
                    <GripVertical size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-aladin text-lg text-slate-900 dark:text-white uppercase leading-tight truncate">{item.title || 'Untitled Entry'}</h3>
                      {hasDraft(item) && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[8px] font-bold rounded uppercase tracking-tighter shrink-0">Draft</span>
                      )}
                    </div>
                    <p className="text-[10px] font-aladin text-slate-400 uppercase tracking-wider truncate">
                      {item.institution} {item.start_year && ` • ${item.start_year} - ${item.end_year || 'Present'}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
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
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-400 font-aladin text-xl opacity-60">
            No academic entries yet. Document your learning journey!
          </div>
        )}
        </div>
      </div>

      {/* Edit Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIndex !== null ? 'Edit Academic Entry' : 'Add Academic Entry'}
        footer={
          <div className="flex justify-between w-full">
            <button 
              onClick={handleSaveDraft}
              disabled={draftSaved || (editingItem && originalItem && JSON.stringify(editingItem) === JSON.stringify(originalItem))}
              className={`px-4 py-1.5 rounded-md font-aladin text-base transition-all border ${
                draftSaved 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700' 
                  : (editingItem && originalItem && JSON.stringify(editingItem) === JSON.stringify(originalItem))
                  ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 opacity-60 cursor-not-allowed border-transparent'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {draftSaved ? 'Draft Saved ✓' : 'Save Draft'}
            </button>
             <button 
              onClick={handleModalSave}
              disabled={isSaving || (editingItem && originalItem && JSON.stringify(editingItem) === JSON.stringify(originalItem))}
              className={`px-4 py-1.5 rounded-md flex items-center justify-center gap-1.5 font-aladin text-base transition-all shadow-md active:scale-[0.98] ${
                isSaving || (editingItem && originalItem && JSON.stringify(editingItem) === JSON.stringify(originalItem))
                  ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 opacity-60 cursor-not-allowed border border-transparent'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Confirm Entry
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Degree / Title</label>
            <input 
              value={editingItem?.title || ''}
              onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
              placeholder="e.g. Bachelor of Science"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Institution</label>
              <input 
                value={editingItem?.institution || ''}
                onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Start Year</label>
              <input 
                type="number"
                value={editingItem?.start_year || ''}
                onChange={(e) => setEditingItem({ ...editingItem, start_year: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
                placeholder="2019"
              />
            </div>
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">End Year (or blank for Present)</label>
              <input 
                type="number"
                value={editingItem?.end_year || ''}
                onChange={(e) => setEditingItem({ ...editingItem, end_year: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
                placeholder="2023"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Description</label>
            <textarea 
              value={editingItem?.description || ''}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-slate-200 dark:border-slate-700 focus:border-emerald-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400 h-32 resize-y"
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
        variant="danger"
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
