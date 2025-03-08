import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Tips } from './Tips';
import React from 'react';

// 定义Chat组件的属性类型
interface ChatProps {
  initialMessages?: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
  }>;
  previewContent?: string;
}

export function Chat({ initialMessages = [], previewContent: initialPreviewContent }: ChatProps) {
    const [input, setInput] = useState('');
    const [error, setError] = useState<Error | null>(null);
    const [previewContent, setPreviewContent] = useState(initialPreviewContent || '');
    const [previewOpen, setPreviewOpen] = useState(Boolean(initialPreviewContent));
    const [copied, setCopied] = useState(false);

    // 将 setPreviewContent 添加到 window 对象，使其可以从 Tips 组件访问
    useEffect(() => {
        // 添加类型声明以避免 TypeScript 错误
        (window as any).setPreviewContent = (content: string) => {
            console.log("设置预览内容:", content);
            setPreviewContent(content);
            setPreviewOpen(true);
        };
        
        // 清理函数
        return () => {
            delete (window as any).setPreviewContent;
        };
    }, []);

    // 使用 useChat hook，并传入 initialMessages
    const { data, append, messages, status } = useChat({
        api: '/api/chat',
        initialMessages,
        onError: (err) => {
            console.error("聊天请求出错:", err);
            // 添加更详细的错误日志
            if (err instanceof Error) {
                console.error("错误详情:", {
                    message: err.message,
                    stack: err.stack,
                    name: err.name
                });
            } else {
                console.error("非标准错误对象:", err);
            }
            setError(err instanceof Error ? err : new Error(String(err)));
        },
        onFinish: (message) => {
            setPreviewContent(message.content)
        }
    });

    const sendMessage = async (message: string) => {
        if (!message.trim()) return;

        console.log("准备发送消息:", message);
        setError(null);

        try {
            await append({
                role: 'user',
                content: message
            });
                        
            console.log("消息发送成功");
        } catch (err) {
            console.error("发送消息时出错:", err);
            console.error("错误详细信息:", {
                error: err,
                errorType: typeof err,
                errorString: String(err)
            });

            const errorMessage = err instanceof Error
                ? `${err.message}\n${err.stack}`
                : String(err);
            setError(new Error(`发送消息失败: ${errorMessage}`));
        }
    };

    // 处理表单提交
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim() && status !== 'streaming' && status !== 'submitted') {
            sendMessage(input);
            setInput('');
        }
    };

    // 判断是否正在加载
    const isLoading = status === 'streaming' || status === 'submitted';

    // 获取最后一条消息用于预览
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex h-screen bg-background">
            {/* 左侧预览面板 */}
            {previewOpen && previewContent && (
                <div className="w-1/2 border-r border-border flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <span>Markdown 预览</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => copyToClipboard(previewContent)}
                                className="text-gray-700 hover:text-black"
                            >
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                            <button
                                onClick={() => setPreviewOpen(false)}
                            >
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        <Markdown remarkPlugins={[remarkGfm]}>
                            {previewContent}
                        </Markdown>
                    </div>
                </div>
            )}

            {/* 右侧聊天区域 */}
            <div
                className=
                    "flex flex-col flex-1 transition-all duration-300 ease-in-out">
                {/* 头部 */}
                <header className="border-b border-border p-4 flex items-center">
                    {previewContent && (
                        <button
                            onClick={() => setPreviewOpen(!previewOpen)}
                            className="flex items-center gap-2"
                        >
                            {previewOpen ? "隐藏预览" : "显示预览"}
                        </button>
                    )}
                </header>

                {/* 消息区域 */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 my-8">
                                开始一个新的对话吧！
                            </div>
                        )}

                        {messages.map((message, i) => (
                            <div key={i} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-lg px-4 py-2 w-3/4 ${
                                    message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                }`}>
                                    <div className="mb-1 text-xs text-gray-500">
                                        {message.role === 'user' ? '你' : 'AI助手'}
                                    </div>
                                    <Tips content={message.content} setPreviewContent={setPreviewContent}/>
                                </div>
                            </div>
                        ))}

                        {error && (
                            <div className="flex justify-center">
                                <div className="rounded-lg px-4 py-2 bg-red-500 text-white">
                                    错误: {error.message}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 输入区域 */}
                <div className="p-4 border-t border-border">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="输入消息..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !input.trim()}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
