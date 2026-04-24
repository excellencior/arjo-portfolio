import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Upload, Trash2, Edit2, ChevronUp, ChevronDown, Check, Loader2, Image as ImageIcon, Eye, EyeOff, CheckSquare, Square, X } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import CustomModal from './CustomModal';

interface Photo {
  id: number;
  title: string;
  intent: string;
  category: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  width: number;
  height: number;
  sort_order: number;
  visible: boolean;
}

interface PhotographyEditorProps {
  token: string | null;
  onLogout?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const PhotographyEditor: React.FC<PhotographyEditorProps> = ({ token, onLogout }) => {
  const { showAlert, showConfirm } = useAlert();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Selection states
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Visibility toggle loading
  const [togglingId, setTogglingId] = useState<number | null>(null);
  
  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<Partial<Photo>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/photography/admin/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 && onLogout) {
        onLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPhotos(data);
      }
    } catch (err) {
      console.error('Failed to fetch photos', err);
    } finally {
      setLoading(false);
    }
  }, [token, onLogout]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      showAlert('Error', 'Only image files are allowed.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showAlert('Error', 'Image must be smaller than 10MB.', 'error');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploadModalOpen(true);
    setCurrentPhoto({
      title: file.name.split('.')[0],
      category: 'Landscape',
      intent: ''
    });
  }, [showAlert]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleUpload = async () => {
    if (!selectedFile || !token) return;
    setUploading(true);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      
      try {
        const res = await fetch(`${API_URL}/api/photography/upload`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({
            image: base64Image,
            title: currentPhoto.title || '',
            intent: currentPhoto.intent || '',
            category: currentPhoto.category || '',
            sort_order: (photos.length > 0 ? Math.max(...photos.map(p => p.sort_order)) + 1 : 0)
          })
        });

        if (res.status === 401 && onLogout) {
          onLogout();
          return;
        }

        if (res.ok) {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);
          await fetchPhotos();
          showAlert('Success', 'Photo uploaded successfully.', 'success');
        } else {
          let errorMessage = 'Upload failed.';
          try {
            const data = await res.json();
            errorMessage = data.error || errorMessage;
          } catch (e) {
            errorMessage = `Server Error (${res.status}): ${res.statusText}`;
          }
          showAlert('Error', errorMessage, 'error');
        }
      } catch (err) {
        showAlert('Error', `Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpdate = async () => {
    if (!currentPhoto.id || !token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/photography/${currentPhoto.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: currentPhoto.title,
          intent: currentPhoto.intent,
          category: currentPhoto.category
        })
      });

      if (res.status === 401 && onLogout) {
        onLogout();
        return;
      }

      if (res.ok) {
        setIsEditModalOpen(false);
        await fetchPhotos();
        showAlert('Success', 'Photo metadata updated.', 'success');
      } else {
        showAlert('Error', 'Update failed.', 'error');
      }
    } catch (err) {
      showAlert('Error', 'Connection failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    showConfirm('Delete Photo', 'Are you sure? This will remove it from both the site and Cloudinary.', async () => {
      try {
        const res = await fetch(`${API_URL}/api/photography/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 && onLogout) {
          onLogout();
          return;
        }

        if (res.ok) {
          await fetchPhotos();
          showAlert('Success', 'Photo deleted.', 'success');
        } else {
          showAlert('Error', 'Delete failed.', 'error');
        }
      } catch (err) {
        showAlert('Error', 'Connection failed.', 'error');
      }
    });
  };

  // Toggle visibility
  const handleToggleVisibility = async (photo: Photo) => {
    setTogglingId(photo.id);
    try {
      const res = await fetch(`${API_URL}/api/photography/visibility/${photo.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ visible: !photo.visible })
      });
      if (res.ok) {
        // Optimistic UI update
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, visible: !p.visible } : p));
        showAlert('Updated', `Photo is now ${!photo.visible ? 'visible' : 'hidden'} on the site.`, 'success');
      } else {
        showAlert('Error', 'Failed to update visibility.', 'error');
      }
    } catch {
      showAlert('Error', 'Connection failed.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    showConfirm(
      `Delete ${selectedIds.size} Photo${selectedIds.size > 1 ? 's' : ''}`,
      `This will permanently remove ${selectedIds.size} photo${selectedIds.size > 1 ? 's' : ''} from the site and Cloudinary. This action cannot be undone.`,
      async () => {
        try {
          const res = await fetch(`${API_URL}/api/photography/bulk-delete`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ ids: Array.from(selectedIds) })
          });
          if (res.ok) {
            const data = await res.json();
            setSelectedIds(new Set());
            setSelectMode(false);
            await fetchPhotos();
            showAlert('Deleted', `${data.deleted} photo${data.deleted > 1 ? 's' : ''} removed.`, 'success');
          } else {
            showAlert('Error', 'Bulk delete failed.', 'error');
          }
        } catch {
          showAlert('Error', 'Connection failed.', 'error');
        }
      }
    );
  };

  // Selection helpers
  const toggleSelection = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map(p => p.id)));
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!token) return;
    const newPhotos = [...photos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newPhotos.length) return;

    [newPhotos[index], newPhotos[targetIndex]] = [newPhotos[targetIndex], newPhotos[index]];
    
    const updatedItems = newPhotos.map((p: Photo, idx: number) => ({ id: p.id, sort_order: idx }));
    setPhotos(newPhotos.map((p: Photo, idx: number) => ({ ...p, sort_order: idx })));

    try {
      const res = await fetch(`${API_URL}/api/photography/reorder/bulk`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ items: updatedItems })
      });
      if (!res.ok) showAlert('Warning', 'Reordering failed on server.', 'error');
    } catch (err) {
      console.error('Reorder error', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  const hiddenCount = photos.filter(p => !p.visible).length;

  return (
    <div 
      className={`space-y-8 animate-in transition-all duration-500 flex flex-col h-full overflow-hidden relative ${isDragging ? 'ring-2 ring-cyan-500 ring-inset rounded-xl' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[2px] z-50 rounded-xl flex flex-col items-center justify-center pointer-events-none">
          <Upload size={48} className="text-cyan-500 mb-3 animate-bounce" />
          <p className="font-aladin text-2xl text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Drop your photo here</p>
          <p className="font-aladin text-sm text-slate-500 mt-1">Supported: JPG, PNG, WebP (max 10MB)</p>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 rounded-lg">
              <Camera size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-aladin text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                Photography <span className="text-cyan-600">Gallery</span>
              </h2>
              <p className="text-slate-500 font-aladin text-sm mt-1">
                {photos.length} photo{photos.length !== 1 ? 's' : ''}
                {hiddenCount > 0 && <span className="text-amber-500 ml-1">({hiddenCount} hidden)</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {photos.length > 0 && (
              <button
                onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-aladin text-sm transition-all ${
                  selectMode 
                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 border border-rose-200 dark:border-rose-800' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {selectMode ? <><X size={16} /> Cancel</> : <><CheckSquare size={16} /> Select</>}
              </button>
            )}
            <label className="cursor-pointer group">
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg font-aladin hover:bg-cyan-700 transition-all shadow-sm">
                <Upload size={18} />
                <span>Upload</span>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        {/* Selection toolbar */}
        {selectMode && (
          <div className="mt-3 flex items-center gap-3 px-3 py-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-lg animate-slide-in">
            <button 
              onClick={selectAll}
              className="flex items-center gap-1.5 text-sm font-aladin text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors"
            >
              {selectedIds.size === photos.length ? <CheckSquare size={16} /> : <Square size={16} />}
              {selectedIds.size === photos.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-sm font-aladin text-slate-500">
              {selectedIds.size} selected
            </span>
            <div className="flex-1" />
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-md font-aladin text-sm hover:bg-rose-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <Trash2 size={14} /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
        {photos.length === 0 ? (
          <label className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer hover:border-cyan-400 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-all">
            <Upload className="text-slate-300 dark:text-slate-700 mb-4" size={48} strokeWidth={1} />
            <p className="font-aladin text-xl text-slate-400">Drop photos here or click to upload</p>
            <p className="font-aladin text-sm text-slate-400 opacity-60 mt-1">JPG, PNG, WebP • Max 10MB</p>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo: Photo, index: number) => {
              const isSelected = selectedIds.has(photo.id);
              return (
                <div 
                  key={photo.id}
                  className={`group relative bg-white dark:bg-slate-800 border rounded-xl overflow-hidden transition-all ${
                    isSelected
                      ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-lg'
                      : !photo.visible
                      ? 'border-amber-300 dark:border-amber-700/50 opacity-70'
                      : 'border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 hover:shadow-lg'
                  }`}
                  onClick={selectMode ? () => toggleSelection(photo.id) : undefined}
                >
                  {/* Image Preview */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img 
                      src={photo.cloudinary_url} 
                      alt={photo.title} 
                      className={`w-full h-full object-cover transition-all duration-500 ${selectMode ? '' : 'group-hover:scale-105'} ${!photo.visible ? 'grayscale-[50%]' : ''}`}
                    />
                    
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest rounded-full font-bold">
                        {photo.category}
                      </span>
                      {!photo.visible && (
                        <span className="px-2 py-0.5 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest rounded-full font-bold">
                          Hidden
                        </span>
                      )}
                    </div>

                    {/* Selection checkbox */}
                    {selectMode && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-rose-500 border-rose-500 text-white' 
                            : 'bg-white/80 border-slate-300 backdrop-blur-sm'
                        }`}>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    )}
                    
                    {/* Quick Actions (normal mode only) */}
                    {!selectMode && (
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleVisibility(photo); }}
                          disabled={togglingId === photo.id}
                          className="p-2 bg-white text-slate-900 rounded-full hover:bg-amber-500 hover:text-white transition-all shadow-md"
                          title={photo.visible ? 'Hide from site' : 'Show on site'}
                        >
                          {togglingId === photo.id ? <Loader2 size={18} className="animate-spin" /> : (photo.visible ? <EyeOff size={18} /> : <Eye size={18} />)}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPhoto(photo);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 bg-white text-slate-900 rounded-full hover:bg-cyan-500 hover:text-white transition-all shadow-md"
                          title="Edit Metadata"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                          className="p-2 bg-white text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-md"
                          title="Delete Photo"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-aladin text-xl text-slate-800 dark:text-white leading-none truncate">
                        {photo.title || 'Untitled'}
                      </h3>
                      {!selectMode && (
                        <div className="flex gap-1 shrink-0">
                          <button 
                            disabled={index === 0}
                            onClick={() => handleMove(index, 'up')}
                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${index === 0 ? 'opacity-20 cursor-not-allowed' : 'text-slate-400'}`}
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button 
                            disabled={index === photos.length - 1}
                            onClick={() => handleMove(index, 'down')}
                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${index === photos.length - 1 ? 'opacity-20 cursor-not-allowed' : 'text-slate-400'}`}
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="font-aladin text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                      {photo.intent || 'No intent specified.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <CustomModal 
        isOpen={isUploadModalOpen} 
        onClose={() => {
          if (!uploading) {
            setIsUploadModalOpen(false);
            setPreviewUrl(null);
            setSelectedFile(null);
          }
        }} 
        title="Upload New Photo"
        footer={
          <>
            <button 
              onClick={() => {
                setIsUploadModalOpen(false);
                setPreviewUrl(null);
                setSelectedFile(null);
              }}
              disabled={uploading}
              className="px-4 py-2 font-aladin text-slate-500 hover:text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-aladin hover:bg-cyan-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {uploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="text-slate-300" size={64} />
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-400 tracking-widest mb-1">Title</label>
              <input 
                type="text" 
                value={currentPhoto.title || ''}
                onChange={(e) => setCurrentPhoto({...currentPhoto, title: e.target.value})}
                placeholder="Photo Title"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-cyan-500 font-aladin"
              />
            </div>
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-400 tracking-widest mb-1">Category</label>
              <select 
                value={currentPhoto.category || 'Landscape'}
                onChange={(e) => setCurrentPhoto({...currentPhoto, category: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-cyan-500 font-aladin"
              >
                <option>Landscape</option>
                <option>Architecture</option>
                <option>Nature</option>
                <option>Adventure</option>
                <option>Atmospheric</option>
                <option>Street</option>
                <option>Portrait</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-400 tracking-widest mb-1">Intent (Description)</label>
              <textarea 
                value={currentPhoto.intent || ''}
                onChange={(e) => setCurrentPhoto({...currentPhoto, intent: e.target.value})}
                placeholder="What was the story behind this shot?"
                rows={4}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-cyan-500 font-aladin text-sm resize-none"
              />
            </div>
          </div>
        </div>
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        isOpen={isEditModalOpen}
        onClose={() => !saving && setIsEditModalOpen(false)}
        title="Edit Photo Metadata"
        footer={
          <>
            <button 
              onClick={() => setIsEditModalOpen(false)}
              disabled={saving}
              className="px-4 py-2 font-aladin text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdate}
              disabled={saving}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg font-aladin hover:bg-cyan-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <img src={currentPhoto.cloudinary_url} alt="Preview" className="w-full h-full object-cover" />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-400 tracking-widest mb-1">Title</label>
              <input 
                type="text" 
                value={currentPhoto.title || ''}
                onChange={(e) => setCurrentPhoto({...currentPhoto, title: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-cyan-500 font-aladin"
              />
            </div>
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-400 tracking-widest mb-1">Category</label>
              <select 
                value={currentPhoto.category || ''}
                onChange={(e) => setCurrentPhoto({...currentPhoto, category: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-cyan-500 font-aladin"
              >
                <option>Landscape</option>
                <option>Architecture</option>
                <option>Nature</option>
                <option>Adventure</option>
                <option>Atmospheric</option>
                <option>Street</option>
                <option>Portrait</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-400 tracking-widest mb-1">Intent (Description)</label>
              <textarea 
                value={currentPhoto.intent || ''}
                onChange={(e) => setCurrentPhoto({...currentPhoto, intent: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-cyan-500 font-aladin text-sm resize-none"
              />
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default PhotographyEditor;
