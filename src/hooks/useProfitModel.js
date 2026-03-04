import { useState, useEffect } from "react";
import { INITIAL_STATE } from "../constants/initialState";
import { calculateResult } from "../utils/calculators";

export const useProfitModel = () => {
    const [inputs, setInputs] = useState(() => {
        try {
            const saved = localStorage.getItem("profitModelConfig");
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load config", e);
        }
        try {
            const customDefault = localStorage.getItem("profitModelDefaultConfig");
            if (customDefault) return JSON.parse(customDefault);
        } catch (e) { }
        return INITIAL_STATE;
    });

    const [currentResult, setCurrentResult] = useState(null);

    // 当 inputs 改变时，更新到 localStorage 并重新计算结果
    useEffect(() => {
        localStorage.setItem("profitModelConfig", JSON.stringify(inputs));
        setCurrentResult(calculateResult(inputs));
    }, [inputs]);

    const setAsDefault = (setConfirmModal) => {
        setConfirmModal({
            show: true,
            message: "确定将当前所有参数配置（含漏斗及成本策略）设为以后每次打开系统的基准值吗？",
            onConfirm: () => {
                localStorage.setItem("profitModelDefaultConfig", JSON.stringify(inputs));
            },
        });
    };

    const restoreDefaults = (setConfirmModal) => {
        setConfirmModal({
            show: true,
            message: "确定要放弃当前屏幕上的修改，重新加载初始默认的安全基准测算值吗？\n(未保存的历史快照将被清空)",
            onConfirm: () => {
                let def = INITIAL_STATE;
                try {
                    const customDefault = localStorage.getItem("profitModelDefaultConfig");
                    if (customDefault) def = JSON.parse(customDefault);
                } catch (e) { }
                setInputs({ ...def });
            },
        });
    };

    const handleGlobalChange = (field, value) => {
        setInputs((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const handleManagementChange = (field, value) => {
        setInputs((prev) => ({ ...prev, management: { ...prev.management, [field]: parseFloat(value) || 0 } }));
    };

    const handleRatioChange = (field, value) => {
        setInputs((prev) => {
            let parsedValue = parseFloat(value);
            if (field === "sifaManualCost" && (value === "" || value === null)) {
                parsedValue = null;
            } else if (isNaN(parsedValue)) {
                parsedValue = 0;
            }
            return { ...prev, costRatio: { ...prev.costRatio, [field]: parsedValue } };
        });
    };

    const handleNestedChange = (section, field, value) => {
        setInputs((prev) => ({ ...prev, [section]: { ...prev[section], [field]: parseFloat(value) || 0 } }));
    };

    const handleCategoryChange = (category, field, value) => {
        setInputs((prev) => {
            const numValue = parseFloat(value) || 0;
            const newCategories = {
                ...prev.categories,
                [category]: { ...prev.categories[category], [field]: numValue },
            };

            if (field === "leadRatio" && (category === "wuchuang" || category === "geren")) {
                let sifaRatio = 1 - newCategories.wuchuang.leadRatio - newCategories.geren.leadRatio;
                sifaRatio = Math.max(0, Math.round(sifaRatio * 10000) / 10000);
                newCategories.sifa.leadRatio = sifaRatio;
            }

            // 客单价变更时自动联动计算受理费
            if (field === "unitPrice") {
                if (category === "wuchuang") {
                    newCategories.wuchuang.processCost = Number((numValue * 0.08 + 30).toFixed(2));
                } else if (category === "geren") {
                    newCategories.geren.processCost = Number((numValue * 0.03 + 30).toFixed(2));
                }
            }

            return { ...prev, categories: newCategories };
        });
    };

    return {
        inputs,
        currentResult,
        setAsDefault,
        restoreDefaults,
        handleGlobalChange,
        handleManagementChange,
        handleRatioChange,
        handleNestedChange,
        handleCategoryChange,
    };
};
