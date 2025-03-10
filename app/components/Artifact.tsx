import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArtifactProps } from '../types';

export function Artifact({ content, language }: ArtifactProps) {
    console.log('渲染 Artifact 组件:', { content, language });
    
    // 确保content有值
    const safeContent = content || '';
    
    return (
        <div className="markdown-preview">
            <Markdown remarkPlugins={[remarkGfm]}>
                {safeContent.replace(/```markdown/g, "")}
            </Markdown>
        </div>
    );
} 