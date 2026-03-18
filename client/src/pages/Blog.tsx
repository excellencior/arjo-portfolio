import { Link } from 'react-router-dom';

const posts = [
  { id: '1', title: 'Starting my Journey', date: 'March 18, 2026', excerpt: 'Looking back at how it all started and where I am headed.', readTime: '5 min read' },
  { id: '2', title: 'Why Minimalism Matters', date: 'March 15, 2026', excerpt: 'Exploring the beauty of simple design in a complex world.', readTime: '3 min read' }
];

const Blog = () => {
  return (
    <div className="space-y-12 animate-in transition-all duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Blog</h1>
        <p className="text-gray-600 dark:text-gray-400">Thoughts, stories, and technical insights.</p>
      </div>

      <div className="grid gap-8">
        {posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.id}`} className="group block space-y-3">
            <p className="text-sm text-gray-500 dark:text-gray-500">{post.date} • {post.readTime}</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">{post.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{post.excerpt}</p>
            <div className="pt-2">
              <span className="text-sm font-medium text-blue-500 dark:text-blue-400 group-hover:underline">Read more →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blog;
