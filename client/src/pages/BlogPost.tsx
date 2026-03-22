import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';

import rehypeRaw from 'rehype-raw';

const API_URL = import.meta.env.VITE_API_URL;

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/content/blog/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch post', err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      <p className="font-aladin text-2xl animate-pulse text-purple-900 dark:text-purple-100">Unfolding story...</p>
    </div>
  );

  if (error || !post) return (
    <div className="max-w-5xl mx-auto pt-20 text-center space-y-6">
      <h1 className="text-4xl font-aladin text-purple-600 uppercase">Post not found</h1>
      <Link to="/blog" className="inline-block font-aladin text-2xl text-slate-600 hover:underline">
        Back to Blog
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in transition-all duration-700 pb-16">
      <Link to="/blog" className="inline-flex items-center gap-2 font-aladin text-lg bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent hover:underline transition-all duration-300">
        <ArrowLeft size={16} className="text-pink-950 dark:text-pink-100" />
        <span>Back to Stories</span>
      </Link>

      <header className="space-y-3">
        <h3 className="text-3xl font-aladin font-bold bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent uppercase tracking-tight leading-tight">
          {post.title}
        </h3>
        
        <div className="flex flex-wrap gap-4 items-center font-aladin text-base text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-purple-500" />
            <span>{formatDateForDisplay(post.date)}</span>
          </div>
          {post.updated_at && (
            <div className="flex items-center gap-2 opacity-80">
              <span className="text-sm">Last updated: {formatDateForDisplay(post.updated_at)}</span>
            </div>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-purple-500" />
              <span>{post.tags.map((t: string) => t.toUpperCase()).join(' • ')}</span>
            </div>
          )}
        </div>
      </header>

      <article className="font-aladin">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent uppercase tracking-tight mb-4 mt-6">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent mt-6 mb-3">
                {children}
              </h2>
            ),
            p: ({ children }) => (
              <p className="text-lg font-medium text-slate-800 dark:text-slate-200 leading-snug mb-3 italic opacity-90">
                {children}
              </p>
            ),
            li: ({ children }) => (
              <li className="text-lg font-medium text-pink-950 dark:text-pink-100 mb-1.5 list-disc list-inside">
                {children}
              </li>
            ),
            ul: ({ children }) => (
              <ul className="space-y-1 mb-4 ml-4">
                {children}
              </ul>
            ),
            code: ({ children }) => (
              <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-pink-600 dark:text-pink-400 font-mono text-base">
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-purple-500/30 pl-4 py-2 my-4 bg-slate-50 dark:bg-slate-900/50 rounded-r-lg italic text-xl text-slate-900 dark:text-white leading-snug">
                {children}
              </blockquote>
            ),
            u: ({ children }) => (
              <span className="underline decoration-purple-500/50 decoration-2 underline-offset-4">
                {children}
              </span>
            )
          }}
        >
          {post.content}
        </ReactMarkdown>
      </article>
    </div>
  );
};

export default BlogPost;
