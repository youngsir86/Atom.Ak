import React from "react";
import { formatCurrency } from "../utils/formatters";
import { Grid3X3, Target, XIcon, BarChart3 } from "./ui/Icons";

export const MatrixSimulator = ({
    matrixConfig,
    matrixData,
    showMatrixModal,
    setShowMatrixModal,
    handleMatrixConfigChange,
    generateMatrix,
}) => {
    if (!showMatrixModal) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-2 md:p-4">
            <div className="bg-white w-full max-w-[1500px] max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 flex items-center justify-between shrink-0">
                    <div className="flex items-center text-white">
                        <div className="p-2 bg-white/20 rounded-xl mr-3">
                            <Grid3X3 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">🎯 盈亏平衡点矩阵模拟分析器</h3>
                            <p className="text-orange-50 text-xs mt-0.5">跨度以 10 为单位，探索【单成本】与【日均量】的安全边界（显示净利润）</p>
                        </div>
                    </div>
                    <button onClick={() => setShowMatrixModal(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                        <XIcon className="w-7 h-7" />
                    </button>
                </div>

                {/* Control Panel */}
                <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-200 shrink-0">
                    <div className="flex flex-wrap items-end gap-3 pb-2">
                        {/* 全局及底价设定 */}
                        <div className="flex space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">集团成本分摊(¥)</label>
                                <input
                                    type="number"
                                    step="1000"
                                    value={matrixConfig.groupCostShare}
                                    onChange={(e) => handleMatrixConfigChange("groupCostShare", e.target.value)}
                                    className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-amber-400"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex items-end pb-0.5" title="检测底价模式规则：无创 300 元/单，个人 150 元/单，司法 0.5">
                                <label className="flex items-center h-[28px] px-2 text-[11px] font-bold text-slate-600 cursor-pointer select-none border border-slate-200 bg-slate-50 rounded transition-colors hover:bg-slate-100">
                                    <input
                                        type="checkbox"
                                        className="mr-1.5 h-3.5 w-3.5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                                        checked={!!matrixConfig.useFloorLabCost}
                                        onChange={(e) => handleMatrixConfigChange("useFloorLabCost", e.target.checked)}
                                    />
                                    开启底价检测
                                </label>
                            </div>
                        </div>

                        {/* 区间设定 */}
                        <div className="flex space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">综合单成本(下限)</label>
                                <input
                                    type="number"
                                    step="10"
                                    value={matrixConfig.costMin}
                                    onChange={(e) => handleMatrixConfigChange("costMin", e.target.value)}
                                    className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-amber-400"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">综合单成本(上限)</label>
                                <input
                                    type="number"
                                    step="10"
                                    value={matrixConfig.costMax}
                                    onChange={(e) => handleMatrixConfigChange("costMax", e.target.value)}
                                    className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-amber-400"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">日均售中(下限)</label>
                                <input
                                    type="number"
                                    step="10"
                                    value={matrixConfig.leadsMin}
                                    onChange={(e) => handleMatrixConfigChange("leadsMin", e.target.value)}
                                    className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-amber-400"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">日均售中(上限)</label>
                                <input
                                    type="number"
                                    step="10"
                                    value={matrixConfig.leadsMax}
                                    onChange={(e) => handleMatrixConfigChange("leadsMax", e.target.value)}
                                    className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-amber-400"
                                />
                            </div>
                        </div>

                        {/* 转化率实时调节区 */}
                        <div className="flex space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                            <div>
                                <label className="text-[10px] font-bold text-emerald-600 block mb-1">无创转化率</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={matrixConfig.wuchuangConvRate}
                                    onChange={(e) => handleMatrixConfigChange("wuchuangConvRate", e.target.value)}
                                    className="w-16 px-1.5 py-1 bg-emerald-50/50 border border-emerald-200 text-emerald-700 rounded text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-indigo-600 block mb-1">个人转化率</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={matrixConfig.gerenConvRate}
                                    onChange={(e) => handleMatrixConfigChange("gerenConvRate", e.target.value)}
                                    className="w-16 px-1.5 py-1 bg-indigo-50/50 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-amber-600 block mb-1">司法转化率</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={matrixConfig.sifaConvRate}
                                    onChange={(e) => handleMatrixConfigChange("sifaConvRate", e.target.value)}
                                    className="w-16 px-1.5 py-1 bg-amber-50/50 border border-amber-200 text-amber-700 rounded text-sm font-semibold outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        {/* 客单价实时调节区 */}
                        <div className="flex space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                            <div>
                                <label className="text-[10px] font-bold text-emerald-600 block mb-1">无创客单价</label>
                                <input
                                    type="number"
                                    step="100"
                                    value={matrixConfig.wuchuangUnitPrice}
                                    onChange={(e) => handleMatrixConfigChange("wuchuangUnitPrice", e.target.value)}
                                    className="w-20 px-1.5 py-1 bg-emerald-50/50 border border-emerald-200 text-emerald-700 rounded text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-indigo-600 block mb-1">个人客单价</label>
                                <input
                                    type="number"
                                    step="100"
                                    value={matrixConfig.gerenUnitPrice}
                                    onChange={(e) => handleMatrixConfigChange("gerenUnitPrice", e.target.value)}
                                    className="w-20 px-1.5 py-1 bg-indigo-50/50 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-amber-600 block mb-1">司法客单价</label>
                                <input
                                    type="number"
                                    step="100"
                                    value={matrixConfig.sifaUnitPrice}
                                    onChange={(e) => handleMatrixConfigChange("sifaUnitPrice", e.target.value)}
                                    className="w-20 px-1.5 py-1 bg-amber-50/50 border border-amber-200 text-amber-700 rounded text-sm font-semibold outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={generateMatrix}
                            className="flex items-center h-[46px] px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-md ml-auto"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" /> 生成/刷新矩阵
                        </button>
                    </div>
                </div>

                {/* Matrix View */}
                <div className="flex-1 bg-slate-100 p-4 md:p-6 flex flex-col min-h-[300px] overflow-hidden relative">
                    {!matrixData ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 flex-1">
                            <Grid3X3 className="w-16 h-16 mb-4 opacity-20" />
                            <p>设定上方区间并点击“生成策略矩阵”</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-auto relative">
                            <table className="w-full border-separate border-spacing-0 min-w-max">
                                <thead>
                                    <tr>
                                        <th className="p-3 border-b border-r border-slate-200 bg-slate-100 text-slate-800 font-bold text-sm text-center sticky top-0 left-0 z-[40]">
                                            日均量 \ 单成本
                                        </th>
                                        {matrixData.columns.map((cost) => (
                                            <th
                                                key={cost}
                                                className="p-3 border-b border-r border-slate-200 bg-slate-50 text-slate-700 font-bold text-center min-w-[100px] sticky top-0 z-[30]"
                                            >
                                                ¥{cost}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {matrixData.rows.map((row) => (
                                        <tr key={row.leads}>
                                            <td className="p-3 border-r border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-center sticky left-0 z-[30]">
                                                {row.leads} 量
                                            </td>
                                            {row.cells.map((cell) => {
                                                const isBreakEven = matrixData.breakEvenCells.some((c) => c.cost === cell.cost && c.leads === cell.leads);
                                                const isLoss = cell.profit < 0;

                                                const tdBgColor = isBreakEven ? "bg-blue-50" : isLoss ? "bg-red-50/50" : "bg-emerald-50/50";

                                                return (
                                                    <td
                                                        key={cell.cost}
                                                        className={`p-0 border-b border-r border-slate-100 text-center transition-colors hover:bg-slate-100 ${tdBgColor}`}
                                                    >
                                                        <div className={`w-full h-full p-2 relative flex flex-col justify-center ${isBreakEven ? "ring-2 ring-inset ring-blue-500 shadow-inner" : ""}`}>
                                                            {isBreakEven && <Target className="absolute top-1 right-1 w-4 h-4 text-blue-500 animate-pulse" title="盈亏平衡边界" />}
                                                            <div className={`font-bold ${isLoss ? "text-red-400" : isBreakEven ? "text-blue-700 text-lg" : "text-emerald-600"}`}>
                                                                {formatCurrency(cell.profit).replace("¥", "")}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 mt-1">
                                                                净利润
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 mt-1">
                                                                ROI: <span className="font-medium text-slate-700">{cell.roi.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Matrix Footer Note */}
                {matrixData && matrixData.breakEvenCells && (
                    <div className="p-4 bg-blue-50 border-t border-blue-100 shrink-0 flex items-center justify-between">
                        <div className="flex items-center text-blue-800 text-sm">
                            <Target className="w-5 h-5 mr-2" />
                            <span>
                                图表中的 🎯 <strong>蓝色高亮格子</strong> 代表该日均量层级下的 <strong>盈亏平衡点</strong>（毛利最接近 0）。您可以调节上方的各业务转化率，矩阵会自动 <strong>实时重算</strong>，观察安全边界的漂移情况。
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
