
/**
 * 股票指数数据接口
 */
interface StockIndexData {
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    amount: number;
}
/**
 * 格式化日期为YYYYMMDD格式
 */
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * 获取东方财富网股票指数数据
 * @param symbol 带市场标识的指数代码; sz: 深交所, sh: 上交所, csi: 中信指数
 * @param startDate 开始时间 格式：YYYYMMDD
 * @param endDate 结束时间 格式：YYYYMMDD
 * @returns 指数数据
 */
export async function stockZhIndexDailyEm(
    symbol: string = "csi931151",
    startDate: string = "19900101",
    endDate: string = "20500101"
): Promise<StockIndexData[]> {
    const marketMap: Record<string, string> = { "sz": "0", "sh": "1", "csi": "2" };
    const url = "https://push2his.eastmoney.com/api/qt/stock/kline/get";

    let secid = "";
    if (symbol.includes("sz")) {
        secid = `${marketMap["sz"]}.${symbol.replace("sz", "")}`;
    } else if (symbol.includes("sh")) {
        secid = `${marketMap["sh"]}.${symbol.replace("sh", "")}`;
    } else if (symbol.includes("csi")) {
        secid = `${marketMap["csi"]}.${symbol.replace("csi", "")}`;
    } else {
        console.log("无效的股票指数代码");
        return [];
    }

    const params = {
        "cb": "jQuery1124033485574041163946_1596700547000",
        "secid": secid,
        "ut": "fa5fd1943c7b386f172d6893dbfba10b",
        "fields1": "f1,f2,f3,f4,f5",
        "fields2": "f51,f52,f53,f54,f55,f56,f57,f58",
        "klt": "101",  // 日频率
        "fqt": "0",
        "beg": startDate,
        "end": endDate,
        "_": Date.now().toString(),
    };

    try {
        // 构建URL查询参数
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            queryParams.append(key, value);
        }

        const response = await fetch(`${url}?${queryParams.toString()}`);

        if (!response.ok) {
            console.log(`请求失败，状态码: ${response.status}`);
            return [];
        }

        const dataText = await response.text();
        // 提取JSON部分并解析
        const jsonStart = dataText.indexOf("{");
        const jsonEnd = dataText.lastIndexOf("}") + 1;
        const jsonStr = dataText.substring(jsonStart, jsonEnd);

        const dataJson = JSON.parse(jsonStr);

        if (!dataJson.data || !dataJson.data.klines || dataJson.data.klines.length === 0) {
            console.log("未获取到数据");
            return [];
        }

        // 解析数据
        const result: StockIndexData[] = dataJson.data.klines.map((item: string) => {
            const [date, open, close, high, low, volume, amount] = item.split(",");
            return {
                date,
                open: parseFloat(open),
                close: parseFloat(close),
                high: parseFloat(high),
                low: parseFloat(low),
                volume: parseFloat(volume),
                amount: parseFloat(amount)
            };
        });

        return result;
    } catch (error) {
        console.error("获取股票指数数据时出错:", error);
        return [];
    }
}


/**
 * 获取默认日期范围
 */
export function getDefaultDates(startDate?: Date, endDate?: Date): [Date, Date] {
    if (!endDate) {
        endDate = new Date();
    }
    if (!startDate) {
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 14); // 7*2天
    }
    return [startDate, endDate];
}


/**
 * 更新获取交易日函数，使用新添加的stockZhIndexDailyEm方法
 */
export async function getTradingDays(startDate?: Date, endDate?: Date): Promise<string[]> {
    const [start, end] = getDefaultDates(startDate, endDate);

    try {
        const indexData = await stockZhIndexDailyEm(
            "sh000001",
            formatDate(start),
            formatDate(end)
        );

        // 提取交易日期
        return indexData.map(item => item.date.replace(/-/g, ""));
    } catch (error) {
        console.error("获取交易日数据时出错:", error);
        return [];
    }
}
