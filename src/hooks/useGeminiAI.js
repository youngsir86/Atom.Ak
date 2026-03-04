import { useState } from "react";

export const useGeminiAI = (currentResult) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState("");

    const generateAIAnalysis = async () => {
        if (!currentResult) return;

        setIsAnalyzing(true);
        setShowAiModal(true);
        setAiAnalysis("");

        // 说明：GitHub Pages 上不要硬编码 key，建议自行从 localStorage 读取或在代码里填入
        const apiKey = localStorage.getItem("GEMINI_API_KEY") || "";
        if (!apiKey) {
            setAiAnalysis(
                "尚未配置 Gemini API Key。\n\n你可以在浏览器控制台执行：\nlocalStorage.setItem('GEMINI_API_KEY','你的key')\n\n然后重新点击“AI 智能洞察”。"
            );
            setIsAnalyzing(false);
            return;
        }

        const model = "gemini-2.5-flash-preview-09-2025";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const promptData = `
作为资深企业财务与运营分析专家（CFO视角），请根据以下大搜渠道（百度搜索为主）亲子鉴定业务的月度测算快照数据，提供一份专业的诊断报告。

【大盘财务表现】
- 月度总营收：${currentResult.total.revenue.toFixed(0)}元
- 月度总成本：${currentResult.total.totalCost.toFixed(0)}元（其中推广费占${currentResult.total.promoCost.toFixed(
            0
        )}元，人力摊销占${currentResult.total.laborCost.toFixed(0)}元，变动成本占${currentResult.total.otherCost.toFixed(
            0
        )}元）
- 净毛利额：${currentResult.total.grossProfit.toFixed(0)}元
- 全盘综合 ROI (营收/推广)：${currentResult.total.roi.toFixed(2)}

【核心业务线表现拆解】
1. 无创产前检测：贡献营收${currentResult.wuchuang.revenue.toFixed(0)}元，产生毛利${currentResult.wuchuang.grossProfit.toFixed(
            0
        )}元，业务ROI ${currentResult.wuchuang.roi.toFixed(2)}，逆推单转成本约为${currentResult.wuchuang.derivedCost.toFixed(
            0
        )}元。
2. 个人健康检测：贡献营收${currentResult.geren.revenue.toFixed(0)}元，产生毛利${currentResult.geren.grossProfit.toFixed(
            0
        )}元，业务ROI ${currentResult.geren.roi.toFixed(2)}，逆推单转成本约为${currentResult.geren.derivedCost.toFixed(
            0
        )}元。
3. 司法鉴定：贡献营收${currentResult.sifa.revenue.toFixed(0)}元，产生毛利${currentResult.sifa.grossProfit.toFixed(
            0
        )}元，当前设定的单成本为${currentResult.sifa.derivedCost.toFixed(0)}元（零毛利的安全阈值推荐为约为${currentResult.total.recommendedSifaCost.toFixed(
            0
        )}元）。

请按以下结构输出简明扼要的报告（适当使用粗体和emoji）：
1. 💡 **经营健康度总览**：一针见血评价当前利润模型的良性程度。
2. ⚠️ **利润黑洞诊断**：分析成本结构（推广、人力、化验费）是否存在失衡，哪个业务线是短板或拖油瓶。
3. ✨ **核心优化策略**：结合流量漏斗或人员效率给出3条切实可行的优化建议（例如提升某项转化率或调整流量比重）。
注意：直接输出内容，不需要客套话。
`;

        const payload = {
            contents: [{ parts: [{ text: promptData }] }],
        };

        let retries = 5;
        let delay = 1000;
        let success = false;

        while (retries > 0 && !success) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

                if (text) {
                    setAiAnalysis(text);
                    success = true;
                } else {
                    throw new Error("No text returned from Gemini API");
                }
            } catch (error) {
                retries--;
                if (retries === 0) {
                    setAiAnalysis("抱歉，AI 诊断引擎当前响应超时，请关闭弹窗后重新点击尝试。");
                } else {
                    await new Promise((res) => setTimeout(res, delay));
                    delay *= 2;
                }
            }
        }
        setIsAnalyzing(false);
    };

    return {
        isAnalyzing,
        showAiModal,
        setShowAiModal,
        aiAnalysis,
        generateAIAnalysis,
    };
};
