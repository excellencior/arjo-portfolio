import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import CustomModal from './CustomModal';
import { useAlert } from '../../context/AlertContext';

interface BlogEditorProps {
  posts: any[];
  token: string | null;
  onRefresh: () => void;
  onLogout?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

const BlogEditor: React.FC<BlogEditorProps> = ({ posts, token, onRefresh, onLogout }) => {
  const { showAlert } = useAlert();
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [showNewTagInput, setShowNewTagInput] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const existingTags = Array.from(new Set(posts.flatMap(p => (p.tags || []).map((t: string) => t.toUpperCase())))).sort();

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const applyFormatting = (prefix: string, suffix: string) => {
    const textarea = document.getElementById('blog-content-area') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingPost.content || '';
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newContent = before + prefix + selected + suffix + after;
    setEditingPost({ ...editingPost, content: newContent });

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

  const handleEdit = (post: any) => {
    setEditingPost({ 
      ...post, 
      tags: (post.tags || []).map((t: string) => t.toUpperCase())
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPost({ 
      title: '', 
      date: new Date().toISOString(), 
      content: '',
      tags: []
    });
    setShowNewTagInput(false);
    setIsDropdownOpen(false);
    setNewTagValue('');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const method = editingPost.id ? 'PUT' : 'POST';
    const url = editingPost.id 
      ? `${API_URL}/api/content/blog/${editingPost.id}`
      : `${API_URL}/api/content/blog`;

    // Strictly follow schema: title, content, date, tags, updated_at
    const payload: any = {
      title: editingPost.title,
      content: editingPost.content,
      // Generate new ISO date on POST, preserve exact original on PUT
      date: editingPost.id ? editingPost.date : new Date().toISOString(),
      // Unconditionally set updated_at (creation is an update too)
      updated_at: new Date().toISOString(),
      // Use the proper tags array
      tags: Array.isArray(editingPost.tags) ? editingPost.tags : []
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      if (res.status === 401 && onLogout) {
        showAlert('Session Expired', 'Please log in again.', 'error');
        onLogout();
        return;
      }

      if (res.ok) {
        showAlert('Success', editingPost.id ? 'Post updated!' : 'Post created!', 'success');
        setIsModalOpen(false);
        onRefresh();
      } else {
        const errData = await res.json();
        showAlert('Error', errData.error || 'Save failed.', 'error');
      }
    } catch (err) {
      showAlert('Error', 'An unexpected error occurred.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
      const res = await fetch(`${API_URL}/api/content/blog/${postToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.status === 401 && onLogout) {
        showAlert('Session Expired', 'Please log in again.', 'error');
        onLogout();
        return;
      }
      if (res.ok) {
        onRefresh();
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      showAlert('Error', 'Delete failed.', 'error');
    }
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPostToDelete(id);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900 pb-2 uppercase tracking-wide">
        <h2 className="text-2xl font-aladin text-purple-600">Blog Posts</h2>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-md font-aladin text-lg hover:bg-purple-700 transition-all shadow-md"
        >
          <Plus size={18} /> New Post
        </button>
      </div>

      <div className="space-y-4">
        {posts && posts.length > 0 ? (
          posts.map((post: any) => (
            <div 
              key={post.id} 
              onClick={() => handleEdit(post)}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md flex justify-between items-center group border border-transparent hover:border-purple-500/20 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <div>
                <h3 className="font-aladin text-lg text-slate-900 dark:text-white uppercase leading-tight">{post.title}</h3>
                <p className="w-full text-[10px] font-aladin text-slate-400 uppercase tracking-wider flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span>{formatDateForDisplay(post.date)}</span>
                  {post.tags && post.tags.length > 0 && (
                    <span>• {post.tags.map((t: string) => t.toUpperCase()).join(' • ')}</span>
                  )}
                  {post.updated_at && (
                    <span className="ml-auto bg-slate-200 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold font-arial tracking-wider">
                      UPDATED: {formatDateForDisplay(post.updated_at)}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  className="p-2 text-purple-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Edit"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={(e) => confirmDelete(post.id, e)}
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
            No blog posts found. Build your first sanctuary story!
          </div>
        )}
      </div>

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPost?.id ? 'Edit Post' : 'New Post'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Title</label>
            <input 
              value={editingPost?.title || ''}
              onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-purple-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Tags</label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {(editingPost?.tags || []).map((tag: string) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-sm font-arial border border-purple-200 dark:border-purple-800/50">
                    #{tag}
                    <button 
                      type="button"
                      onClick={() => setEditingPost({ ...editingPost, tags: editingPost.tags.filter((t: string) => t !== tag) })}
                      className="text-purple-400 hover:text-purple-600 dark:hover:text-purple-200 ml-1"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>

              {!showNewTagInput ? (
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-arial text-base text-slate-400 text-left flex justify-between items-center"
                  >
                    <span>Select a tag to add...</span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-purple-100 dark:border-purple-900 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto overflow-x-hidden">
                      {existingTags.filter((t: any) => !(editingPost?.tags || []).includes(t)).map((tag: any) => (
                        <button
                          key={tag}
                          type="button"
                          className="w-full px-4 py-2.5 text-left hover:bg-purple-50 dark:hover:bg-purple-900/30 font-arial text-slate-700 dark:text-slate-300 transition-colors border-b border-purple-50 dark:border-purple-900/30 last:border-0"
                          onClick={() => {
                            const currentTags = editingPost?.tags || [];
                            if (!currentTags.includes(tag)) {
                              setEditingPost({ ...editingPost, tags: [...currentTags, tag] });
                            }
                            setIsDropdownOpen(false);
                          }}
                        >
                          #{tag}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors border-t border-purple-100 dark:border-purple-900/50"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setShowNewTagInput(true);
                        }}
                      >
                        + Create new tag
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <input 
                    type="text"
                    value={newTagValue}
                    onChange={(e) => setNewTagValue(e.target.value)}
                    placeholder="Type tag name..."
                    className="flex-1 px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-purple-200 dark:border-purple-700 focus:border-purple-500 transition-all font-arial text-sm placeholder:font-arial placeholder:text-slate-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newTagValue.trim()) {
                          const cleanTag = newTagValue.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
                          if (cleanTag && !(editingPost?.tags || []).includes(cleanTag)) {
                            setEditingPost({ ...editingPost, tags: [...(editingPost?.tags || []), cleanTag] });
                          }
                          setNewTagValue('');
                          setShowNewTagInput(false);
                        }
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      if (newTagValue.trim()) {
                        const cleanTag = newTagValue.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
                        if (cleanTag && !(editingPost?.tags || []).includes(cleanTag)) {
                          setEditingPost({ ...editingPost, tags: [...(editingPost?.tags || []), cleanTag] });
                        }
                      }
                      setNewTagValue('');
                      setShowNewTagInput(false);
                    }}
                    className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-aladin text-base hover:bg-purple-700 transition-all shadow-sm"
                  >
                    Add
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setNewTagValue('');
                      setShowNewTagInput(false);
                    }}
                    className="px-3 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all font-aladin text-base"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-xs font-aladin uppercase text-slate-500 tracking-wider">Content</label>
              <div className="flex gap-1 mb-1">
                <button 
                  type="button"
                  onClick={() => applyFormatting('**', '**')}
                  className="p-1 px-2 bg-slate-200 dark:bg-slate-700 rounded-sm hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 transition-all font-bold text-xs"
                  title="Bold"
                >
                  B
                </button>
                <button 
                  type="button"
                  onClick={() => applyFormatting('*', '*')}
                  className="p-1 px-2 bg-slate-200 dark:bg-slate-700 rounded hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 transition-all italic text-xs"
                  title="Italic"
                >
                  I
                </button>
                <button 
                  type="button"
                  onClick={() => applyFormatting('<u>', '</u>')}
                  className="p-1 px-2 bg-slate-200 dark:bg-slate-700 rounded hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 transition-all underline text-xs"
                  title="Underline"
                >
                  U
                </button>
              </div>
            </div>
            <textarea 
              id="blog-content-area"
              value={editingPost?.content || ''}
              onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-transparent focus:border-purple-500 transition-all font-arial text-base placeholder:font-arial placeholder:text-slate-400 h-64 resize-y"
            />
          </div>
          <button 
            onClick={handleSave}
            className="w-full py-2 bg-purple-600 text-white rounded-md flex items-center justify-center gap-2 font-aladin text-lg hover:bg-purple-700 transition-all shadow-md mt-2 disabled:opacity-50"
          >
            <Save size={18} /> Save Post
          </button>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
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
              onClick={handleDelete}
              className="px-4 py-1.5 bg-red-600 text-white rounded-md font-aladin text-lg hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="font-aladin text-xl text-slate-600 dark:text-slate-400">
          Are you sure you want to permanently delete this blog post? This action cannot be undone.
        </p>
      </CustomModal>
    </div>
  );
};

export default BlogEditor;
