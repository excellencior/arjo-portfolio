import React, { useState, useRef, useEffect } from 'react';
import { Save, Trash2, Upload, User, Loader2, Linkedin, Facebook, Instagram, Twitter, Github, Youtube, Mail, Link as LinkIcon, Camera, ChevronDown } from 'lucide-react';
import CustomModal from './CustomModal';
import { useAlert } from '../../context/AlertContext';

const API_URL = import.meta.env.VITE_API_URL;

const SOCIAL_PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={16} /> },
  { id: 'facebook', label: 'Facebook', icon: <Facebook size={16} /> },
  { id: 'instagram', label: 'Instagram', icon: <Instagram size={16} /> },
  { id: 'twitter', label: 'Twitter / X', icon: <Twitter size={16} /> },
  { id: 'github', label: 'GitHub', icon: <Github size={16} /> },
  { id: 'youtube', label: 'YouTube', icon: <Youtube size={16} /> },
  { id: 'pinterest', label: 'Pinterest', icon: <Camera size={16} /> },
  { id: 'mail', label: 'Email', icon: <Mail size={16} /> },
  { id: 'other', label: 'Other', icon: <LinkIcon size={16} /> },
];

const getPlatform = (id: string) => SOCIAL_PLATFORMS.find(p => p.id === id) || SOCIAL_PLATFORMS[SOCIAL_PLATFORMS.length - 1];

interface HomeEditorProps {
  content: any;
  setContent: (content: any) => void;
  onSave: () => void;
  token: string | null;
  onRefreshDrafts: () => void;
  draftKeys: string[];
}

const HomeEditor: React.FC<HomeEditorProps> = ({ content, setContent, onSave, token, onRefreshDrafts, draftKeys }) => {
  const { showAlert } = useAlert();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [hasDraft, setHasDraft] = useState(false);

  const applyFormatting = (prefix: string, suffix: string, textareaId: string) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = (textareaId === 'bio-textarea' ? content.subtitle : content.quote) || '';
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newText = before + prefix + selected + suffix + after;
    
    if (textareaId === 'bio-textarea') {
      setContent({ ...content, subtitle: newText });
    } else {
      setContent({ ...content, quote: newText });
    }

    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus();
      // Adjust cursor position to be inside the formatting
      if (start === end) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      } else {
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  // Close dropdown on any click outside the dropdown area
  useEffect(() => {
    if (openDropdown === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is inside any dropdown container
      const dropdownEls = document.querySelectorAll('[data-social-dropdown]');
      let insideDropdown = false;
      dropdownEls.forEach(el => {
        if (el.contains(e.target as Node)) insideDropdown = true;
      });
      if (!insideDropdown) {
        setOpenDropdown(null);
      }
    };
    // Use setTimeout so the current click event finishes first
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Persistence: Restore from DB on mount
  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await fetch(`${API_URL}/api/drafts/draft_home_1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const draft = await res.json();
          if (draft && draft.content) {
            // Use functional update to avoid stale closure on 'content' prop
            // and merge with whatever the latest live state is
            setContent((prev: any) => {
              if (!prev) return draft.content;
              return {
                ...prev,
                ...draft.content,
                updated_at: prev.updated_at // Always prioritize live timestamp for cache busting
              };
            });
            setHasDraft(true);
          }
        }
      } catch (e) {
        console.error('Failed to fetch home draft');
      }
    };
    if (token) fetchDraft();
  }, [token]);

  useEffect(() => {
    setHasDraft(draftKeys.includes('draft_home_1'));
  }, [draftKeys]);

  const handleSaveDraft = async () => {
    if (content && Object.keys(content).length > 0) {
      // Create a clean copy without binary blobs if any somehow existed
      const { profile_image_blob, profile_image_mime_type, ...cleanContent } = content;
      
      try {
        const res = await fetch(`${API_URL}/api/drafts`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ key: 'draft_home_1', content: cleanContent })
        });

        if (res.ok) {
          setHasDraft(true);
          onRefreshDrafts();
          showAlert('Draft Saved', 'Your changes have been saved to the database.', 'success');
        } else {
          showAlert('Error', 'Failed to save draft.', 'error');
        }
      } catch (err) {
        showAlert('Error', 'Communication error.', 'error');
      }
    }
  };

  const discardDraft = async () => {
    try {
      const res = await fetch(`${API_URL}/api/drafts/draft_home_1`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setHasDraft(false);
        onRefreshDrafts();
        window.location.reload(); // Revert to DB version
      } else {
        showAlert('Error', 'Failed to discard draft.', 'error');
      }
    } catch (err) {
      showAlert('Error', 'Communication error.', 'error');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('Error', 'Image must be smaller than 5MB.', 'error');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Full = reader.result as string;
      const pureBase64 = base64Full.split(',')[1];
      try {
        const res = await fetch(`${API_URL}/api/content/home/image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            image: pureBase64,
            mimeType: file.type
          })
        });

        if (res.ok) {
          showAlert('Success', 'Profile image updated.', 'success');
          setContent({ ...content, updated_at: new Date().toISOString() });
        } else {
          showAlert('Error', 'Failed to upload image.', 'error');
        }
      } catch {
        showAlert('Error', 'Communication error.', 'error');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmRemove = (index: number) => {
    setIndexToRemove(index);
    setIsDeleteModalOpen(true);
  };

  const handleRemove = () => {
    if (indexToRemove === null) return;
    const newLinks = (content.links || []).filter((_: any, i: number) => i !== indexToRemove);
    setContent({...content, links: newLinks});
    setIsDeleteModalOpen(false);
    setIndexToRemove(null);
  };

  const selectPlatform = (idx: number, platformId: string) => {
    const currentLinks = Array.isArray(content.links) ? content.links : [];
    const newLinks = currentLinks.map((l: any, i: number) =>
      i === idx ? { ...l, text: platformId } : l
    );
    setContent({...content, links: newLinks});
    setOpenDropdown(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex justify-between items-center border-b border-blue-100 dark:border-blue-900 pb-2 mb-6 uppercase tracking-wide shrink-0">
        <h2 className="text-2xl font-aladin text-blue-600">Bio & Sanctuary Profile</h2>
        {hasDraft && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full border border-yellow-200 dark:border-yellow-800/50 animate-pulse">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Draft Version Active</span>
            <button 
              onClick={discardDraft}
              className="ml-2 hover:text-rose-500 transition-colors"
              title="Discard Draft"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-10 flex-1 overflow-hidden">
        {/* Left Side: Photo & Quick Info (Fixed) */}
        <div className="w-full md:w-[280px] shrink-0 space-y-6">
          <label className="block text-sm font-aladin text-slate-500 uppercase tracking-wider">Profile Image</label>
          <div className="relative group">
            <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shadow-inner">
              {uploading ? (
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              ) : content.updated_at ? (
                <img 
                  src={`${API_URL}/api/content/home/image?t=${content.updated_at}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-30">
                  <User size={64} className="text-slate-400" />
                  <span className="font-aladin text-sm uppercase">No Image</span>
                </div>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer rounded-full backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-2 text-white">
                <Upload size={32} />
                <span className="font-aladin text-sm uppercase">Change Picture</span>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          <p className="text-[10px] text-slate-400 font-aladin text-center uppercase tracking-widest">Optimized square shots work best (Max 5MB)</p>
          
          <div className="flex gap-2">
            <button 
              onClick={handleSaveDraft}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-aladin text-sm hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700"
            >
              Save Draft
            </button>
            <button 
              onClick={onSave}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-aladin text-base hover:bg-blue-700 transition-all shadow-md active:scale-[0.98]"
            >
              <Save size={18} /> Save My Bio
            </button>
          </div>
        </div>

        {/* Right Side: Detailed Bio & Links Editor (Scrollable) */}
        <div className="flex-1 space-y-8 overflow-y-auto pr-4 custom-scrollbar pb-10">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-aladin text-slate-500 mb-1 uppercase tracking-wider">Name / Headline</label>
              <input 
                value={content.title || ''}
                onChange={(e) => setContent({...content, title: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-blue-500 transition-all font-arial text-base"
              />
            </div>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-aladin text-slate-500 uppercase tracking-wider">Detailed Bio</label>
                <div className="flex gap-1 mb-1">
                  <button 
                    type="button"
                    onClick={() => applyFormatting('**', '**', 'bio-textarea')}
                    className="p-1 px-2 bg-slate-100 dark:bg-slate-700 rounded-sm hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all font-bold text-xs"
                    title="Bold"
                  >
                    B
                  </button>
                  <button 
                    type="button"
                    onClick={() => applyFormatting('*', '*', 'bio-textarea')}
                    className="p-1 px-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all italic text-xs"
                    title="Italic"
                  >
                    I
                  </button>
                  <button 
                    type="button"
                    onClick={() => applyFormatting('<u>', '</u>', 'bio-textarea')}
                    className="p-1 px-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all underline text-xs"
                    title="Underline"
                  >
                    U
                  </button>
                </div>
              </div>
              <textarea 
                id="bio-textarea"
                value={content.subtitle || ''}
                onChange={(e) => setContent({...content, subtitle: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-blue-500 transition-all font-arial text-base h-32 resize-y"
                placeholder="Tell your story here..."
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-aladin text-slate-500 uppercase tracking-wider">Personal Quote (Optional)</label>
                <div className="flex gap-1 mb-1">
                  <button 
                    type="button"
                    onClick={() => applyFormatting('**', '**', 'quote-textarea')}
                    className="p-1 px-2 bg-slate-100 dark:bg-slate-700 rounded-sm hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all font-bold text-xs"
                    title="Bold"
                  >
                    B
                  </button>
                  <button 
                    type="button"
                    onClick={() => applyFormatting('*', '*', 'quote-textarea')}
                    className="p-1 px-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all italic text-xs"
                    title="Italic"
                  >
                    I
                  </button>
                  <button 
                    type="button"
                    onClick={() => applyFormatting('<u>', '</u>', 'quote-textarea')}
                    className="p-1 px-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all underline text-xs"
                    title="Underline"
                  >
                    U
                  </button>
                </div>
              </div>
              <textarea 
                id="quote-textarea"
                value={content.quote || ''}
                onChange={(e) => setContent({...content, quote: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl outline-none border border-transparent focus:border-blue-500 transition-all font-arial text-base h-24 resize-y"
                placeholder="Add an inspiring quote or side note..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 pl-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <label className="text-sm font-aladin text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">Social Links</label>
              <button 
                onClick={() => {
                  const currentLinks = Array.isArray(content.links) ? content.links : [];
                  setContent({...content, links: [...currentLinks, { text: 'linkedin', to: '' }]});
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-aladin uppercase tracking-wider text-sm shadow-sm"
              >
                + Add Connection
              </button>
            </div>

            <div className="grid gap-3">
              {(Array.isArray(content.links) ? content.links : []).map((link: any, idx: number) => {
                const selected = getPlatform(link.text);
                return (
                  <div key={idx} className="flex gap-3 items-center p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                    {/* Custom Dropdown */}
                    <div className="relative w-[160px] shrink-0" data-social-dropdown>
                      <button
                        type="button"
                        ref={(el) => { buttonRefs.current[idx] = el; }}
                        onClick={() => {
                          if (openDropdown === idx) {
                            setOpenDropdown(null);
                          } else {
                            const btn = buttonRefs.current[idx];
                            if (btn) {
                              const rect = btn.getBoundingClientRect();
                              const spaceBelow = window.innerHeight - rect.bottom;
                              setDropdownDirection(spaceBelow < 220 ? 'up' : 'down');
                            }
                            setOpenDropdown(idx);
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 font-aladin text-sm text-left flex items-center justify-between gap-2 hover:border-blue-500/50 transition-all"
                      >
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <span className="text-blue-500">{selected.icon}</span>
                          {selected.label}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${openDropdown === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {openDropdown === idx && (
                        <div className={`absolute left-0 right-0 bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto ${dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                          {SOCIAL_PLATFORMS.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              className={`w-full px-3 py-2 text-left flex items-center gap-2.5 font-aladin text-sm transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0 ${
                                p.id === link.text 
                                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                              }`}
                              onClick={() => selectPlatform(idx, p.id)}
                            >
                              <span className="text-blue-500">{p.icon}</span>
                              {p.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input 
                      value={link.to || ''}
                      placeholder="URL (e.g. instagram.com/arjo)"
                      onChange={(e) => {
                        const currentLinks = Array.isArray(content.links) ? content.links : [];
                        const newLinks = currentLinks.map((l: any, i: number) => 
                          i === idx ? { ...l, to: e.target.value } : l
                        );
                        setContent({...content, links: newLinks});
                      }}
                      className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-blue-500 transition-all font-arial text-sm"
                    />
                    <button 
                      onClick={() => confirmRemove(idx)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Connection"
        size="sm"
        footer={
          <div className="flex gap-3">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-aladin text-base hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleRemove}
              className="flex-1 px-4 py-1.5 bg-red-600 text-white rounded-md font-aladin text-base hover:bg-red-700 shadow-md transition-all"
            >
              Confirm
            </button>
          </div>
        }
      >
        <p className="font-aladin text-xl text-slate-600 dark:text-slate-400 text-center py-4">
          Are you sure you want to remove this connection?
        </p>
      </CustomModal>
    </div>
  );
};

export default HomeEditor;
