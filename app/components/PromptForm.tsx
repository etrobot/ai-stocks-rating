import * as React from 'react'
import Textarea from 'react-textarea-autosize'

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
            console.log('组件加载，聚焦输入框')
            inputRef.current.focus()
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('提交表单，当前输入内容:', input)
        
        if (!input?.trim()) {
            console.log('输入为空，忽略提交')
            return
        }
        
        // 在发送前捕获输入内容并立即清空输入框
        const messageToSend = input
        setInput('')
        console.log('点击发送按钮，已清空输入，待发送内容:', messageToSend)
        
        await onSubmit(messageToSend)
        console.log('表单提交完成')
    }

    return (
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
            <div className="relative">
                <Textarea
                    ref={inputRef}
                    tabIndex={0}
                    rows={1}
                    value={input}
                    onChange={(e) => {
                        console.log('输入变化, 新输入内容:', e.target.value)
                        setInput(e.target.value)
                    }}
                    placeholder="发送消息..."
                    spellCheck={false}
                    className="min-h-[60px] w-full resize-none bg-transparent px-4 focus-within:outline-none text-base"
                    disabled={isLoading}
                />
            </div>
            <div className="flex justify-end mt-2 gap-2">
                <button 
                    type="button"
                    onClick={() => {
                        console.log('清空输入, 当前输入内容:', input)
                        setInput('')
                    }}
                    disabled={isLoading || input === ''}
                    className="btn btn-secondary"
                >
                    清空
                </button>
                <button 
                    disabled={isLoading || input === ''}
                    className="btn btn-primary"
                >
                    发送
                </button>
            </div>
        </form>
    )
} 