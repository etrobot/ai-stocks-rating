import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { processMarkdownContent } from '../utils/markdown';
import { ArtifactProps } from '../types';

interface TipsProps {
  content: string;
  setPreviewContent?: (content: ArtifactProps) => void;
}

export function Tips({ content, setPreviewContent }: TipsProps) {
  console.log('渲染 Tips 组件，内容长度:', content.length);
  
  const { processedContent, codeBlocks } = processMarkdownContent(content);

  const handleCodeBlockClick = (content: string, language: string = 'markdown') => {
    if (setPreviewContent) {
      console.log("设置预览内容:", { content, language });
      setPreviewContent({ content, language });
    } else {
      console.log("setPreviewContent 函数未提供");
    }
  };

  return (
    <div>
      <Markdown remarkPlugins={[remarkGfm]}>
        {processedContent}
      </Markdown>
      
      {/* 渲染所有代码块卡片 */}
      {codeBlocks.map((block, index) => (
        <div 
          key={index} 
          className="my-2 p-3 border border-gray-300 rounded-md cursor-pointer hover:border-gray-500"
          onClick={() => handleCodeBlockClick(block.content, block.language)}
        >
          <div className="mb-1 font-bold text-xs text-gray-700">
            {block.language}
          </div>
          <pre className="whitespace-pre-wrap overflow-x-auto">
            <code>{block.content.slice(0, 20)}...</code>
          </pre>
        </div>
      ))}
    </div>
  );
} 