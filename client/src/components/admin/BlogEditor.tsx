import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save } from 'lucide-react';
import CustomModal from './CustomModal';

interface BlogEditorProps {
  posts: any[];
  token: string | null;
  onRefresh: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ posts, token, onRefresh }) => {
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPost({ title: '', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), excerpt: '', readTime: '', content: '', category: '' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const method = editingPost.id ? 'PUT' : 'POST';
    const url = editingPost.id 
      ? `http://localhost:5000/api/content/blog/${editingPost.id}`
      : 'http://localhost:5000/api/content/blog';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingPost),
      });
      if (res.ok) {
        setIsModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
      const res = await fetch(`http://localhost:5000/api/content/blog/${postToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        onRefresh();
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const confirmDelete = (id: string) => {
    setPostToDelete(id);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900 pb-2 uppercase tracking-wide">
        <h2 className="text-2xl font-aladin text-purple-600">Blog Posts</h2>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg font-aladin text-lg hover:bg-purple-700 transition-all shadow-md"
        >
          <Plus size={18} /> New Post
        </button>
      </div>

      <div className="space-y-4">
        {posts && Array.isArray(posts) && posts.map((post: any) => (
          <div key={post.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center group border border-transparent hover:border-purple-500/20 transition-all">
            <div>
              <h3 className="font-aladin text-lg text-slate-900 dark:text-white uppercase leading-tight">{post.title}</h3>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{post.date} • {post.readTime} {post.category && `• ${post.category}`}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(post)}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={() => confirmDelete(post.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPost?.id ? 'Edit Post' : 'New Post'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Title</label>
            <input 
              value={editingPost?.title || ''}
              onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-aladin text-lg border border-transparent focus:border-purple-500 placeholder:font-aladin"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Date</label>
              <input 
                value={editingPost?.date || ''}
                onChange={(e) => setEditingPost({...editingPost, date: e.target.value})}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Read Time</label>
              <input 
                value={editingPost?.readTime || ''}
                onChange={(e) => setEditingPost({...editingPost, readTime: e.target.value})}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Category</label>
              <input 
                value={editingPost?.category || ''}
                onChange={(e) => setEditingPost({...editingPost, category: e.target.value})}
                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Excerpt</label>
            <textarea 
              value={editingPost?.excerpt || ''}
              onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-aladin text-lg h-20"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Content</label>
            <textarea 
              value={editingPost?.content || ''}
              onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono text-sm h-40"
            />
          </div>
          <button 
            onClick={handleSave}
            className="w-full py-1.5 bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 font-aladin text-base hover:bg-purple-700 transition-all shadow-md mt-2"
          >
            <Save size={18} /> Save Post
          </button>
        </div>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
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
              onClick={handleDelete}
              className="px-4 py-1.5 bg-red-600 text-white rounded-lg font-aladin text-lg hover:bg-red-700 shadow-md"
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
