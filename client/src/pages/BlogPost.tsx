import ReactMarkdown from 'react-markdown';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BlogPost = () => {
  const { id } = useParams();

  // Mock content for now
  const content = `
# Starting my Journey

This is a placeholder for the blog post content. Soon, this will be fetched from the backend and rendered using Markdown.

## Minimalism in Design

Minimalism isn't just about how things look; it's about how they work. By removing unnecessary elements, we can focus on the core value of our work.

- Simple
- Elegant
- Effective

Stay tuned for more updates!
  `;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in transition-all duration-500">
      <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
        <ArrowLeft size={16} />
        <span>Back to Blog</span>
      </Link>

      <article className="prose prose-gray dark:prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </div>
  );
};

export default BlogPost;
