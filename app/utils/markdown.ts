interface CodeBlock {
    language: string;
    content: string;
}

export function processMarkdownContent(content: string): {
    processedContent: string;
    codeBlocks: CodeBlock[];
} {
    const codeBlocks: CodeBlock[] = [];
        
    const processedContent = content.replace(/```(.*?)\n([\s\S]*?)```/g, (match, language, codeContent, index) => {
        console.log(`[代码块提取] 语言: ${language}, 内容长度: ${codeContent.length}`);
        
        codeBlocks.push({
            language: language || "markdown",
            content: codeContent.trim()
        });
        
        return `\n[//]: # (CODE_BLOCK_${codeBlocks.length - 1})\n`;
    });
        
    return {
        processedContent,
        codeBlocks
    };
} 