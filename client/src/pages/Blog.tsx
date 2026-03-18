import { Link } from 'react-router-dom';

const posts = [
  { id: '1', title: 'Starting my Journey', date: 'March 18, 2026', excerpt: 'Looking back at how it all started and where I am headed.', readTime: '5 min read' },
  { id: '2', title: 'Why Minimalism Matters', date: 'March 15, 2026', excerpt: 'Exploring the beauty of simple design in a complex world.', readTime: '3 min read' }
];

const Blog = () => {
  return (
    <div className="pt-10 space-y-10 animate-in transition-all duration-700">
      <div className="space-y-2">
        <h1 className="inline-block text-6xl font-aladin bg-gradient-to-r from-purple-950 via-fuchsia-950 to-pink-900 dark:from-purple-200 dark:via-fuchsia-100 dark:to-pink-300 bg-clip-text text-transparent uppercase">
          Blog
        </h1>
        <p className="block text-xl font-aladin bg-gradient-to-r from-purple-900 via-fuchsia-900 to-pink-800 dark:from-purple-400 dark:to-pink-500 bg-clip-text text-transparent leading-tight">
          Thoughts, stories, and technical insights.
        </p>
      </div>

      <div className="grid gap-8">
        {posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.id}`} className="group block space-y-2 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:border-purple-700/30">
            <p className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest">{post.date} • {post.readTime}</p>
            <h2 className="inline-block text-3xl font-aladin bg-gradient-to-r from-purple-950 via-fuchsia-950 to-pink-900 dark:from-purple-200 dark:via-fuchsia-100 dark:to-pink-300 bg-clip-text text-transparent uppercase group-hover:from-pink-800 group-hover:to-purple-800 dark:group-hover:from-pink-300 dark:group-hover:to-purple-300 transition-all duration-300">
              {post.title}
            </h2>
            <p className="font-aladin text-lg bg-gradient-to-r from-slate-900 via-fuchsia-950 to-pink-900 dark:from-purple-300 dark:to-pink-500 bg-clip-text text-transparent leading-tight border-l-4 border-fuchsia-900 dark:border-fuchsia-500 pl-4">
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
