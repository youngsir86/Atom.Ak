// 格式化功能相关的工具函数

export const formatCurrency = (value) => {
    return new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "CNY",
        maximumFractionDigits: 0,
    }).format(value);
};

export const formatPercent = (value) => {
    return (value * 100).toFixed(1) + "%";
};

// 确保数字格式安全的函数(用于导出CSV等场景)
export const safeNum = (val) => (typeof val === "number" ? val.toFixed(2) : val || 0);
