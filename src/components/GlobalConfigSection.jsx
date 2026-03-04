import React from "react";
import { formatCurrency } from "../utils/formatters";
import { Settings2, Info, UserCog, Activity, RotateCcw } from "./ui/Icons";

export const GlobalConfigSection = ({
    inputs,
    currentResult,
    handleGlobalChange,
    handleNestedChange,
    handleRatioChange,
    handleManagementChange,
}) => {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h2 className="text-base font-bold mb-4 flex items-center text-slate-800">
                <Settings2 className="w-5 h-5 mr-2 text-blue-500" /> 全局大盘与薪资设置
            </h2>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">综合单成本</label>
                        <div className="relative">
                            <span className="absolute left-2 top-1.5 text-slate-400 text-sm">¥</span>
                            <input
                                type="number"
                                value={inputs.avgCostPerLead}
                                onChange={(e) => handleGlobalChange("avgCostPerLead", e.target.value)}
                                className="w-full pl-6 pr-2 py-1.5 bg-blue-50 border border-blue-200 rounded text-sm font-bold text-blue-700 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">总日均售中量</label>
                        <input
                            type="number"
                            value={inputs.totalDailyLeads}
                            onChange={(e) => handleGlobalChange("totalDailyLeads", e.target.value)}
                            className="w-full px-2 py-1.5 bg-blue-50 border border-blue-200 rounded text-sm font-bold text-blue-700 outline-none"
                        />
                    </div>
                </div>

                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600 flex items-center">
                        <Info className="w-3 h-3 mr-1 text-slate-400" />
                        推算日推广费:
                    </span>
                    <span className="font-bold text-blue-600 text-sm">{formatCurrency(inputs.avgCostPerLead * inputs.totalDailyLeads)}</span>
                </div>
                <hr className="border-slate-100" />

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[11px] text-slate-500 block mb-1">套电率 (小数)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={inputs.presales.leadRate}
                            onChange={(e) => handleNestedChange("presales", "leadRate", e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] text-slate-500 block mb-1">推广人工总池(C19)</label>
                        <input
                            type="number"
                            value={inputs.promoLaborCost}
                            onChange={(e) => handleGlobalChange("promoLaborCost", e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] text-slate-500 block mb-1">售前单人薪资</label>
                        <input
                            type="number"
                            value={inputs.presales.salary}
                            onChange={(e) => handleNestedChange("presales", "salary", e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] text-slate-500 block mb-1">售中单人薪资</label>
                        <input
                            type="number"
                            value={inputs.insalesSalary}
                            onChange={(e) => handleGlobalChange("insalesSalary", e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[11px] text-slate-500 block mb-1">全局售前人均接待量</label>
                        <input
                            type="number"
                            value={inputs.presales.capacity}
                            onChange={(e) => handleNestedChange("presales", "capacity", e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs outline-none"
                        />
                    </div>
                </div>

                <div className="bg-slate-50 p-2 rounded border border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600 flex items-center">
                        <UserCog className="w-3 h-3 mr-1 text-slate-400" />
                        推算用人需求(进1制):
                    </span>
                    <div className="text-right text-xs">
                        <div>
                            售前: <span className="font-bold text-slate-800">{currentResult.total.presalesHeadcount}</span>{" "}
                            <span className="text-[10px] text-slate-400">({currentResult.total.exactPresalesHeadcount.toFixed(2)})</span>
                        </div>
                        <div>
                            售中: <span className="font-bold text-slate-800">{currentResult.total.insalesHeadcount}</span>
                        </div>
                    </div>
                </div>
                <hr className="border-slate-100" />

                {/* 推广费分配设定 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 flex items-center">
                        <Activity className="w-4 h-4 mr-1.5 text-indigo-500" />
                        <label className="text-[12px] font-bold text-slate-700">各线推广费分配策略</label>
                    </div>

                    <div className="col-span-2 bg-indigo-50/40 p-2.5 rounded-lg border border-indigo-100 shadow-sm">
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[11px] font-semibold text-slate-700 flex items-center">
                                司法单售中成本设定
                                {inputs.costRatio.sifaManualCost === null && (
                                    <span className="ml-2 text-[9px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">跟随推荐值</span>
                                )}
                            </label>
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                    推荐(毛利0): ¥{currentResult?.total.recommendedSifaCost.toFixed(1) || 0}
                                </span>
                                {inputs.costRatio.sifaManualCost !== null && (
                                    <button
                                        onClick={() => handleRatioChange("sifaManualCost", null)}
                                        className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center transition-colors"
                                        title="恢复动态推荐值"
                                    >
                                        <RotateCcw className="w-3 h-3 mr-0.5" /> 自动
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <span
                                className={`absolute left-2.5 top-1.5 text-xs ${inputs.costRatio.sifaManualCost === null ? "text-emerald-500" : "text-slate-400"
                                    }`}
                            >
                                ¥
                            </span>
                            <input
                                type="number"
                                step="0.1"
                                value={
                                    inputs.costRatio.sifaManualCost !== null
                                        ? inputs.costRatio.sifaManualCost
                                        : currentResult?.total.recommendedSifaCost.toFixed(1) || ""
                                }
                                onChange={(e) => handleRatioChange("sifaManualCost", e.target.value)}
                                className={`w-full pl-6 pr-2 py-1.5 bg-white border rounded text-sm font-bold outline-none focus:ring-1 ${inputs.costRatio.sifaManualCost === null
                                        ? "border-emerald-300 text-emerald-700 focus:ring-emerald-400 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]"
                                        : "border-indigo-200 text-indigo-700 focus:ring-indigo-400"
                                    }`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] text-slate-500 block mb-1">无创分摊权重</label>
                        <input
                            type="number"
                            value={inputs.costRatio.wuchuang}
                            onChange={(e) => handleRatioChange("wuchuang", e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none focus:border-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] text-slate-500 block mb-1">个人分摊权重</label>
                        <input
                            type="number"
                            value={inputs.costRatio.geren}
                            onChange={(e) => handleRatioChange("geren", e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs outline-none focus:border-indigo-400"
                        />
                    </div>
                </div>

                <hr className="border-slate-100" />

                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                        <label className="text-[11px] font-semibold text-indigo-600 block mb-2">管理层薪酬设定 (分摊/专属)</label>
                    </div>
                    <div>
                        <label className="text-[11px] text-slate-500 block mb-1">总人数 (售前+总监)</label>
                        <input
                            type="number"
                            value={inputs.management.topManagers}
                            onChange={(e) => handleManagementChange("topManagers", e.target.value)}
                            className="w-full px-2 py-1.5 bg-indigo-50/50 border border-indigo-100 rounded text-xs outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] text-slate-500 block mb-1">营销中心管人均薪资</label>
                        <input
                            type="number"
                            value={inputs.management.topSalary}
                            onChange={(e) => handleManagementChange("topSalary", e.target.value)}
                            className="w-full px-2 py-1.5 bg-indigo-50/50 border border-indigo-100 rounded text-xs outline-none"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[11px] text-slate-500 block mb-1">部门经理人均薪资 (各业务线专属配置)</label>
                        <input
                            type="number"
                            value={inputs.management.centerSalary}
                            onChange={(e) => handleManagementChange("centerSalary", e.target.value)}
                            className="w-full px-2 py-1.5 bg-indigo-50/50 border border-indigo-100 rounded text-xs outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
