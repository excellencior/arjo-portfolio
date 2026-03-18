import { Link } from 'react-router-dom';

const posts = [
  { id: '1', title: 'Starting my Journey', date: 'March 18, 2026', excerpt: 'Looking back at how it all started and where I am headed.', readTime: '5 min read' },
  { id: '2', title: 'Why Minimalism Matters', date: 'March 15, 2026', excerpt: 'Exploring the beauty of simple design in a complex world.', readTime: '3 min read' }
];

const Blog = () => {
  return (
    <div className="pt-10 space-y-10 animate-in transition-all duration-700">
      <div className="space-y-2">
        <h1 className="text-6xl font-aladin bg-gradient-to-r from-gray-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent uppercase">
          Blog
        </h1>
        <p className="text-xl font-aladin bg-gradient-to-r from-gray-600 to-gray-400 dark:from-slate-400 dark:to-slate-500 bg-clip-text text-transparent leading-tight">
          Thoughts, stories, and technical insights.
        </p>
      </div>

      <div className="grid gap-8">
        {posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.id}`} className="group block space-y-2 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:border-blue-500/30">
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">{post.date} • {post.readTime}</p>
            <h2 className="text-3xl font-aladin bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent uppercase group-hover:from-blue-600 group-hover:to-blue-400 transition-all duration-300">
              {post.title}
            </h2>
            <p className="font-aladin text-lg bg-gradient-to-r from-slate-600 to-slate-400 dark:from-slate-300 dark:to-slate-500 bg-clip-text text-transparent leading-tight">
              {post.excerpt}
            </p>
            <div className="pt-2">
              <span className="text-sm font-aladin text-blue-500 dark:text-blue-400 group-hover:underline">Read more →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog;
