import React from "react";
import { Bot, XIcon } from "./ui/Icons";

export const AIInsightModal = ({
    showAiModal,
    setShowAiModal,
    isAnalyzing,
    aiAnalysis,
}) => {
    if (!showAiModal) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-center justify-between">
                    <div className="flex items-center text-white">
                        <div className="p-2 bg-white/20 rounded-xl mr-3">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">✨ AI 首席财务官洞察</h3>
                            <p className="text-indigo-100 text-xs mt-0.5">由 Gemini 2.5 驱动的实时经营诊断</p>
                        </div>
                    </div>
                    <button onClick={() => setShowAiModal(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 text-slate-700 leading-relaxed text-sm md:text-base">
                    {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-purple-600 font-medium animate-pulse">Gemini AI 正在深度剖析利润表模型数据...</p>
                            <p className="text-slate-400 text-xs mt-2">重点核对各线 ROI、变动成本占比与推广边界中...</p>
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap space-y-4 prose prose-indigo max-w-none">
                            {aiAnalysis.split("\n").map((line, i) => {
                                if (line.startsWith("**") || line.startsWith("#")) {
                                    return (
                                        <p key={i} className="font-bold text-slate-900 mt-4 mb-2 text-lg">
                                            {line.replace(/[*#]/g, "")}
                                        </p>
                                    );
                                } else if (line.startsWith("-") || line.match(/^\d+\./)) {
                                    return (
                                        <p key={i} className="pl-4 relative text-slate-700 my-1">
                                            {line}
                                        </p>
                                    );
                                }
                                return (
                                    <p key={i} className="my-2">
                                        {line}
                                    </p>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                    <button onClick={() => setShowAiModal(false)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">
                        我知道了
                    </button>
                </div>
            </div>
        </div>
    );
};
