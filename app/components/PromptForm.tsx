import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { prompts } from '../utils/prompt'

interface PromptFormProps {
    input: string
    setInput: (value: string) => void
    onSubmit: (value: string) => void
    isLoading: boolean
}

export function PromptForm({ input, setInput, onSubmit, isLoading }: PromptFormProps) {
    const inputRef = React.useRef<HTMLTextAreaElement>(null)

    // 组件加载时自动聚焦输入框
    React.useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    /* 新增提交消息方法 */
    const submitMessage = async () => {
        if (!input?.trim()) {
            return;
        }
        const messageToSend = input;
        setInput('');
        await onSubmit(messageToSend);
    };

    /* 修改 handleSubmit 方法 */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitMessage();
    };

    // 新增方法：处理提示词选择
    const handlePromptSelect = (promptContent: string) => {
        setInput(promptContent);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto border p-2 mb-2 rounded">
            <div className="relative">
                <Textarea
                    ref={inputRef}
                    tabIndex={0}
                    rows={1}
                    value={input}
                    onChange={(e) => {
                        console.log('输入变化, 新输入内容:', e.target.value);
                        setInput(e.target.value);
                    }}
                    onKeyDown={async (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            console.log('按回车发送, 当前输入内容:', input);
                            await submitMessage();
                        }
                    }}
                    placeholder="发送消息..."
                    spellCheck={false}
                    className="min-h-[60px] w-full resize-none bg-transparent focus-within:outline-none text-base"
                    disabled={isLoading}
                />
            </div>
            <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center overflow-x-auto hide-scrollbar">
                    {prompts.map((prompt, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => { 
                                handlePromptSelect(prompt.content);
                            }}
                            className="btn btn-xs btn-outline whitespace-nowrap flex-shrink-0"
                            title={prompt.content}
                        >
                            {prompt.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setInput('');
                        }}
                        disabled={isLoading || input === ''}
                        className="btn btn-secondary btn-sm"
                    >
                        清空
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || input === ''}
                        className="btn btn-primary btn-sm"
                    >
                        发送
                    </button>
                </div>
            </div>
        </form>
    );
} 