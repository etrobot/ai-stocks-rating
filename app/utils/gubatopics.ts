import { stockZhIndexDailyEm } from './stockdata';


interface Stock {
  name?: string;
  qcode?: string;
}

interface TopicItem {
  nickname?: string;
  desc?: string;
  stock_list?: Stock[];
}

interface ApiResponse {
  re?: TopicItem[];
}


/**
 * 获取热门话题
 */
export async function getTopics(): Promise<string | null> {
  const REF = 'https://gubatopic.eastmoney.com/';
  
  const headers = {
    'User-Agent': 'Mozilla',
    'Referer': REF,
  };
  
  const url = 'https://gubatopic.eastmoney.com/interface/GetData.aspx?path=newtopic/api/Topic/HomePageListRead';
  const data = {
    'param': 'ps=10&p=1&type=0',
    'path': 'newtopic/api/Topic/HomePageListRead',
    'env': '2',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data).toString(),
    });

    if (!response.ok) {
      console.log(`请求失败，状态码: ${response.status}`);
      return null;
    }

    const apiData: ApiResponse = await response.json();

    const parsedResults: string[] = [];
    const addedStocks = new Set<string>();
    
    for (const item of apiData.re || []) {
      const title = item.nickname || '无标题';
      const desc = item.desc || '无描述';
      const stocks = item.stock_list || [];

      const relatedStocks: string[] = [];
      for (const stock of stocks) {
        const name = stock.name || '未知股票';
        const qcode = stock.qcode || '未知代码';
        const stockInfo = `${qcode}${name}`;
        
        if (!addedStocks.has(stockInfo)) {
          relatedStocks.push(stockInfo);
          addedStocks.add(stockInfo);
        }
      }

      const relatedStocksStr = relatedStocks.length > 0 ? relatedStocks.join(" ") : "无关联股票";
      const paragraph = `### ${title}\n${desc}\n关联股：${relatedStocksStr}\n`;
      parsedResults.push(paragraph);
    }

    return parsedResults.join("\n");
  } catch (error) {
    console.error('获取话题数据时出错:', error);
    return null;
  }
}