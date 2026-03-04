import { useState, useEffect } from "react";
import { safeNum } from "../utils/formatters";

export const useHistory = (currentInputs, currentResult, setConfirmModal) => {
    const [history, setHistory] = useState(() => {
        try {
            const savedHistory = localStorage.getItem("profitModelHistory");
            if (savedHistory) return JSON.parse(savedHistory);
        } catch (e) {
            console.error("Failed to load history", e);
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem("profitModelHistory", JSON.stringify(history));
    }, [history]);

    const saveToHistory = (currentInputs, currentResult) => {
        if (!currentResult) return;
        const newRecord = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
            avgCostPerLead: currentInputs.avgCostPerLead,
            totalDailyLeads: currentInputs.totalDailyLeads,
            monthlyPromo: currentResult.total.promoCost,
            totalRevenue: currentResult.total.revenue,
            totalGrossProfit: currentResult.total.grossProfit,
            totalRoi: currentResult.total.roi,
            wuchuangCost: currentResult.wuchuang.derivedCost,
            gerenCost: currentResult.geren.derivedCost,
            sifaCost: currentResult.sifa.derivedCost,
            inputsSnapshot: JSON.parse(JSON.stringify(currentInputs)),
            resultSnapshot: JSON.parse(JSON.stringify(currentResult)),
        };
        setHistory([...history, newRecord]);
    };

    const saveToSnapshot = () => saveToHistory(currentInputs, currentResult);

    const deleteHistoryRecord = (id) => {
        setHistory((prev) => prev.filter((record) => record.id !== id));
    };

    const clearAllHistory = () => {
        setConfirmModal({
            show: true,
            message: "您确定要清空所有已经保存的历史测算快照吗？此操作无法撤销。",
            onConfirm: () => {
                setHistory([]);
            },
        });
    };

    const exportToCSV = () => {
        const headers = [
            "快照时间",
            "综合单成本",
            "大盘总日均量",
            "大盘总营收",
            "总推广费",
            "总人力成本",
            "总变动成本",
            "大盘总毛利",
            "综合ROI(销售/推广)",
            "无创日均量",
            "无创转化率",
            "无创推算单成本",
            "无创营收",
            "无创毛利",
            "个人日均量",
            "个人转化率",
            "个人推算单成本",
            "个人营收",
            "个人毛利",
            "司法日均量",
            "司法转化率",
            "司法设定单成本",
            "司法营收",
            "司法毛利",
        ];

        const rows = history.map((row) => {
            const res = row.resultSnapshot || {};
            const inp = row.inputsSnapshot || {};

            return [
                row.timestamp,
                safeNum(row.avgCostPerLead),
                safeNum(row.totalDailyLeads),
                safeNum(res.total?.revenue),
                safeNum(res.total?.promoCost),
                safeNum(res.total?.laborCost),
                safeNum(res.total?.otherCost),
                safeNum(res.total?.grossProfit),
                safeNum(res.total?.roi),
                safeNum(inp.totalDailyLeads * inp.categories?.wuchuang?.leadRatio),
                safeNum(inp.categories?.wuchuang?.convRate),
                safeNum(row.wuchuangCost),
                safeNum(res.wuchuang?.revenue),
                safeNum(res.wuchuang?.grossProfit),
                safeNum(inp.totalDailyLeads * inp.categories?.geren?.leadRatio),
                safeNum(inp.categories?.geren?.convRate),
                safeNum(row.gerenCost),
                safeNum(res.geren?.revenue),
                safeNum(res.geren?.grossProfit),
                safeNum(inp.totalDailyLeads * inp.categories?.sifa?.leadRatio),
                safeNum(inp.categories?.sifa?.convRate),
                safeNum(row.sifaCost),
                safeNum(res.sifa?.revenue),
                safeNum(res.sifa?.grossProfit),
            ].join(",");
        });

        const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `利润测算明细报告_${new Date().getTime()}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return {
        history,
        saveToSnapshot,
        deleteHistoryRecord,
        clearAllHistory,
        exportToCSV,
    };
};
