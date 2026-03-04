import React from "react";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { HistoryIcon, Trash2, Download } from "./ui/Icons";

export const HistoryPanel = ({ history, clearAllHistory, exportToCSV, deleteHistoryRecord }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6 w-full">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center">
                    <h3 className="font-bold text-slate-800 flex items-center">
                        <HistoryIcon className="w-5 h-5 mr-2 text-slate-500" /> 历史测算记录快照
                    </h3>
                    <span className="ml-4 text-xs text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                        当前保存记录数：{history.length}
                    </span>
                </div>
                {history.length > 0 && (
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={clearAllHistory}
                            className="flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200"
                        >
                            <Trash2 className="w-4 h-4 mr-1.5" /> 一键清空
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="flex items-center px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg transition-colors border border-emerald-200"
                        >
                            <Download className="w-4 h-4 mr-1.5" /> 导出为Excel
                        </button>
                    </div>
                )}
            </div>
            <div className="p-0 overflow-x-auto max-h-[400px] overflow-y-auto">
                {history.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 flex flex-col items-center justify-center w-full">
                        <HistoryIcon className="w-12 h-12 mb-3 text-slate-200 opacity-50" />
                        <p>暂无历史记录。请在调整参数后，点击右上角的“记录快照”按钮进行保存对比。</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead className="sticky top-0 bg-white shadow-sm z-10">
                            <tr className="bg-slate-50 text-slate-500 text-[13px]">
                                <th className="py-3 px-4 font-medium">快照时间</th>
                                <th className="py-3 px-4 font-medium text-right">大盘日均量</th>
                                <th className="py-3 px-4 font-medium text-right">综合单成本/月推广总额</th>
                                <th className="py-3 px-4 font-medium text-right">转化率(无/个/司)</th>
                                <th className="py-3 px-4 font-medium text-right">客单价(无/个/司)</th>
                                <th className="py-3 px-4 font-medium text-right">推算单成本(无/个/司)</th>
                                <th className="py-3 px-4 font-medium text-right">总营收</th>
                                <th className="py-3 px-4 font-medium text-right text-slate-900">总毛利额</th>
                                <th className="py-3 px-4 font-medium text-right">综合ROI</th>
                                <th className="py-3 px-4 font-medium text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {history.map((record, idx) => (
                                <tr
                                    key={record.id}
                                    className={`hover:bg-blue-50/50 transition-colors text-sm ${idx === history.length - 1 ? "bg-blue-50/30" : ""}`}
                                >
                                    <td className="py-3 px-4 text-slate-500">{record.timestamp}</td>
                                    <td className="py-3 px-4 text-right font-medium text-slate-700">{record.totalDailyLeads}</td>
                                    <td className="py-3 px-4 text-right text-slate-600 font-medium">
                                        <span className="text-xs text-slate-400">¥{record.avgCostPerLead} / </span>¥
                                        {formatCurrency(record.monthlyPromo).replace("¥", "")}
                                    </td>
                                    <td className="py-3 px-4 text-right text-slate-500 text-xs font-mono">
                                        {formatPercent(record.inputsSnapshot?.categories?.wuchuang?.convRate || 0)} /{" "}
                                        {formatPercent(record.inputsSnapshot?.categories?.geren?.convRate || 0)} /{" "}
                                        {formatPercent(record.inputsSnapshot?.categories?.sifa?.convRate || 0)}
                                    </td>
                                    <td className="py-3 px-4 text-right text-slate-500 text-xs font-mono">
                                        {record.inputsSnapshot?.categories?.wuchuang?.unitPrice || 0} / {record.inputsSnapshot?.categories?.geren?.unitPrice || 0} /{" "}
                                        {record.inputsSnapshot?.categories?.sifa?.unitPrice || 0}
                                    </td>
                                    <td className="py-3 px-4 text-right text-slate-500 text-xs font-mono">
                                        {record.wuchuangCost.toFixed(0)} / {record.gerenCost.toFixed(0)} / {record.sifaCost.toFixed(0)}
                                    </td>
                                    <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(record.totalRevenue)}</td>
                                    <td className="py-3 px-4 text-right font-medium text-emerald-600">{formatCurrency(record.totalGrossProfit)}</td>
                                    <td className="py-3 px-4 text-right font-bold text-blue-600">{record.totalRoi.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => deleteHistoryRecord(record.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="删除记录"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
