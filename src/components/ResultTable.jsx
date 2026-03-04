import React from "react";
import { formatCurrency } from "../utils/formatters";
import { Calculator } from "./ui/Icons";

export const ResultTable = ({ currentResult }) => {
    if (!currentResult) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center">
                    <Calculator className="w-5 h-5 mr-2 text-slate-500" /> 月度核算表
                </h3>
            </div>
            <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[13px]">
                            <th className="py-3 px-4 font-medium">业务线</th>
                            <th className="py-3 px-4 font-medium text-right">销售额</th>
                            <th className="py-3 px-4 font-medium text-right text-orange-600 bg-orange-50/30">变动成本(检+提+受)</th>
                            <th className="py-3 px-4 font-medium text-right text-slate-500">全维人力及管理</th>
                            <th className="py-3 px-4 font-medium text-right text-indigo-600 bg-indigo-50/30">推广支出</th>
                            <th className="py-3 px-4 font-medium text-right text-slate-900">毛利额</th>
                            <th className="py-3 px-4 font-medium text-right">ROI(销售/推广)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {["wuchuang", "geren", "sifa"].map((key) => {
                            const res = currentResult[key];
                            return (
                                <tr key={key} className="hover:bg-slate-50 transition-colors text-sm">
                                    <td className="py-4 px-4 font-medium flex items-center text-slate-700">
                                        <span
                                            className={`w-2 h-2 rounded-full mr-2 ${key === "wuchuang" ? "bg-emerald-400" : key === "geren" ? "bg-blue-400" : "bg-amber-400"
                                                }`}
                                        ></span>
                                        {res.name}
                                    </td>
                                    <td className="py-4 px-4 text-right text-slate-700 font-medium">{formatCurrency(res.revenue)}</td>
                                    <td className="py-4 px-4 text-right text-orange-600 bg-orange-50/30">-{formatCurrency(res.otherCosts)}</td>
                                    <td className="py-4 px-4 text-right text-slate-500">-{formatCurrency(res.laborCost)}</td>
                                    <td className="py-4 px-4 text-right text-indigo-600 bg-indigo-50/30 font-medium">
                                        -{formatCurrency(res.promoCost)}
                                    </td>
                                    <td className="py-4 px-4 text-right font-bold text-slate-900">{formatCurrency(res.grossProfit)}</td>
                                    <td className="py-4 px-4 text-right font-bold text-slate-600">{res.roi.toFixed(2)}</td>
                                </tr>
                            );
                        })}
                        <tr className="bg-slate-50 text-slate-900 font-bold text-sm border-t-2 border-slate-200">
                            <td className="py-4 px-4">大盘合计</td>
                            <td className="py-4 px-4 text-right text-blue-700">{formatCurrency(currentResult.total.revenue)}</td>
                            <td className="py-4 px-4 text-right text-orange-600">-{formatCurrency(currentResult.total.otherCost)}</td>
                            <td className="py-4 px-4 text-right text-slate-500">-{formatCurrency(currentResult.total.laborCost)}</td>
                            <td className="py-4 px-4 text-right text-indigo-600">-{formatCurrency(currentResult.total.promoCost)}</td>
                            <td className="py-4 px-4 text-right text-emerald-600 text-lg">{formatCurrency(currentResult.total.grossProfit)}</td>
                            <td className="py-4 px-4 text-right text-blue-700 text-lg">{currentResult.total.roi.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
