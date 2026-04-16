import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownMessage({ content }: { content: string }) {
  return (
    // prose 类名会自动让 Markdown 的标题、列表、表格变得非常漂亮
    <div className="prose prose-sm md:prose-base prose-emerald max-w-none text-slate-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}