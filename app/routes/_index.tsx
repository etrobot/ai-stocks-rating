import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Chat } from "~/components/Chat";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Chat App" },
    { name: "description", content: "Chat with AI" },
  ];
};

export default function Index() {
  const [initialMessages, setInitialMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
  }>>([]);
  const [previewContent, setPreviewContent] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDailyStocks = async () => {
      console.log("正在获取每日热门话题数据...");
      try {
        setLoading(true);
        const response = await fetch('/api/dailystocks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("获取到的热门话题数据:", data);
        
        if (data.topics) {
          const preview = `# 今日热门话题\n\n${data.topics}\n\n_数据更新时间: ${new Date(data.timestamp).toLocaleString()}_`;
          setInitialMessages([{
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: new Date().toLocaleDateString() + "\n```markdown\n" + preview + "\n```",
          }]);
          setPreviewContent(preview);
          console.log("成功准备热门话题消息");
        }
      } catch (err) {
        console.error("获取热门话题数据时出错:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyStocks();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">正在加载热门话题数据...</div>;
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="text-red-500">加载热门话题数据时出错: {error.message}</div>
        <Chat initialMessages={[]} />
      </div>
    );
  }

  return <Chat 
    initialMessages={initialMessages} 
    previewContent={previewContent}
  />;
}