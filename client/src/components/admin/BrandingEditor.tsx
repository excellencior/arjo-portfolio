import { useAlert } from '../../context/AlertContext';
import { useBranding } from '../../context/BrandingContext';
import { Loader2, Trash2, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BrandingEditorProps {
  token: string | null;
  onLogout?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const BrandingEditor: React.FC<BrandingEditorProps> = ({ token, onLogout }) => {
  const { showAlert, showConfirm } = useAlert();
  const { branding, refreshBranding, logos, refreshLogos } = useBranding();
  const [saving, setSaving] = useState(false);
  const [activeSavingId, setActiveSavingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewId, setPreviewId] = useState<number | null>(null);

  useEffect(() => {
    if (logos.length === 0 && token) {
      refreshLogos(token);
    }
  }, [token, logos.length, refreshLogos]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Error', 'Logo must be smaller than 5MB.', 'error');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Full = reader.result as string;
      const pureBase64 = base64Full.split(',')[1];
      try {
        const res = await fetch(`${API_URL}/api/branding/logos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            logo_data: pureBase64,
            logo_mime_type: file.type,
            name: file.name.replace(/\.[^.]+$/, '')
          })
        });
        
        if (res.status === 401 && onLogout) {
          onLogout();
          return;
        }

        if (res.ok) {
          showAlert('Success', 'Logo added to your collection.', 'success');
          await refreshLogos(token);
        } else {
          showAlert('Error', 'Failed to upload logo.', 'error');
        }
      } catch {
        showAlert('Error', 'Communication error.', 'error');
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: number) => {
    const isActive = branding.active_logo_id === id;
    showConfirm('Delete Logo', 'Are you sure you want to remove this logo?', async () => {
      try {
        const res = await fetch(`${API_URL}/api/branding/logos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401 && onLogout) {
          onLogout();
          return;
        }

        if (res.ok) {
          showAlert('Success', 'Logo removed.', 'success');
          await refreshLogos(token);
          if (isActive) await refreshBranding();
        }
      } catch {
        showAlert('Error', 'Failed to delete logo.', 'error');
      }
    });
  };

  const handleSetActive = async (logoId: number) => {
    if (logoId !== -1 && branding.active_logo_id === logoId) return;
    
    setSaving(true);
    setActiveSavingId(logoId);
    try {
      const res = await fetch(`${API_URL}/api/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active_logo_id: logoId })
      });
      
      if (res.status === 401 && onLogout) {
        onLogout();
        return;
      }

      if (res.ok) {
        await refreshBranding();
        showAlert('Updated', 'Active branding updated.', 'success');
      }
    } catch {
      showAlert('Error', 'Error updating branding.', 'error');
    } finally {
      setSaving(false);
      setActiveSavingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in transition-all duration-500">
      {/* Simple Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-3xl font-aladin text-slate-800 dark:text-slate-100 uppercase tracking-tight">
          Site <span className="text-blue-600">Branding</span>
        </h2>
        <p className="text-slate-500 font-aladin text-sm mt-1">Manage your website's logo and identity settings. Maximum size allowed is 5MB.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Active Logo Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-aladin uppercase text-slate-400 tracking-[0.2em] mb-4">Active Logo</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6 border border-slate-100 dark:border-slate-800 flex items-center gap-6">
              <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-md flex items-center justify-center p-4 border border-slate-200 dark:border-slate-700">
                {branding.active_logo_id ? (
                  <img
                    src={`${API_URL}/api/branding/logo?t=${branding.updated_at || Date.now()}`}
                    alt="Active Logo"
                    className="max-w-full max-h-full object-contain dark:invert"
                  />
                ) : (
                  <span className="text-2xl font-aladin font-bold text-slate-400 opacity-40">P</span>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <p className="text-sm font-aladin text-slate-500">{branding.active_logo_id ? 'Current signature logo is active.' : 'Default placeholder is being used.'}</p>
                {branding.active_logo_id && (
                  <button
                    onClick={() => handleSetActive(-1)}
                    disabled={saving}
                    className="flex items-center gap-2 text-rose-500 font-aladin text-sm hover:underline"
                  >
                    <X size={14} /> Remove current logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="cursor-pointer block">
              <div className={`px-6 py-3 ${uploading ? 'bg-slate-200 text-slate-400' : 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900'} rounded-md font-aladin text-lg text-center transition-all hover:opacity-90 flex items-center justify-center gap-2`}>
                <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload New Logo'}
              </div>
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="space-y-6">
          <h3 className="text-xs font-aladin uppercase text-slate-400 tracking-[0.2em]">Logo Gallery</h3>
          
          {logos.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-lg">
              <p className="font-aladin text-slate-400">No logos in your collection yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {logos.map((logo) => {
                const isActive = branding.active_logo_id === logo.id;
                return (
                  <div
                    key={logo.id}
                    className={`group relative aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-md border p-2 transition-all ${isActive ? 'border-blue-500 bg-white dark:bg-slate-800' : 'border-slate-100 dark:border-slate-800'}`}
                  >
                    <div className="w-full h-full flex items-center justify-center p-2 cursor-pointer" onClick={() => setPreviewId(logo.id)}>
                      <img
                        src={`${API_URL}/api/branding/logos/${logo.id}`}
                        alt={logo.name}
                        className="max-w-full max-h-full object-contain dark:invert"
                      />
                    </div>

                    {/* Loading Overlay */}
                    {activeSavingId === logo.id && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-[2px] rounded-md flex items-center justify-center z-20">
                        <Loader2 size={24} className="animate-spin text-blue-600" />
                      </div>
                    )}
                    
                    {/* Hover Actions */}
                    <div className={`absolute inset-x-0 bottom-0 p-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all flex gap-1 z-10 ${activeSavingId === logo.id ? 'hidden' : ''}`}>
                      <button
                        onClick={() => handleSetActive(logo.id)}
                        disabled={saving || isActive}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
                      >
                        {isActive ? 'Active' : 'Use'}
                      </button>
                      <button
                        onClick={() => handleDelete(logo.id)}
                        className="p-1 bg-white dark:bg-slate-700 text-rose-500 border border-slate-100 dark:border-slate-600 rounded-md hover:bg-rose-50 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Simple Image Modal */}
      {previewId && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="relative bg-white dark:bg-slate-900 rounded-lg p-6 md:p-10 max-w-xl w-full shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="space-y-8">
              <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-800 rounded-md min-h-[250px] border border-slate-100 dark:border-slate-700">
                <img
                  src={`${API_URL}/api/branding/logos/${previewId}`}
                  alt="Preview"
                  className="max-w-full max-h-[35vh] object-contain dark:invert"
                />
              </div>
              
              <div className="flex justify-center gap-3">
                <button
                  onClick={async () => { await handleSetActive(previewId!); setPreviewId(null); }}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md font-aladin text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 min-w-[160px]"
                >
                  {activeSavingId === previewId ? <Loader2 size={20} className="animate-spin" /> : 'Set as Active Logo'}
                </button>
                <button
                  onClick={() => { handleDelete(previewId!); setPreviewId(null); }}
                  className="px-6 py-2 text-rose-500 font-aladin text-lg hover:underline transition-all"
                >
                  Remove from collection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingEditor;
