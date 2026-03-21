import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    fetch(`${API_URL}/api/content/blog`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch posts', err);
        setLoading(false);
      });
  }, []);

  const allTags = useMemo(() => {
    if (!posts) return [];
    return Array.from(new Set(posts.flatMap(p => (p.tags || []).map((t: string) => t.toUpperCase())))).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const searchStr = searchQuery.toLowerCase().trim();
    
    // Exact tag search if query starts with #
    if (searchStr.startsWith('#')) {
      const tagSearch = searchStr.substring(1).trim();
      return posts.filter(post => 
        post.tags && post.tags.some((t: string) => t.toLowerCase().includes(tagSearch))
      );
    }

    // General search across titles, content, and tags
    return posts.filter(post => (
      post.title?.toLowerCase().includes(searchStr) ||
      post.content?.toLowerCase().includes(searchStr) ||
      (post.tags && post.tags.some((t: string) => t.toLowerCase().includes(searchStr)))
    ));
  }, [posts, searchQuery]);

  if (loading) return <div className="text-center mt-20 font-aladin text-2xl animate-pulse">Unfolding stories...</div>;

  return (
    <div className="pt-6 space-y-6 animate-in transition-all duration-700 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-20">
        <div className="space-y-1">
          <h1 className="inline-block text-4xl font-aladin bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent uppercase">
            Blog
          </h1>
          <p className="block text-lg font-aladin text-purple-900 dark:text-purple-100 opacity-90 leading-snug">
            Thoughts, stories, and technical insights.
          </p>
        </div>
        
        <div className="w-full md:w-96 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={16} />
            <input 
              type="text"
              placeholder="Search by title, content, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-9 pr-8 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-purple-200 dark:border-purple-800/50 rounded-lg outline-none focus:border-purple-500 shadow-sm transition-all font-arial text-sm placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          <AnimatePresence>
            {isSearchFocused && allTags.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-lg border border-purple-100 dark:border-purple-900 shadow-2xl overflow-hidden p-3"
              >
                <p className="text-[10px] font-aladin text-slate-400 uppercase tracking-widest mb-2">Explore Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag: any) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(`#${tag}`)}
                      className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded text-xs font-arial transition-colors border border-purple-100 dark:border-purple-800/30"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-5 relative z-10">
        {searchQuery.trim() && (
          <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/30 pb-3">
            <h3 className="font-aladin text-xl text-slate-700 dark:text-slate-300">
              Showing results for <span className="text-purple-600 dark:text-purple-400">"{searchQuery}"</span>
            </h3>
            <span className="text-xs font-aladin text-slate-500 uppercase tracking-widest">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'story' : 'stories'} found
            </span>
          </div>
        )}

        {filteredPosts.length > 0 ? (
          <div className="grid gap-4">
            {filteredPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="group block space-y-2 p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-purple-300 dark:hover:border-purple-700/50">
                <p className="w-full text-sm font-aladin text-purple-600 dark:text-purple-400 uppercase tracking-widest flex flex-wrap items-center gap-2">
                  <span>{formatDateForDisplay(post.date)}</span>
                  {post.tags && post.tags.length > 0 && (
                    <span>• {post.tags.map((t: string) => t.toUpperCase()).join(' • ')}</span>
                  )}
                  {post.updated_at && (
                    <span className="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-xs font-bold font-arial tracking-wider ml-auto">
                      UPDATED: {formatDateForDisplay(post.updated_at)}
                    </span>
                  )}
                </p>
                <h2 className="inline-block text-2xl font-aladin bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent uppercase group-hover:from-pink-800 group-hover:to-purple-800 dark:group-hover:from-pink-300 dark:group-hover:to-purple-300 transition-all duration-300">
                  {post.title}
                </h2>
                <p className="font-arial text-sm text-slate-600 dark:text-slate-300 leading-snug line-clamp-3 mt-0.5">
                  {post.content?.replace(/[#*`]|<u>|<\/u>/g, '').slice(0, 200)}...
                </p>
                <div className="pt-1">
                  <span className="text-xs font-aladin text-pink-700 dark:text-pink-400 group-hover:underline">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-purple-200 dark:border-purple-900/50 rounded-xl">
            <p className="font-aladin text-2xl text-slate-500 dark:text-slate-400">No stories found matching your search.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 px-6 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-aladin text-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
