import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/content/blog')
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

  if (loading) return <div className="text-center mt-20 font-aladin text-2xl animate-pulse">Unfolding stories...</div>;

  return (
    <div className="pt-5 space-y-10 animate-in transition-all duration-700">
      <div className="space-y-2">
        <h1 className="inline-block text-6xl font-aladin bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent uppercase">
          Blog
        </h1>
        <p className="block text-xl font-aladin text-purple-900 dark:text-purple-100 opacity-90 leading-tight">
          Thoughts, stories, and technical insights.
        </p>
      </div>

      <div className="grid gap-8">
        {posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.id}`} className="group block space-y-2 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:border-purple-700/30">
            <p className="text-sm font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest">{post.date} • {post.readTime}</p>
            <h2 className="inline-block text-4xl font-aladin bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent uppercase group-hover:from-pink-800 group-hover:to-purple-800 dark:group-hover:from-pink-300 dark:group-hover:to-purple-300 transition-all duration-300">
              {post.title}
            </h2>
            <p className="font-aladin text-xl text-fuchsia-950 dark:text-purple-100 opacity-90 leading-tight border-l-4 border-fuchsia-900 dark:border-fuchsia-500 pl-4">
              {post.excerpt}
            </p>
            <div className="pt-2">
              <span className="text-sm font-aladin text-pink-700 dark:text-pink-400 group-hover:underline">Read more →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog;
