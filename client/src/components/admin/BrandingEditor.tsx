import React, { useState, useEffect } from 'react';
import { useBranding } from '../../context/BrandingContext';
import { Upload, Trash2, X, Check } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

interface BrandingEditorProps {
  token: string | null;
  onLogout?: () => void;
}

interface LogoItem {
  id: number;
  name: string;
  logo_mime_type: string;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BrandingEditor: React.FC<BrandingEditorProps> = ({ token, onLogout }) => {
  const { showAlert, showConfirm } = useAlert();
  const { branding, refreshBranding } = useBranding();
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewId, setPreviewId] = useState<number | null>(null);

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/branding/logos`);
      if (res.status === 401 && onLogout) {
        showAlert('Session Expired', 'Please log in again.', 'error');
        onLogout();
        return;
      }
      if (res.ok) setLogos(await res.json());
    } catch {}
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
          showAlert('Session Expired', 'Please log in again.', 'error');
          onLogout();
          return;
        }
        if (res.ok) {
          showAlert('Success', 'Logo uploaded successfully!', 'success');
          await fetchLogos();
        }
      } catch {
        showAlert('Error', 'Failed to upload logo.', 'error');
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: number) => {
    showConfirm('Confirm Deletion', 'Are you sure you want to delete this logo?', async () => {
      try {
        const res = await fetch(`${API_URL}/api/branding/logos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401 && onLogout) {
          showAlert('Session Expired', 'Please log in again.', 'error');
          onLogout();
          return;
        }
        if (res.ok) {
          showAlert('Deleted', 'Logo removed from gallery.', 'success');
          await fetchLogos();
        } else {
          showAlert('Error', 'Failed to delete logo.', 'error');
        }
      } catch {
        showAlert('Error', 'Failed to connect to server.', 'error');
      }
    });
  };

  const handleSetActive = async (logoId: number) => {
    setSaving(true);
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
        showAlert('Session Expired', 'Please log in again.', 'error');
        onLogout();
        return;
      }
      if (res.ok) {
        await refreshBranding();
        if (logoId === -1) {
          showAlert('Success', 'Active logo removed!', 'success');
        } else {
          showAlert('Success', 'Logo activated!', 'success');
        }
      } else {
        showAlert('Error', 'Failed to activate logo.', 'error');
      }
    } catch {
      showAlert('Error', 'Error connecting to server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in transition-all duration-500">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-4xl font-aladin text-slate-900 dark:text-white uppercase tracking-tight">
          Site <span className="text-blue-600">Branding</span>
        </h2>
      </div>

      {/* Current Active Logo */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-aladin text-slate-500 uppercase tracking-widest">
          Active Logo
        </label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden border-2 border-blue-500 p-2">
            <img
              src={`${API_URL}/api/branding/logo?t=${branding.updated_at || Date.now()}`}
              alt="Active Logo"
              className="max-w-full max-h-full object-contain dark:invert"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<span class="text-xs text-slate-400 font-aladin text-center">No Logo Set</span>';
              }}
            />
          </div>
          <button
            onClick={() => handleSetActive(-1)}
            disabled={saving}
            className="px-4 py-2 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl font-aladin text-sm hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-all flex items-center gap-2"
          >
            <X size={16} /> Remove Logo
          </button>
        </div>
      </div>

      {/* Logo Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-aladin text-slate-500 uppercase tracking-widest">
            <Upload size={16} /> Logo Gallery
          </label>
          <label className="cursor-pointer">
            <div className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-aladin text-sm hover:opacity-80 transition-all flex items-center gap-2">
              <Upload size={14} /> {uploading ? 'Uploading...' : 'Add Logo'}
            </div>
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={uploading} />
          </label>
        </div>

        {logos.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-aladin text-lg border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            No logos uploaded yet. Add your first logo above.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="group relative bg-slate-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 hover:border-blue-500 transition-all cursor-pointer flex flex-col"
              >
                {/* Logo Image — click to preview */}
                <div
                  className="aspect-square flex items-center justify-center overflow-hidden flex-1"
                  onClick={() => setPreviewId(logo.id)}
                >
                  <img
                    src={`${API_URL}/api/branding/logos/${logo.id}`}
                    alt={logo.name}
                    className="max-w-full max-h-full object-contain dark:invert"
                  />
                </div>
                
                {/* Actions — always visible */}
                <div className="mt-4 flex gap-2 justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetActive(logo.id); }}
                    disabled={saving}
                    className="flex-1 py-1.5 flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:hover:bg-emerald-800/60 dark:text-emerald-400 rounded-lg transition-all text-xs font-bold"
                    title="Set as active"
                  >
                    <Check size={14} className="mr-1" /> Use
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(logo.id); }}
                    className="px-2.5 py-1.5 flex items-center justify-center bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/40 dark:hover:bg-rose-800/60 dark:text-rose-400 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-8"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg max-h-[80vh] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewId(null)}
              className="absolute top-3 right-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <X size={18} />
            </button>
            <img
              src={`${API_URL}/api/branding/logos/${previewId}`}
              alt="Logo Preview"
              className="max-w-full max-h-[60vh] object-contain mx-auto dark:invert"
            />
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => { handleSetActive(previewId); setPreviewId(null); }}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl font-aladin text-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Check size={16} /> Use This Logo
              </button>
              <button
                onClick={() => { handleDelete(previewId); setPreviewId(null); }}
                className="px-5 py-2 bg-red-600 text-white rounded-xl font-aladin text-lg hover:bg-red-700 transition-all flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingEditor;
