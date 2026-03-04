import React from "react";
import { formatCurrency } from "../utils/formatters";
import { PieChart, Grid3X3, Sparkles, BookmarkPlus, RotateCcw, Save, DollarSign, Activity, TrendingUp, BarChart3 } from "./ui/Icons";

export const ResultSummaryCard = ({ currentResult, openMatrixModal, generateAIAnalysis, setAsDefault, restoreDefaults, saveToHistory }) => {
    if (!currentResult) return null;

    return (
        <>
            {/* 顶部控制栏 */}
            <header className="flex flex-col xl:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-y-4">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-inner border border-blue-500">
                        <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">大搜渠道利润测算模型</h1>
                        <p className="text-[13px] font-medium text-slate-500 mt-1 flex items-center">核心业务：亲子鉴定（无创/个人/司法） | 核心渠道：百度搜索</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 flex-wrap justify-center gap-y-2">
                    <button
                        onClick={openMatrixModal}
                        className="flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all shadow-md transform hover:scale-105"
                    >
                        <Grid3X3 className="w-4 h-4 mr-2" /> 🎯 策略矩阵模拟
                    </button>
                    <button
                        onClick={generateAIAnalysis}
                        className="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all shadow-md transform hover:scale-105"
                    >
                        <Sparkles className="w-4 h-4 mr-2" /> ✨ AI 智能洞察
                    </button>

                    <div className="h-8 w-px bg-slate-200 hidden md:block mx-1"></div>
                    <button
                        onClick={setAsDefault}
                        className="flex items-center px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-xl transition-colors shadow-sm"
                    >
                        <BookmarkPlus className="w-4 h-4 mr-2" /> 设为默认
                    </button>
                    <button
                        onClick={restoreDefaults}
                        className="flex items-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors shadow-sm"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" /> 恢复默认
                    </button>
                    <button
                        onClick={saveToHistory}
                        className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm"
                    >
                        <Save className="w-4 h-4 mr-2" /> 记录快照
                    </button>
                </div>
            </header>

            {/* 核心大盘总览 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                    <p className="text-sm text-slate-500 mb-2 flex items-center font-medium">
                        <DollarSign className="w-5 h-5 mr-1.5 text-blue-500" /> 大盘总营收
                    </p>
                    <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{formatCurrency(currentResult.total.revenue)}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400"></div>
                    <p className="text-sm text-slate-500 mb-2 flex items-center font-medium">
                        <Activity className="w-5 h-5 mr-1.5 text-orange-400" /> 大盘总成本{" "}
                        <span className="text-[10px] ml-2 bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">推+人+变</span>
                    </p>
                    <p className="text-3xl font-extrabold text-slate-800 tracking-tight">{formatCurrency(currentResult.total.totalCost)}</p>
                    <div className="flex text-[11px] text-slate-400 mt-2 space-x-3 font-medium">
                        <span>推: {formatCurrency(currentResult.total.promoCost).replace("¥", "")}</span>
                        <span>人: {formatCurrency(currentResult.total.laborCost).replace("¥", "")}</span>
                        <span>变: {formatCurrency(currentResult.total.otherCost).replace("¥", "")}</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center relative overflow-hidden">
                    <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
                    <p className="text-emerald-100 text-sm mb-2 flex items-center font-medium">
                        <TrendingUp className="w-5 h-5 mr-1.5" /> 大盘总毛利
                    </p>
                    <p className="text-4xl font-extrabold tracking-tight">{formatCurrency(currentResult.total.grossProfit)}</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center relative overflow-hidden">
                    <BarChart3 className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
                    <p className="text-indigo-100 text-sm mb-2 flex items-center font-medium">
                        <BarChart3 className="w-5 h-5 mr-1.5" /> 综合 ROI (销售/推广)
                    </p>
                    <p className="text-4xl font-extrabold tracking-tight">
                        {currentResult.total.roi.toFixed(2)} <span className="text-lg font-normal opacity-80 ml-1">倍</span>
                    </p>
                </div>
            </div>
        </>
    );
};
