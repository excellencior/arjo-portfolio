import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';

interface BlogEditorProps {
  posts: any[];
  token: string | null;
  onRefresh: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ posts, token, onRefresh }) => {
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPost({ title: '', date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), excerpt: '', readTime: '', content: '' });
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/content/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) onRefresh();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900 pb-2">
        <h2 className="text-4xl font-aladin text-purple-600">Blog Posts</h2>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-aladin hover:bg-purple-700 transition-all"
        >
          <Plus size={18} /> New Post
        </button>
      </div>

      <div className="space-y-4">
        {posts && Array.isArray(posts) && posts.map((post: any) => (
          <div key={post.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center group">
            <div>
              <h3 className="font-aladin text-xl text-slate-900 dark:text-white uppercase">{post.title}</h3>
              <p className="text-sm font-mono text-slate-400">{post.date}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(post)}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
              >
                <Edit3 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(post.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b pb-4 dark:border-slate-800">
              <h3 className="text-3xl font-aladin text-purple-600">{editingPost.id ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Title</label>
                <input 
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-aladin text-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Date</label>
                  <input 
                    value={editingPost.date}
                    onChange={(e) => setEditingPost({...editingPost, date: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Read Time</label>
                  <input 
                    value={editingPost.readTime}
                    onChange={(e) => setEditingPost({...editingPost, readTime: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Excerpt</label>
                <textarea 
                  value={editingPost.excerpt}
                  onChange={(e) => setEditingPost({...editingPost, excerpt: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-aladin text-lg h-20"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-500 mb-1">Content</label>
                <textarea 
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({...editingPost, content: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none font-mono text-sm h-40"
                />
              </div>
              <button 
                onClick={handleSave}
                className="w-full py-3 bg-purple-600 text-white rounded-xl flex items-center justify-center gap-2 font-aladin text-xl hover:bg-purple-700 transition-all"
              >
                <Save size={20} /> Save Post
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BlogEditor;
