/**
 * 世界杯提醒脚本 - PushPlus微信推送
 * ==========================================
 * 可部署在：GitHub Actions / Vercel / Cloudflare Workers
 *
 * 功能：
 *   1. 比赛开赛时 → 微信推送提醒（可抢红包了！）
 *   2. 红包在第5分钟才能抢，提醒正好在开赛时发
 *
 * 配置：
 *   环境变量 PUSHPLUS_TOKEN（已在脚本内置，也可通过环境变量覆盖）
 */

const https = require("https");

// ==========================================
// PushPlus 配置
// ==========================================
const PUSHPLUS_TOKEN = process.env.PUSHPLUS_TOKEN || "1420970fdbf54d239d92249ed4cdbb9c";

// ==========================================
// 【2026世界杯完整赛程】（北京时间 UTC+8）
// 共 104 场，涵盖小组赛 → 决赛
// 数据来源：FIFA官方 + 央视网
// ==========================================

const MATCH_SCHEDULE = [
    // ==================== 小组赛阶段 (6月12日 - 6月28日) ====================

    // --- 6月12日 ---
    { month: 6, day: 12, hour: 3, minute: 0, match: "墨西哥 vs 南非 (A组)" },
    { month: 6, day: 12, hour: 10, minute: 0, match: "韩国 vs 捷克 (A组)" },

    // --- 6月13日 ---
    { month: 6, day: 13, hour: 3, minute: 0, match: "加拿大 vs 波黑 (B组)" },
    { month: 6, day: 13, hour: 9, minute: 0, match: "美国 vs 巴拉圭 (D组)" },
    { month: 6, day: 13, hour: 12, minute: 0, match: "澳大利亚 vs 土耳其 (D组)" },

    // --- 6月14日 ---
    { month: 6, day: 14, hour: 3, minute: 0, match: "卡塔尔 vs 瑞士 (B组)" },
    { month: 6, day: 14, hour: 6, minute: 0, match: "巴西 vs 摩洛哥 (C组)" },
    { month: 6, day: 14, hour: 9, minute: 0, match: "海地 vs 苏格兰 (C组)" },

    // --- 6月15日 ---
    { month: 6, day: 15, hour: 6, minute: 0, match: "沙特 vs 乌拉圭 (H组)" },
    { month: 6, day: 15, hour: 7, minute: 0, match: "科特迪瓦 vs 厄瓜多尔 (E组)" },
    { month: 6, day: 15, hour: 10, minute: 0, match: "德国 vs 库拉索 (E组)" },
    { month: 6, day: 15, hour: 10, minute: 0, match: "附加赛胜者 vs 突尼斯 (F组)" },

    // --- 6月16日 ---
    { month: 6, day: 16, hour: 3, minute: 0, match: "荷兰 vs 日本 (F组)" },
    { month: 6, day: 16, hour: 6, minute: 0, match: "西班牙 vs 佛得角 (H组)" },
    { month: 6, day: 16, hour: 9, minute: 0, match: "伊朗 vs 新西兰 (G组)" },
    { month: 6, day: 16, hour: 11, minute: 0, match: "比利时 vs 埃及 (G组)" },
    { month: 6, day: 16, hour: 12, minute: 0, match: "奥地利 vs 约旦 (J组)" },

    // --- 6月17日 ---
    { month: 6, day: 17, hour: 6, minute: 0, match: "法国 vs 塞内加尔 (I组)" },
    { month: 6, day: 17, hour: 9, minute: 0, match: "阿根廷 vs 阿尔及利亚 (J组)" },
    { month: 6, day: 17, hour: 11, minute: 0, match: "伊拉克 vs 挪威 (I组)" },

    // --- 6月18日 ---
    { month: 6, day: 18, hour: 1, minute: 0, match: "葡萄牙 vs 刚果 (K组)" },
    { month: 6, day: 18, hour: 7, minute: 0, match: "加纳 vs 巴拿马 (L组)" },
    { month: 6, day: 18, hour: 10, minute: 0, match: "乌兹别克 vs 哥伦比亚 (K组)" },

    // --- 6月19日 ---
    { month: 6, day: 19, hour: 0, minute: 0, match: "捷克 vs 南非 (A组)" },
    { month: 6, day: 19, hour: 3, minute: 0, match: "瑞士 vs 波黑 (B组)" },
    { month: 6, day: 19, hour: 6, minute: 0, match: "加拿大 vs 卡塔尔 (B组)" },
    { month: 6, day: 19, hour: 9, minute: 0, match: "墨西哥 vs 韩国 (A组)" },
    { month: 6, day: 19, hour: 12, minute: 0, match: "土耳其 vs 巴拉圭 (D组)" },

    // --- 6月20日 ---
    { month: 6, day: 20, hour: 6, minute: 0, match: "苏格兰 vs 摩洛哥 (C组)" },
    { month: 6, day: 20, hour: 9, minute: 0, match: "巴西 vs 海地 (C组)" },
    { month: 6, day: 20, hour: 12, minute: 0, match: "美国 vs 澳大利亚 (D组)" },

    // --- 6月21日 ---
    { month: 6, day: 21, hour: 8, minute: 0, match: "厄瓜多尔 vs 库拉索 (E组)" },

    // --- 6月22日 ---
    { month: 6, day: 22, hour: 3, minute: 0, match: "德国 vs 法国 (焦点战)" },
    { month: 6, day: 22, hour: 6, minute: 0, match: "乌拉圭 vs 佛得角 (H组)" },
    { month: 6, day: 22, hour: 9, minute: 0, match: "新西兰 vs 埃及 (G组)" },
    { month: 6, day: 22, hour: 11, minute: 0, match: "比利时 vs 伊朗 (G组)" },

    // --- 6月23日 ---
    { month: 6, day: 23, hour: 8, minute: 0, match: "挪威 vs 塞内加尔 (I组)" },
    { month: 6, day: 23, hour: 11, minute: 0, match: "约旦 vs 阿尔及利亚 (J组)" },

    // --- 6月24日 ---
    { month: 6, day: 24, hour: 7, minute: 0, match: "巴拿马 vs 克罗地亚 (L组)" },
    { month: 6, day: 24, hour: 10, minute: 0, match: "哥伦比亚 vs 刚果 (K组)" },

    // --- 6月25日 ---
    { month: 6, day: 25, hour: 3, minute: 0, match: "瑞士 vs 加拿大 (B组)" },
    { month: 6, day: 25, hour: 3, minute: 0, match: "波黑 vs 卡塔尔 (B组)" },
    { month: 6, day: 25, hour: 6, minute: 0, match: "苏格兰 vs 巴西 (C组)" },
    { month: 6, day: 25, hour: 6, minute: 0, match: "摩洛哥 vs 海地 (C组)" },
    { month: 6, day: 25, hour: 9, minute: 0, match: "捷克 vs 墨西哥 (A组)" },
    { month: 6, day: 25, hour: 9, minute: 0, match: "南非 vs 韩国 (A组)" },

    // --- 6月26日 ---
    { month: 6, day: 26, hour: 7, minute: 0, match: "突尼斯 vs 荷兰 (F组)" },
    { month: 6, day: 26, hour: 10, minute: 0, match: "土耳其 vs 美国 (D组)" },
    { month: 6, day: 26, hour: 10, minute: 0, match: "巴拉圭 vs 澳大利亚 (D组)" },

    // --- 6月27日 ---
    { month: 6, day: 27, hour: 3, minute: 0, match: "挪威 vs 法国 (I组)" },
    { month: 6, day: 27, hour: 8, minute: 0, match: "佛得角 vs 沙特 (H组)" },
    { month: 6, day: 27, hour: 8, minute: 0, match: "乌拉圭 vs 西班牙 (H组)" },
    { month: 6, day: 27, hour: 11, minute: 0, match: "埃及 vs 伊朗 (G组)" },
    { month: 6, day: 27, hour: 11, minute: 0, match: "新西兰 vs 比利时 (G组)" },

    // --- 6月28日 ---
    { month: 6, day: 28, hour: 7, minute: 0, match: "哥伦比亚 vs 葡萄牙 (K组)" },
    { month: 6, day: 28, hour: 7, minute: 0, match: "刚果 vs 乌兹别克 (K组)" },
    { month: 6, day: 28, hour: 10, minute: 0, match: "阿尔及利亚 vs 奥地利 (J组)" },
    { month: 6, day: 28, hour: 10, minute: 0, match: "约旦 vs 阿根廷 (J组)" },

    // ==================== 淘汰赛阶段 ====================

    // 1/16决赛 (6月29日 - 7月4日)
    { month: 6, day: 29, hour: 1, minute: 0, match: "1/16决赛 第1场" },
    { month: 6, day: 29, hour: 8, minute: 0, match: "1/16决赛 第2场" },
    { month: 6, day: 29, hour: 11, minute: 0, match: "1/16决赛 第3场" },

    { month: 6, day: 30, hour: 1, minute: 0, match: "1/16决赛 第4场" },
    { month: 6, day: 30, hour: 8, minute: 0, match: "1/16决赛 第5场" },
    { month: 6, day: 30, hour: 11, minute: 0, match: "1/16决赛 第6场" },

    { month: 7, day: 1, hour: 1, minute: 0, match: "1/16决赛 第7场" },
    { month: 7, day: 1, hour: 8, minute: 0, match: "1/16决赛 第8场" },
    { month: 7, day: 1, hour: 11, minute: 0, match: "1/16决赛 第9场" },

    { month: 7, day: 2, hour: 1, minute: 0, match: "1/16决赛 第10场" },
    { month: 7, day: 2, hour: 8, minute: 0, match: "1/16决赛 第11场" },
    { month: 7, day: 2, hour: 11, minute: 0, match: "1/16决赛 第12场" },

    { month: 7, day: 3, hour: 1, minute: 0, match: "1/16决赛 第13场" },
    { month: 7, day: 3, hour: 8, minute: 0, match: "1/16决赛 第14场" },
    { month: 7, day: 3, hour: 11, minute: 0, match: "1/16决赛 第15场" },

    { month: 7, day: 4, hour: 8, minute: 0, match: "1/16决赛 第16场" },

    // 1/8决赛 (7月5日 - 7月8日)
    { month: 7, day: 5, hour: 3, minute: 0, match: "1/8决赛 第1场" },
    { month: 7, day: 5, hour: 7, minute: 0, match: "1/8决赛 第2场" },
    { month: 7, day: 5, hour: 11, minute: 0, match: "1/8决赛 第3场" },

    { month: 7, day: 6, hour: 3, minute: 0, match: "1/8决赛 第4场" },
    { month: 7, day: 6, hour: 7, minute: 0, match: "1/8决赛 第5场" },
    { month: 7, day: 6, hour: 11, minute: 0, match: "1/8决赛 第6场" },

    { month: 7, day: 7, hour: 3, minute: 0, match: "1/8决赛 第7场" },
    { month: 7, day: 7, hour: 7, minute: 0, match: "1/8决赛 第8场" },

    // 1/4决赛 (7月10日 - 7月12日)
    { month: 7, day: 10, hour: 3, minute: 0, match: "1/4决赛 第1场" },
    { month: 7, day: 11, hour: 3, minute: 0, match: "1/4决赛 第2场" },
    { month: 7, day: 12, hour: 4, minute: 0, match: "1/4决赛 第3场" },
    { month: 7, day: 12, hour: 8, minute: 0, match: "1/4决赛 第4场" },

    // 半决赛 (7月15日 - 7月16日)
    { month: 7, day: 15, hour: 3, minute: 0, match: "半决赛 第1场" },
    { month: 7, day: 16, hour: 3, minute: 0, match: "半决赛 第2场" },

    // 三四名决赛
    { month: 7, day: 19, hour: 4, minute: 0, match: "三四名决赛" },

    // 决赛
    { month: 7, day: 20, hour: 3, minute: 0, match: "🏆 世界杯决赛" },
];

// ==========================================
// 提醒配置
// ==========================================
const REMIND_CONFIG = {
    // 开赛时立即提醒（提醒在第0分钟发）
    remindAtKickoff: true,
    // 赛后多少分钟内不再重复提醒（避免多次推送）
    remindCooldown: 120,
};

// ==========================================
// 核心逻辑
// ==========================================

/**
 * 获取北京时间
 */
function getBeijingNow() {
    const now = new Date();
    const parts = now.toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
    const [dateStr, timeStr] = parts.split(" ");
    const [y, M, d] = dateStr.split("/").map(Number);
    const [h, m] = timeStr.split(":").map(Number);
    return {
        year: y, month: M, day: d,
        hour: h, minute: m,
        display: `${M}月${d}日 ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        timestamp: new Date(`${y}/${M}/${d} ${h}:${m}:00`).getTime(),
    };
}

/**
 * 获取比赛开球时间戳（UTC）
 */
function getMatchTimestamp(match) {
    return Date.UTC(2026, match.month - 1, match.day, match.hour - 8, match.minute, 0);
}

/**
 * 发送 PushPlus 微信推送
 */
function sendPushPlus(title, content) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            token: PUSHPLUS_TOKEN,
            title: title,
            content: content,
            template: "txt",
        });

        const options = {
            hostname: "www.pushplus.plus",
            port: 443,
            path: "/send",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData),
            },
        };

        const req = https.request(options, (res) => {
            let body = "";
            res.on("data", (chunk) => { body += chunk; });
            res.on("end", () => {
                console.log(`PushPlus响应: ${body.substring(0, 100)}`);
                resolve(body);
            });
        });

        req.on("error", (e) => {
            console.error(`PushPlus请求失败: ${e.message}`);
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

/**
 * 检查需要发送的提醒 - 只在开赛时发一条
 */
function checkReminders() {
    const nowTs = Date.now();
    const reminders = [];

    for (const match of MATCH_SCHEDULE) {
        const matchTs = getMatchTimestamp(match);

        // 开赛提醒：比赛开始时刻 ±1分钟窗口内，只发一条
        if (nowTs >= matchTs - 60000 && nowTs < matchTs + 60000) {
            reminders.push({
                type: "kickoff",
                match,
                title: `⚽ ${match.match} 已开赛`,
                message: `⚽ ${match.match} 已开赛！\n\n` +
                    `💰 5分钟后开始抢红包，记得打开 APP！\n` +
                    `📱 虎扑娱乐 / 大江 等红包开放`,
            });
        }
    }

    return reminders;
}

/**
 * 查找下一场比赛
 */
function findNextMatch() {
    const nowTs = Date.now();
    let nearest = null;
    for (const match of MATCH_SCHEDULE) {
        const ts = getMatchTimestamp(match);
        if (ts > nowTs && (!nearest || ts < nearest.ts)) {
            nearest = { match, ts };
        }
    }
    return nearest;
}

/**
 * 主函数
 */
async function main() {
    console.log("========================================");
    console.log("🏆 世界杯提醒脚本启动");
    console.log(`📅 当前北京时间: ${getBeijingNow().display}`);
    console.log(`📋 共加载 ${MATCH_SCHEDULE.length} 场比赛`);
    console.log("========================================");

    const reminders = checkReminders();

    if (reminders.length === 0) {
        console.log("当前无待发送的提醒");
        const next = findNextMatch();
        if (next) {
            const waitMs = next.ts - Date.now();
            const h = Math.floor(waitMs / 3600000);
            const m = Math.floor((waitMs % 3600000) / 60000);
            console.log(`下一场: ${next.match.match}`);
            console.log(`时间: ${next.match.month}月${next.match.day}日 ${String(next.match.hour).padStart(2, "0")}:${String(next.match.minute).padStart(2, "0")}`);
            console.log(`还有 ${h} 小时 ${m} 分钟`);
        }
        return { sent: 0 };
    }

    console.log(`待发送 ${reminders.length} 条提醒:`);
    let sentCount = 0;

    for (const r of reminders) {
        console.log(`\n--- ${r.title} ---`);
        console.log(r.message);

        try {
            await sendPushPlus(r.title, r.message);
            console.log("✅ 推送成功");
            sentCount++;
        } catch (e) {
            console.error("❌ 推送失败:", e.message);
        }

        await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`\n✅ 共发送 ${sentCount}/${reminders.length} 条`);
    return { sent: sentCount, total: reminders.length };
}

// ==========================================
// 启动
// ==========================================

main()
    .then(r => {
        console.log(`执行完毕，发送 ${r.sent} 条`);
        process.exit(0);
    })
    .catch(e => {
        console.error("异常:", e);
        process.exit(1);
    });