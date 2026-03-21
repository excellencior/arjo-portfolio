import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save } from 'lucide-react';
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
    const dateValue = post.date;
    const date = new Date(dateValue);
    const isoDate = !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '';
    
    setEditingPost({ 
      ...post, 
      date: isoDate,
      tags_string: post.tags ? post.tags.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPost({ 
      title: '', 
      date: new Date().toISOString().split('T')[0], 
      content: '',
      tags_string: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const method = editingPost.id ? 'PUT' : 'POST';
    const url = editingPost.id 
      ? `${API_URL}/api/content/blog/${editingPost.id}`
      : `${API_URL}/api/content/blog`;

    // Strictly follow schema: title, content, date, tags
    const payload: any = {
      title: editingPost.title,
      content: editingPost.content,
      // Convert to full ISO for TIMESTAMPTZ
      date: new Date(editingPost.date).toISOString(),
      // Convert comma-separated string to text[] array
      tags: editingPost.tags_string 
        ? editingPost.tags_string.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '')
        : []
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
                <p className="text-[10px] font-aladin text-slate-400 uppercase tracking-wider">
                  {formatDateForDisplay(post.date)} 
                  {post.tags && post.tags.length > 0 && ` • ${post.tags.join(', ')}`}
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
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-md outline-none font-arial text-lg border border-transparent focus:border-purple-500 placeholder:font-arial"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Date</label>
              <input 
                type="date"
                value={editingPost?.date || ''}
                onChange={(e) => setEditingPost({...editingPost, date: e.target.value})}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-md outline-none font-arial text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-aladin uppercase text-slate-500 mb-1 tracking-wider">Tags (comma separated)</label>
              <input 
                value={editingPost?.tags_string || ''}
                onChange={(e) => setEditingPost({...editingPost, tags_string: e.target.value})}
                placeholder="tech, life, design"
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-md outline-none font-arial text-sm placeholder:font-arial"
              />
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
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-md outline-none font-arial text-sm h-64 placeholder:font-arial ring-0"
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
