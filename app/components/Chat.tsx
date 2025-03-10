import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Tips } from './Tips';
import React from 'react';
import { SunIcon, MoonIcon, EyeIcon, EyeSlashIcon, DocumentDuplicateIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import { prompts } from '../utils/prompt';
import { PromptForm } from './PromptForm';

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
    const [previewOpen, setPreviewOpen] = useState(true);
    const [copied, setCopied] = useState(false);
    const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
    const [theme, setTheme] = useState('light');
    const [chatVisible, setChatVisible] = useState(true);
    const [showPrompts, setShowPrompts] = useState(false);

    // 主题切换函数
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        // 添加主题保存到 localStorage
        localStorage.setItem('theme', newTheme);
        console.log('主题已切换并保存:', newTheme);
    };

    // 初始化主题
    useEffect(() => {
        // 优先从 localStorage 读取主题设置
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        console.log('初始化主题:', savedTheme);
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
            console.log("聊天响应完成，包含思考过程:", {
                message,
                data,
                reasoning: message.reasoning
            });
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
    const handleSubmit = async (value: string) => {
        console.log("准备发送消息:", value);
        if (value.trim() && status !== 'streaming' && status !== 'submitted') {
            try {
                await sendMessage(value);
            } catch (err) {
                console.error("处理提交时出错:", err);
            }
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

    useEffect(() => {
        console.log("Header heights updated:", {
            previewHeader: document.querySelector('.preview-header')?.clientHeight,
            chatHeader: document.querySelector('header')?.clientHeight
        });
    }, [previewOpen]);

    // 处理快捷提示词选择
    const handlePromptSelect = (promptContent: string) => {
        console.log("选择提示词:", promptContent);
        setInput(promptContent);
        setShowPrompts(false);
    };

    return (
        <div className="flex h-screen bg-background">
            {/* 左侧预览面板 */}
            {previewOpen && (
                <div className={`${chatVisible ? 'w-3/5' : 'w-full'} border-r border-border flex flex-col transition-all duration-300 ease-in-out`}>
                    <div className="flex items-center justify-between p-1 border-b border-border">
                        <div className="flex items-center gap-2">
                            <span>Markdown 预览</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => copyToClipboard(previewContent)}
                                className="btn btn-ghost btn-sm"
                                title="复制"
                            >
                                <DocumentDuplicateIcon className={`h-5 w-5 ${copied ? "text-green-500" : ""}`} />
                            </button>
                            <button
                                onClick={() => setChatVisible(!chatVisible)}
                                className="btn btn-ghost btn-sm"
                                title={chatVisible ? "最大化预览" : "恢复布局"}
                            >
                                {chatVisible ? (
                                    <ArrowsPointingOutIcon className="h-5 w-5" />
                                ) : (
                                    <ArrowsPointingInIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto px-4 py-1">
                        <div className="markdown-preview">
                            <Markdown remarkPlugins={[remarkGfm]}>
                                {previewContent.replace(/```markdown/g, "")}
                            </Markdown>
                        </div>
                    </div>
                </div>
            )}

            {/* 右侧聊天区域 */}
            {chatVisible && (
                <div
                    className=
                        "flex flex-col flex-1 transition-all duration-200 ease-in-out">
                    {/* 头部 */}
                    <header className="flex items-center justify-between p-1 border-b border-border">
                        <div>
                            {
                                <button
                                    onClick={() => setPreviewOpen(!previewOpen)}
                                    className="btn btn-ghost btn-sm"
                                    title={previewOpen ? "隐藏预览" : "显示预览"}
                                >
                                    {previewOpen ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            }
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="btn btn-xs btn-ghost btn-circle"
                            title={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
                        >
                            {theme === 'dark' ? (
                                <SunIcon className="h-5 w-5" />
                            ) : (
                                <MoonIcon className="h-5 w-5" />
                            )}
                        </button>
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
                                    <div className={`rounded-lg  w-4/5 ${
                                        message.role === 'user'
                                            ? 'bg-gray-400 text-white p-2'
                                            : 'bg-muted'
                                    }`}>
                                        <div className="mb-1 text-xs">
                                            {message.role === 'user' ? '你' : 'AI助手'}
                                        </div>
                                        
                                        {message.role === 'assistant' && (message.reasoning || (data && data.length > 0)) && (
                                            <div className="text-sm text-gray-600">
                                                <div 
                                                    className="flex items-center cursor-pointer rounded"
                                                    onClick={() => {
                                                        setExpandedMessages(prev => {
                                                            const newSet = new Set(prev);
                                                            if (newSet.has(i)) {
                                                                newSet.delete(i);
                                                            } else {
                                                                newSet.add(i);
                                                            }
                                                            return newSet;
                                                        });
                                                        console.log(`切换消息 ${i} 的展开状态`);
                                                    }}
                                                >
                                                    <span className="mr-2">
                                                        {expandedMessages.has(i) ? '▼' : '▶'}
                                                    </span>
                                                    <span className="font-medium">思考过程</span>
                                                </div>
                                                
                                                {expandedMessages.has(i) && (
                                                    <div className="ml-2 p-2 border-l border-gray-300">
                                                        {data && data.length > 0 && (
                                                            <div className="mb-2">
                                                                {data.map((item, index) => (
                                                                    <div key={index} className="mb-1">
                                                                        {item?.toString()}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {message.reasoning}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <Tips content={message.content} setPreviewContent={setPreviewContent}/>
                                    </div>
                                </div>
                            ))}

                            {error && (
                                <div className="flex justify-center">
                                    <div className="rounded-lg  bg-red-500 text-white">
                                        错误: {error.message}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 输入区域 */}
                    <div>
                        {/* 快捷提示词按钮区域 */}
                        <div className="max-w-3xl mx-auto px-4 py-1">
                            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                                {prompts.map((prompt, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => handlePromptSelect(prompt.content)}
                                        className="btn btn-xs btn-outline whitespace-nowrap flex-shrink-0"
                                        title={prompt.content}
                                    >
                                        {prompt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <PromptForm
                            input={input}
                            setInput={setInput}
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
