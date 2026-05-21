import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  source: string;
  components?: Components;
};

export function MarkdownView({ source, components }: Props) {
  return (
    <div className="markdown-view">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
