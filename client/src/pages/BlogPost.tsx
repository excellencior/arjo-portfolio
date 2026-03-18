import ReactMarkdown from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BlogPost = () => {
  const { id } = useParams();

  // Mock content for now
  const content = `
# ${id ? id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Starting my Journey'}

This is a placeholder for the blog post content. Soon, this will be fetched from the backend and rendered using Markdown.

## Minimalism in Design

Minimalism isn't just about how things look; it's about how they work. By removing unnecessary elements, we can focus on the core value of our work.

- Simple
- Elegant
- Effective

Stay tuned for more updates!
  `;

  return (
    <div className="max-w-5xl mx-auto pt-10 space-y-12 animate-in transition-all duration-700 pb-32">
      <Link to="/blog" className="inline-block items-center gap-2 font-aladin text-3xl bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent hover:underline transition-all duration-300">
        <ArrowLeft size={32} className="inline mr-2 text-pink-950 dark:text-pink-100" />
        <span>Back to Blog</span>
      </Link>

      <article className="font-aladin space-y-10">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-7xl font-bold bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent uppercase tracking-tight mb-8">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-5xl font-bold bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent mt-12 mb-6">
                {children}
              </h2>
            ),
            p: ({ children }) => (
              <p className="text-3xl font-medium bg-gradient-to-r from-black via-pink-950 to-pink-900 dark:from-white dark:via-pink-100 dark:to-pink-200 bg-clip-text text-transparent leading-relaxed mb-6">
                {children}
              </p>
            ),
            li: ({ children }) => (
              <li className="text-3xl font-medium text-pink-950 dark:text-pink-100 mb-4 list-disc list-inside">
                {children}
              </li>
            ),
            ul: ({ children }) => (
              <ul className="space-y-2 mb-8 ml-4">
                {children}
              </ul>
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
};

export default BlogPost;
