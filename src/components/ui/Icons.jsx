import React, { useEffect, useRef } from "react";

// ==============================================================
// ✨ 原生 Lucide 解析器调度封装
// 采用 display: contents 防止额外嵌套影响 flex 布局
// ==============================================================
const createIcon = (name) =>
    ({ className, title }) => {
        const ref = useRef(null);
        useEffect(() => {
            if (ref.current) {
                ref.current.innerHTML = `<i data-lucide="${name}" class="${className || ""}"></i>`;
                if (window.lucide) {
                    window.lucide.createIcons({ root: ref.current });
                }
            }
        }, [className]);
        return <span ref={ref} className="contents" title={title} />;
    };

// 批量注册模型需要的所有图标
export const Calculator = createIcon("calculator");
export const HistoryIcon = createIcon("history"); // Rename to avoid conflict with standard terms
export const TrendingUp = createIcon("trending-up");
export const Users = createIcon("users");
export const DollarSign = createIcon("dollar-sign");
export const BarChart3 = createIcon("bar-chart-3");
export const Settings2 = createIcon("settings-2");
export const Save = createIcon("save");
export const Info = createIcon("info");
export const Activity = createIcon("activity");
export const UserCog = createIcon("user-cog");
export const RotateCcw = createIcon("rotate-ccw");
export const BookmarkPlus = createIcon("bookmark-plus");
export const Download = createIcon("download");
export const Trash2 = createIcon("trash-2");
export const PieChart = createIcon("pie-chart");
export const Sparkles = createIcon("sparkles");
export const XIcon = createIcon("x");
export const Bot = createIcon("bot");
export const CheckCircle2 = createIcon("check-circle-2");
export const Grid3X3 = createIcon("grid-3x3");
export const Target = createIcon("target");
