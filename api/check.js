/**
 * 世界杯开赛提醒 - Vercel Serverless Function
 * 
 * 配合 cron-job.org 使用，每 5 分钟调用一次
 * 部署后设置环境变量 PUSHPLUS_TOKEN
 */

const MATCH_SCHEDULE = [
    // A组
    { m:6, d:12, h:3,  mi:0,  n:"墨西哥 vs 南非 (A组)" },
    { m:6, d:12, h:10, mi:0,  n:"韩国 vs 捷克 (A组)" },
    { m:6, d:19, h:0,  mi:0,  n:"捷克 vs 南非 (A组)" },
    { m:6, d:19, h:9,  mi:0,  n:"墨西哥 vs 韩国 (A组)" },
    { m:6, d:25, h:9,  mi:0,  n:"捷克 vs 墨西哥 (A组)" },
    { m:6, d:25, h:9,  mi:0,  n:"南非 vs 韩国 (A组)" },
    // B组
    { m:6, d:13, h:3,  mi:0,  n:"加拿大 vs 波黑 (B组)" },
    { m:6, d:14, h:3,  mi:0,  n:"卡塔尔 vs 瑞士 (B组)" },
    { m:6, d:19, h:3,  mi:0,  n:"瑞士 vs 波黑 (B组)" },
    { m:6, d:19, h:6,  mi:0,  n:"加拿大 vs 卡塔尔 (B组)" },
    { m:6, d:25, h:3,  mi:0,  n:"瑞士 vs 加拿大 (B组)" },
    { m:6, d:25, h:3,  mi:0,  n:"波黑 vs 卡塔尔 (B组)" },
    // C组
    { m:6, d:14, h:6,  mi:0,  n:"巴西 vs 摩洛哥 (C组)" },
    { m:6, d:14, h:9,  mi:0,  n:"海地 vs 苏格兰 (C组)" },
    { m:6, d:20, h:6,  mi:0,  n:"苏格兰 vs 摩洛哥 (C组)" },
    { m:6, d:20, h:8,  mi:30, n:"巴西 vs 海地 (C组)" },
    { m:6, d:25, h:6,  mi:0,  n:"苏格兰 vs 巴西 (C组)" },
    { m:6, d:25, h:6,  mi:0,  n:"摩洛哥 vs 海地 (C组)" },
    // D组
    { m:6, d:13, h:9,  mi:0,  n:"美国 vs 巴拉圭 (D组)" },
    { m:6, d:13, h:12, mi:0,  n:"澳大利亚 vs 土耳其 (D组)" },
    { m:6, d:19, h:12, mi:0,  n:"土耳其 vs 巴拉圭 (D组)" },
    { m:6, d:20, h:3,  mi:0,  n:"美国 vs 澳大利亚 (D组)" },
    { m:6, d:26, h:10, mi:0,  n:"土耳其 vs 美国 (D组)" },
    { m:6, d:26, h:10, mi:0,  n:"巴拉圭 vs 澳大利亚 (D组)" },
    // E组
    { m:6, d:15, h:1,  mi:0,  n:"德国 vs 库拉索 (E组)" },
    { m:6, d:15, h:7,  mi:0,  n:"科特迪瓦 vs 厄瓜多尔 (E组)" },
    { m:6, d:21, h:4,  mi:0,  n:"德国 vs 科特迪瓦 (E组)" },
    { m:6, d:21, h:8,  mi:0,  n:"厄瓜多尔 vs 库拉索 (E组)" },
    { m:6, d:26, h:4,  mi:0,  n:"厄瓜多尔 vs 德国 (E组)" },
    { m:6, d:26, h:4,  mi:0,  n:"库拉索 vs 科特迪瓦 (E组)" },
    // F组
    { m:6, d:15, h:4,  mi:0,  n:"荷兰 vs 日本 (F组)" },
    { m:6, d:15, h:10, mi:0,  n:"瑞典 vs 突尼斯 (F组)" },
    { m:6, d:20, h:12, mi:0,  n:"突尼斯 vs 日本 (F组)" },
    { m:6, d:21, h:1,  mi:0,  n:"荷兰 vs 瑞典 (F组)" },
    { m:6, d:26, h:7,  mi:0,  n:"日本 vs 瑞典 (F组)" },
    { m:6, d:26, h:7,  mi:0,  n:"突尼斯 vs 荷兰 (F组)" },
    // G组
    { m:6, d:16, h:3,  mi:0,  n:"比利时 vs 埃及 (G组)" },
    { m:6, d:16, h:9,  mi:0,  n:"伊朗 vs 新西兰 (G组)" },
    { m:6, d:22, h:3,  mi:0,  n:"比利时 vs 伊朗 (G组)" },
    { m:6, d:22, h:9,  mi:0,  n:"新西兰 vs 埃及 (G组)" },
    { m:6, d:27, h:11, mi:0,  n:"埃及 vs 伊朗 (G组)" },
    { m:6, d:27, h:11, mi:0,  n:"新西兰 vs 比利时 (G组)" },
    // H组
    { m:6, d:16, h:0,  mi:0,  n:"西班牙 vs 佛得角 (H组)" },
    { m:6, d:16, h:6,  mi:0,  n:"沙特 vs 乌拉圭 (H组)" },
    { m:6, d:22, h:0,  mi:0,  n:"西班牙 vs 沙特 (H组)" },
    { m:6, d:22, h:6,  mi:0,  n:"乌拉圭 vs 佛得角 (H组)" },
    { m:6, d:27, h:8,  mi:0,  n:"佛得角 vs 沙特 (H组)" },
    { m:6, d:27, h:8,  mi:0,  n:"乌拉圭 vs 西班牙 (H组)" },
    // I组
    { m:6, d:17, h:3,  mi:0,  n:"法国 vs 塞内加尔 (I组)" },
    { m:6, d:17, h:6,  mi:0,  n:"伊拉克 vs 挪威 (I组)" },
    { m:6, d:23, h:5,  mi:0,  n:"法国 vs 伊拉克 (I组)" },
    { m:6, d:23, h:8,  mi:0,  n:"挪威 vs 塞内加尔 (I组)" },
    { m:6, d:27, h:3,  mi:0,  n:"挪威 vs 法国 (I组)" },
    { m:6, d:27, h:3,  mi:0,  n:"塞内加尔 vs 伊拉克 (I组)" },
    // J组
    { m:6, d:16, h:12, mi:0,  n:"奥地利 vs 约旦 (J组)" },
    { m:6, d:17, h:9,  mi:0,  n:"阿根廷 vs 阿尔及利亚 (J组)" },
    { m:6, d:23, h:1,  mi:0,  n:"阿根廷 vs 奥地利 (J组)" },
    { m:6, d:23, h:11, mi:0,  n:"约旦 vs 阿尔及利亚 (J组)" },
    { m:6, d:28, h:10, mi:0,  n:"阿尔及利亚 vs 奥地利 (J组)" },
    { m:6, d:28, h:10, mi:0,  n:"约旦 vs 阿根廷 (J组)" },
    // K组
    { m:6, d:18, h:1,  mi:0,  n:"葡萄牙 vs 刚果(金) (K组)" },
    { m:6, d:18, h:10, mi:0,  n:"乌兹别克 vs 哥伦比亚 (K组)" },
    { m:6, d:24, h:1,  mi:0,  n:"葡萄牙 vs 乌兹别克 (K组)" },
    { m:6, d:24, h:10, mi:0,  n:"哥伦比亚 vs 刚果(金) (K组)" },
    { m:6, d:28, h:7,  mi:30, n:"哥伦比亚 vs 葡萄牙 (K组)" },
    { m:6, d:28, h:7,  mi:30, n:"刚果(金) vs 乌兹别克 (K组)" },
    // L组
    { m:6, d:18, h:4,  mi:0,  n:"英格兰 vs 克罗地亚 (L组)" },
    { m:6, d:18, h:7,  mi:0,  n:"加纳 vs 巴拿马 (L组)" },
    { m:6, d:24, h:4,  mi:0,  n:"英格兰 vs 加纳 (L组)" },
    { m:6, d:24, h:7,  mi:0,  n:"巴拿马 vs 克罗地亚 (L组)" },
    { m:6, d:28, h:5,  mi:0,  n:"巴拿马 vs 英格兰 (L组)" },
    { m:6, d:28, h:5,  mi:0,  n:"克罗地亚 vs 加纳 (L组)" },
    // 淘汰赛
    { m:6, d:29, h:1,  mi:0,  n:"1/16决赛 第1场" },
    { m:6, d:29, h:4,  mi:0,  n:"1/16决赛 第2场" },
    { m:6, d:29, h:7,  mi:0,  n:"1/16决赛 第3场" },
    { m:6, d:29, h:10, mi:0,  n:"1/16决赛 第4场" },
    { m:6, d:30, h:1,  mi:0,  n:"1/16决赛 第5场" },
    { m:6, d:30, h:4,  mi:0,  n:"1/16决赛 第6场" },
    { m:6, d:30, h:7,  mi:0,  n:"1/16决赛 第7场" },
    { m:6, d:30, h:10, mi:0,  n:"1/16决赛 第8场" },
    { m:7, d:1,  h:1,  mi:0,  n:"1/16决赛 第9场" },
    { m:7, d:1,  h:4,  mi:0,  n:"1/16决赛 第10场" },
    { m:7, d:1,  h:7,  mi:0,  n:"1/16决赛 第11场" },
    { m:7, d:1,  h:10, mi:0,  n:"1/16决赛 第12场" },
    { m:7, d:2,  h:1,  mi:0,  n:"1/16决赛 第13场" },
    { m:7, d:2,  h:4,  mi:0,  n:"1/16决赛 第14场" },
    { m:7, d:2,  h:7,  mi:0,  n:"1/16决赛 第15场" },
    { m:7, d:2,  h:10, mi:0,  n:"1/16决赛 第16场" },
    { m:7, d:5,  h:3,  mi:0,  n:"1/8决赛 第1场" },
    { m:7, d:5,  h:7,  mi:0,  n:"1/8决赛 第2场" },
    { m:7, d:5,  h:11, mi:0,  n:"1/8决赛 第3场" },
    { m:7, d:6,  h:3,  mi:0,  n:"1/8决赛 第4场" },
    { m:7, d:6,  h:7,  mi:0,  n:"1/8决赛 第5场" },
    { m:7, d:6,  h:11, mi:0,  n:"1/8决赛 第6场" },
    { m:7, d:7,  h:3,  mi:0,  n:"1/8决赛 第7场" },
    { m:7, d:7,  h:7,  mi:0,  n:"1/8决赛 第8场" },
    { m:7, d:10, h:3,  mi:0,  n:"1/4决赛 第1场" },
    { m:7, d:11, h:3,  mi:0,  n:"1/4决赛 第2场" },
    { m:7, d:12, h:4,  mi:0,  n:"1/4决赛 第3场" },
    { m:7, d:12, h:8,  mi:0,  n:"1/4决赛 第4场" },
    { m:7, d:15, h:3,  mi:0,  n:"半决赛 第1场" },
    { m:7, d:16, h:3,  mi:0,  n:"半决赛 第2场" },
    { m:7, d:19, h:4,  mi:0,  n:"三四名决赛" },
    { m:7, d:20, h:3,  mi:0,  n:"🏆 世界杯决赛" },
];

/** 获取北京时间的Date对象 */
function getBeijingNow() {
    const now = new Date();
    const bjStr = now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
    return new Date(bjStr);
}

/** 赛事转为UTC时间戳（比赛时间按北京时间传入，转UTC用于比较） */
function getMatchTs(match) {
    return Date.UTC(2026, match.m - 1, match.d, match.h - 8, match.mi, 0);
}

/** 发送PushPlus推送 */
async function sendPush(token, title, content) {
    const url = "https://www.pushplus.plus/send";
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, title, content, template: "txt" }),
    });
    return res.ok;
}

export default async function handler(req, res) {
    // 只接受GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const token = process.env.PUSHPLUS_TOKEN;
    if (!token) {
        return res.status(500).json({ error: "PUSHPLUS_TOKEN not set" });
    }

    const now = getBeijingNow();
    const nowTs = now.getTime();
    const nowStr = `${String(now.getMonth()+1).padStart(2,'0')}月${String(now.getDate()).padStart(2,'0')}日 ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    let nextMatch = null;
    let sentCount = 0;
    const results = [];

    for (const match of MATCH_SCHEDULE) {
        const matchTs = getMatchTs(match);

        // 开赛后15分钟内发提醒
        if (nowTs >= matchTs && nowTs < matchTs + 900000) {
            const title = `⚽ ${match.n} 已开赛`;
            const content = `⏰ ${nowStr}\n\n⚽ ${match.n} 已开赛！\n\n💰 5分钟后开始抢红包，记得打开 APP！\n📱 虎扑娱乐 / 大江 等红包开放`;
            try {
                const ok = await sendPush(token, title, content);
                sentCount++;
                results.push({ match: match.n, sent: ok });
            } catch (e) {
                results.push({ match: match.n, error: e.message });
            }
        }

        // 记录下一场
        if (matchTs > nowTs && (!nextMatch || matchTs < getMatchTs(nextMatch))) {
            nextMatch = match;
        }
    }

    const nextStr = nextMatch
        ? `${nextMatch.n} - ${String(nextMatch.m).padStart(2,'0')}月${String(nextMatch.d).padStart(2,'0')}日 ${String(nextMatch.h).padStart(2,'0')}:${String(nextMatch.mi).padStart(2,'0')}`
        : "无";

    return res.json({
        time: `北京时间 ${nowStr}`,
        matches: MATCH_SCHEDULE.length,
        sent: sentCount,
        next: nextStr,
        details: results,
    });
}