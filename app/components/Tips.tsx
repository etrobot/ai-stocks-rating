import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TipsProps {
  content: string;
  setPreviewContent?: (content: string) => void;
}

export function Tips({ content, setPreviewContent }: TipsProps) {
  // 提取所有代码块到数组
  const codeBlocks: {language: string, content: string}[] = [];
  
  // 处理内容，移除三冒号并用占位符替代
  const processedContent = content.replace(/```(.*?)\n([\s\S]*?)```/g, (match, language, codeContent, index) => {
    console.log(`[代码块提取] 完整匹配:`, match.slice(-100));

    
    // 将代码块添加到数组
    codeBlocks.push({
      language: language || "无语言",
      content: codeContent.trim()
    });
    
    // 返回Markdown注释作为占位符
    return `\n[//]: # (CODE_BLOCK_${codeBlocks.length - 1})\n`;
  });
  


  // console.log("原始内容:", content);
  console.log("处理后内容:", processedContent);


  // 添加设置预览内容的函数
  const handleCodeBlockClick = (content: string) => {
    if (setPreviewContent) {
      console.log("设置预览内容:", content);
      setPreviewContent(content);
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
          onClick={() => handleCodeBlockClick(block.content)}
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