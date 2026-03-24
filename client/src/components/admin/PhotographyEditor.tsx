import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Upload, Trash2, Edit2, ChevronUp, ChevronDown, Check, Loader2, Image as ImageIcon } from 'lucide-react';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsUploadModalOpen(true);
      setCurrentPhoto({
        title: file.name.split('.')[0],
        category: 'Landscape',
        intent: ''
      });
    }
  };

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
          showAlert('Success', 'Photo uploaded successfully.', 'success');
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);
          fetchPhotos();
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
        showAlert('Success', 'Photo metadata updated.', 'success');
        setIsEditModalOpen(false);
        fetchPhotos();
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
          showAlert('Success', 'Photo deleted.', 'success');
          fetchPhotos();
        } else {
          showAlert('Error', 'Delete failed.', 'error');
        }
      } catch (err) {
        showAlert('Error', 'Connection failed.', 'error');
      }
    });
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!token) return;
    const newPhotos = [...photos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newPhotos.length) return;

    // Swap
    [newPhotos[index], newPhotos[targetIndex]] = [newPhotos[targetIndex], newPhotos[index]];
    
    // Update sort orders
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

  return (
    <div className="space-y-8 animate-in transition-all duration-500 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0 flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 rounded-lg">
            <Camera size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-aladin text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              Photography <span className="text-cyan-600">Gallery</span>
            </h2>
            <p className="text-slate-500 font-aladin text-sm mt-1">Manage your visual narratives and their intentions.</p>
          </div>
        </div>
        
        <label className="cursor-pointer group">
          <div className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg font-aladin hover:bg-cyan-700 transition-all shadow-sm">
            <Upload size={18} />
            <span>Upload Photo</span>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
            <ImageIcon className="text-slate-300 dark:text-slate-700 mb-4" size={64} strokeWidth={1} />
            <p className="font-aladin text-xl text-slate-400">No photos in your gallery yet.</p>
            <p className="font-aladin text-sm text-slate-400 opacity-60">Upload your first masterpiece to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo: Photo, index: number) => (
              <div 
                key={photo.id}
                className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-cyan-500/50 hover:shadow-lg transition-all"
              >
                {/* Image Preview */}
                <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={photo.cloudinary_url} 
                    alt={photo.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest rounded-full font-bold">
                      {photo.category}
                    </span>
                  </div>
                  
                  {/* Quick Actions (Overlay) */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => {
                        setCurrentPhoto(photo);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 bg-white text-slate-900 rounded-full hover:bg-cyan-500 hover:text-white transition-all shadow-md"
                      title="Edit Metadata"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(photo.id)}
                      className="p-2 bg-white text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-md"
                      title="Delete Photo"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-aladin text-xl text-slate-800 dark:text-white leading-none truncate">
                      {photo.title || 'Untitled'}
                    </h3>
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
                  </div>
                  <p className="font-aladin text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic">
                    {photo.intent || 'No intent specified.'}
                  </p>
                </div>
              </div>
            ))}
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
