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
    <div className="max-w-4xl mx-auto pt-10 space-y-10 animate-in transition-all duration-700">
      <Link to="/blog" className="inline-block items-center gap-2 font-aladin text-xl bg-gradient-to-r from-purple-950 via-fuchsia-950 to-pink-900 bg-clip-text text-transparent hover:underline transition-all duration-300">
        <ArrowLeft size={20} className="inline mr-2 text-fuchsia-900 dark:text-fuchsia-600" />
        <span>Back to Blog</span>
      </Link>

      <article className="prose prose-xl prose-slate dark:prose-invert max-w-none font-aladin prose-headings:font-aladin prose-headings:bg-gradient-to-r prose-headings:from-purple-950 prose-headings:via-fuchsia-950 prose-headings:to-pink-900 prose-headings:bg-clip-text prose-headings:text-transparent prose-p:bg-gradient-to-r prose-p:from-slate-900 prose-p:via-slate-800 prose-p:to-slate-700 dark:prose-p:from-slate-400 dark:prose-p:to-slate-600 prose-p:bg-clip-text prose-p:text-transparent prose-p:leading-tight">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </div>
  );
};

export default BlogPost;
