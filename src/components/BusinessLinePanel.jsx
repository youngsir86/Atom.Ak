import React from "react";
import { Users, Activity, UserCog } from "./ui/Icons";

export const BusinessLinePanel = ({ inputs, currentResult, handleCategoryChange }) => {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-base font-bold flex items-center text-slate-800 mb-4">
                <Users className="w-5 h-5 mr-2 text-indigo-500" />
                各业务线转化漏斗、排班量与变动成本
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {["wuchuang", "geren", "sifa"].map((catKey) => {
                    const cat = inputs.categories[catKey];
                    const res = currentResult[catKey];

                    // 计算受理费联动公式理论值
                    let processCostFormulaVal = "";
                    let processCostFormulaText = "";
                    if (catKey === "wuchuang") {
                        processCostFormulaVal = Number((cat.unitPrice * 0.08 + 30).toFixed(2));
                        processCostFormulaText = "客单价*8%+30";
                    } else if (catKey === "geren") {
                        processCostFormulaVal = Number((cat.unitPrice * 0.03 + 30).toFixed(2));
                        processCostFormulaText = "客单价*3%+30";
                    }

                    return (
                        <div key={catKey} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 relative">
                            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                                <h3 className="font-bold text-slate-700">{cat.name}业务</h3>
                                <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium border border-blue-200">
                                    {catKey === "sifa" ? "设定" : "推算"}单推广: ¥{res.derivedCost.toFixed(0)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
                                <div>
                                    <label className="text-[11px] text-slate-500 block mb-1">流量占比</label>
                                    {catKey === "sifa" ? (
                                        <div className="w-full px-2 py-1 bg-amber-50/50 border border-amber-100 text-amber-700 rounded text-xs flex justify-between items-center cursor-not-allowed">
                                            <span>{cat.leadRatio.toFixed(2)}</span>
                                            <span className="text-[9px] opacity-70">自动计算</span>
                                        </div>
                                    ) : (
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={cat.leadRatio}
                                            onChange={(e) => handleCategoryChange(catKey, "leadRatio", e.target.value)}
                                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="text-[11px] text-slate-500 block mb-1">转化率</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={cat.convRate}
                                        onChange={(e) => handleCategoryChange(catKey, "convRate", e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-slate-500 block mb-1">客单价</label>
                                    <input
                                        type="number"
                                        value={cat.unitPrice}
                                        onChange={(e) => handleCategoryChange(catKey, "unitPrice", e.target.value)}
                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-blue-600 block mb-1">部门经理人数</label>
                                    <input
                                        type="number"
                                        value={cat.centerManagers}
                                        onChange={(e) => handleCategoryChange(catKey, "centerManagers", e.target.value)}
                                        className="w-full px-2 py-1 bg-blue-50/50 border border-blue-200 rounded text-xs outline-none"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[11px] font-semibold text-blue-600 block mb-1">售中人均接待量 (排班核算基石)</label>
                                    <input
                                        type="number"
                                        value={cat.capacity}
                                        onChange={(e) => handleCategoryChange(catKey, "capacity", e.target.value)}
                                        className="w-full px-2 py-1 bg-blue-50/50 border border-blue-200 rounded text-xs outline-none"
                                    />
                                </div>

                                <div className="col-span-2 pt-2 border-t border-slate-200 mt-1">
                                    <label className="text-[11px] font-semibold text-orange-600 block mb-2 flex items-center">
                                        <Activity className="w-3 h-3 mr-1" /> 变动成本要素
                                    </label>
                                    <div className="flex space-x-2">
                                        <div className="w-1/3">
                                            {catKey === "sifa" ? (
                                                <>
                                                    <label className="text-[9px] text-slate-400 block truncate">检测(营收%)</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={cat.sifaCostRate}
                                                        onChange={(e) => handleCategoryChange(catKey, "sifaCostRate", e.target.value)}
                                                        className="w-full px-1 py-1 bg-orange-50/50 border border-orange-100 rounded text-xs outline-none"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <label className="text-[9px] text-slate-400 block truncate">检测/单笔</label>
                                                    <input
                                                        type="number"
                                                        value={cat.dealCost}
                                                        onChange={(e) => handleCategoryChange(catKey, "dealCost", e.target.value)}
                                                        className="w-full px-1 py-1 bg-orange-50/50 border border-orange-100 rounded text-xs outline-none"
                                                    />
                                                </>
                                            )}
                                        </div>
                                        <div className="w-1/3">
                                            <label className="text-[9px] text-slate-400 block truncate">提成率</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={cat.varCostRate}
                                                onChange={(e) => handleCategoryChange(catKey, "varCostRate", e.target.value)}
                                                className="w-full px-1 py-1 bg-orange-50/50 border border-orange-100 rounded text-xs outline-none"
                                            />
                                        </div>
                                        <div className="w-1/3">
                                            <label className="text-[9px] text-slate-400 block truncate">
                                                受理费/单
                                                {catKey !== "sifa" && (
                                                    <span
                                                        className="text-[8px] font-medium text-blue-500 ml-1 cursor-help underline decoration-dashed decoration-blue-300 underline-offset-2"
                                                        title={`底层公式: ${processCostFormulaText}`}
                                                    >
                                                        (联动: {processCostFormulaVal})
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="number"
                                                value={cat.processCost}
                                                onChange={(e) => handleCategoryChange(catKey, "processCost", e.target.value)}
                                                className="w-full px-1 py-1 bg-orange-50/50 border border-orange-100 rounded text-xs outline-none focus:border-orange-300"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 pt-2 border-t border-slate-200 mt-1">
                                    <label className="text-[11px] font-semibold text-blue-600 block mb-2 flex items-center">
                                        <UserCog className="w-3 h-3 mr-1" /> 专属人力核算排班量
                                    </label>
                                    <div className="flex space-x-4 bg-blue-50/50 p-2 rounded border border-blue-100">
                                        <div>
                                            <span className="text-[10px] text-slate-500 block">售中人数 (进1制发薪)</span>
                                            <span className="text-sm font-bold text-slate-800">
                                                {res.insalesHeadcount} 人
                                                <span
                                                    className="text-[10px] font-medium text-blue-500 ml-1 cursor-help underline decoration-dashed decoration-blue-300 underline-offset-2"
                                                    title="底层公式：该线日均售中量 / 售中人均接待量 * 1.4"
                                                >
                                                    (公式值: {res.exactInsalesHeadcount.toFixed(2)})
                                                </span>
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 block">部门经理人数</span>
                                            <span className="text-sm font-bold text-slate-800">{cat.centerManagers} 人</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
