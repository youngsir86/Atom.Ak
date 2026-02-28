import React, { useState, useEffect, useCallback, useRef } from "react";

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
        lucide.createIcons({ root: ref.current });
      }
    }, [className]);
    return <span ref={ref} className="contents" title={title} />;
  };

// 批量注册模型需要的所有图标
const Calculator = createIcon("calculator");
const History = createIcon("history");
const TrendingUp = createIcon("trending-up");
const Users = createIcon("users");
const DollarSign = createIcon("dollar-sign");
const BarChart3 = createIcon("bar-chart-3");
const Settings2 = createIcon("settings-2");
const Save = createIcon("save");
const Info = createIcon("info");
const Activity = createIcon("activity");
const UserCog = createIcon("user-cog");
const RotateCcw = createIcon("rotate-ccw");
const BookmarkPlus = createIcon("bookmark-plus");
const Download = createIcon("download");
const Trash2 = createIcon("trash-2");
const PieChart = createIcon("pie-chart");
const Sparkles = createIcon("sparkles");
const X = createIcon("x");
const Bot = createIcon("bot");
const CheckCircle2 = createIcon("check-circle-2");
const Grid3X3 = createIcon("grid-3x3");
const Target = createIcon("target");

// ==============================================================
// 工具函数
// ==============================================================
const formatCurrency = (value) => {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value) => {
  return (value * 100).toFixed(1) + "%";
};

// 提取初始默认基准数据
const INITIAL_STATE = {
  avgCostPerLead: 280,
  totalDailyLeads: 200,
  presales: { capacity: 180, leadRate: 0.2, salary: 4500 },
  insalesSalary: 5000,
  promoLaborCost: 40000,
  management: { topManagers: 2, topSalary: 15000, centerSalary: 11000 },
  costRatio: { wuchuang: 3, geren: 2, sifaManualCost: null },
  categories: {
    wuchuang: {
      name: "无创",
      leadRatio: 0.2,
      convRate: 0.3,
      unitPrice: 2500,
      capacity: 7,
      centerManagers: 1,
      dealCost: 600,
      varCostRate: 0.05,
      processCost: 230,
    },
    geren: {
      name: "个人",
      leadRatio: 0.6,
      convRate: 0.26,
      unitPrice: 1500,
      capacity: 12,
      centerManagers: 3,
      dealCost: 345,
      varCostRate: 0.05,
      processCost: 75,
    },
    sifa: {
      name: "司法",
      leadRatio: 0.2,
      convRate: 0.26,
      unitPrice: 2500,
      capacity: 9,
      centerManagers: 1,
      sifaCostRate: 0.6,
      varCostRate: 0.05,
      processCost: 0,
    },
  },
};

// ==============================================================
// 核心 App 业务逻辑
// ==============================================================
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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
    } catch (e) {}
    return INITIAL_STATE;
  });

  const [currentResult, setCurrentResult] = useState(null);

  const [history, setHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem("profitModelHistory");
      if (savedHistory) return JSON.parse(savedHistory);
    } catch (e) {
      console.error("Failed to load history", e);
    }
    return [];
  });

  // Gemini AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");

  // 🎯 策略矩阵模拟 States (新增转化率变量)
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const [matrixConfig, setMatrixConfig] = useState({
    costMin: 250,
    costMax: 350,
    leadsMin: 150,
    leadsMax: 250,
    wuchuangConvRate: 0.3,
    gerenConvRate: 0.26,
    sifaConvRate: 0.26,
    wuchuangUnitPrice: 2500,
    gerenUnitPrice: 1500,
    sifaUnitPrice: 2500,
    useFloorLabCost: false, // 检测底价模式：无创 300/个人 230/司法照旧
    groupCostShare: 0, // 集团成本分摊（元）
  });
  const [matrixData, setMatrixData] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: "", onConfirm: null });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    localStorage.setItem("profitModelConfig", JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    localStorage.setItem("profitModelHistory", JSON.stringify(history));
  }, [history]);

  const setAsDefault = () => {
    setConfirmModal({
      show: true,
      message:
        "确定将当前的全部参数设置为以后的“默认值”吗？\n(后续点击“恢复默认”将回到当前状态)",
      onConfirm: () => {
        localStorage.setItem("profitModelDefaultConfig", JSON.stringify(inputs));
        showToast("已成功保存为您的专属默认模板！");
      },
    });
  };

  const restoreDefaults = () => {
    setConfirmModal({
      show: true,
      message: "确定要恢复到默认数据吗？当前未保存的修改将被覆盖。",
      onConfirm: () => {
        let def = INITIAL_STATE;
        try {
          const customDefault = localStorage.getItem("profitModelDefaultConfig");
          if (customDefault) def = JSON.parse(customDefault);
        } catch (e) {}
        setInputs(def);
        showToast("已为您恢复到默认模板数据！");
      },
    });
  };

  const deleteHistoryRecord = (id) => {
    setConfirmModal({
      show: true,
      message: "确定要删除这条测算快照记录吗？",
      onConfirm: () => {
        setHistory((prev) => prev.filter((record) => record.id !== id));
        showToast("记录已删除");
      },
    });
  };

  const clearAllHistory = () => {
    setConfirmModal({
      show: true,
      message: "确定要清空所有历史测算记录吗？此操作不可恢复。",
      onConfirm: () => {
        setHistory([]);
        showToast("所有历史记录已清空");
      },
    });
  };

  const calculateResult = (currentInputs) => {
    const days = 30;
    const { avgCostPerLead, totalDailyLeads, presales, insalesSalary, promoLaborCost, management, costRatio, categories } =
      currentInputs;

    const catsWithLeads = {
      wuchuang: { ...categories.wuchuang, dailyLeads: totalDailyLeads * categories.wuchuang.leadRatio },
      geren: { ...categories.geren, dailyLeads: totalDailyLeads * categories.geren.leadRatio },
      sifa: { ...categories.sifa, dailyLeads: totalDailyLeads * categories.sifa.leadRatio },
    };

    const dailyPromo = avgCostPerLead * totalDailyLeads;
    const dailyConsults = totalDailyLeads > 0 && presales.leadRate > 0 ? totalDailyLeads / presales.leadRate : 0;

    const exactPresalesHeadcount = presales.capacity > 0 ? (dailyConsults / presales.capacity) * 1.4 : 0;
    const presalesHeadcount = Math.ceil(exactPresalesHeadcount);
    const totalPresalesLaborCost = presalesHeadcount * presales.salary;
    const totalMonthlyPromoCost = dailyPromo * days;

    const topManagementCost = management.topManagers * management.topSalary;

    const preCalc = {};
    let totalInsalesHeadcount = 0;

    Object.entries(catsWithLeads).forEach(([key, cat]) => {
      const monthlyLeads = cat.dailyLeads * days;
      const deals = monthlyLeads * cat.convRate;
      const revenue = deals * cat.unitPrice;

      const labCost = key === "sifa" ? revenue * (cat.sifaCostRate || 0) : deals * (cat.dealCost || 0);
      const commissionCost = revenue * (cat.varCostRate || 0);
      const processingCost = deals * (cat.processCost || 0);
      const totalVarCost = labCost + commissionCost + processingCost;

      const exactInsalesHeadcount = cat.capacity > 0 ? (cat.dailyLeads / cat.capacity) * 1.4 : 0;
      const insalesHeadcount = Math.ceil(exactInsalesHeadcount);
      const insalesLaborCost = insalesHeadcount * insalesSalary;
      totalInsalesHeadcount += insalesHeadcount;

      const leadRatioShare = totalDailyLeads > 0 ? cat.dailyLeads / totalDailyLeads : 0;
      const allocatedPresalesCost = totalPresalesLaborCost * leadRatioShare;
      const allocatedPromoLabor = promoLaborCost * leadRatioShare;

      const centerManagementCost = (cat.centerManagers || 0) * management.centerSalary;
      const allocatedTopManagement = topManagementCost * leadRatioShare;
      const totalManagementCost = centerManagementCost + allocatedTopManagement;

      const totalLaborCost = insalesLaborCost + allocatedPresalesCost + allocatedPromoLabor + totalManagementCost;

      preCalc[key] = {
        monthlyLeads,
        deals,
        revenue,
        totalVarCost,
        totalLaborCost,
        headcounts: { exactInsales: exactInsalesHeadcount, insales: insalesHeadcount },
      };
    });

    const sifaCalc = preCalc.sifa;
    let sifaZeroProfitPromoCost = sifaCalc.revenue - sifaCalc.totalVarCost - sifaCalc.totalLaborCost;
    if (sifaZeroProfitPromoCost < 0) sifaZeroProfitPromoCost = 0;
    const recommendedSifaCost = sifaCalc.monthlyLeads > 0 ? sifaZeroProfitPromoCost / sifaCalc.monthlyLeads : 0;

    const sifaActualCostPerLead =
      costRatio.sifaManualCost !== null && costRatio.sifaManualCost !== undefined
        ? parseFloat(costRatio.sifaManualCost)
        : parseFloat(recommendedSifaCost.toFixed(1));

    const sifaPromoCost = sifaActualCostPerLead * sifaCalc.monthlyLeads;

    const remainingPromoCost = totalMonthlyPromoCost - sifaPromoCost;
    const wuchuangLeads = catsWithLeads.wuchuang.dailyLeads * days;
    const gerenLeads = catsWithLeads.geren.dailyLeads * days;

    const ratioMultiplier = costRatio.wuchuang / costRatio.geren;
    const denominator = gerenLeads + ratioMultiplier * wuchuangLeads;

    let gerenCostPerLead = 0;
    let wuchuangCostPerLead = 0;
    if (denominator > 0 && remainingPromoCost > 0) {
      gerenCostPerLead = remainingPromoCost / denominator;
      wuchuangCostPerLead = gerenCostPerLead * ratioMultiplier;
    }
    const derivedCostPerLead = { wuchuang: wuchuangCostPerLead, geren: gerenCostPerLead, sifa: sifaActualCostPerLead };

    const results = {};
    let totalRevenue = 0;
    let totalLaborCost = 0;
    let totalOtherCost = 0;

    Object.entries(catsWithLeads).forEach(([key, cat]) => {
      const calc = preCalc[key];
      const promoCost = derivedCostPerLead[key] * calc.monthlyLeads;
      const totalCost = promoCost + calc.totalLaborCost + calc.totalVarCost;
      const grossProfit = calc.revenue - totalCost;
      const roi = promoCost > 0 ? calc.revenue / promoCost : 0;

      results[key] = {
        name: cat.name,
        revenue: calc.revenue,
        promoCost,
        laborCost: calc.totalLaborCost,
        otherCosts: calc.totalVarCost,
        totalCost,
        grossProfit,
        roi,
        derivedCost: derivedCostPerLead[key],
        exactInsalesHeadcount: calc.headcounts.exactInsales,
        insalesHeadcount: calc.headcounts.insales,
      };

      totalRevenue += calc.revenue;
      totalLaborCost += calc.totalLaborCost;
      totalOtherCost += calc.totalVarCost;
    });

    results.total = {
      name: "合计汇总",
      revenue: totalRevenue,
      promoCost: totalMonthlyPromoCost,
      laborCost: totalLaborCost,
      otherCost: totalOtherCost,
      totalCost: totalMonthlyPromoCost + totalLaborCost + totalOtherCost,
      grossProfit: totalRevenue - (totalMonthlyPromoCost + totalLaborCost + totalOtherCost),
      roi: totalMonthlyPromoCost > 0 ? totalRevenue / totalMonthlyPromoCost : 0,
      exactPresalesHeadcount,
      presalesHeadcount,
      insalesHeadcount: totalInsalesHeadcount,
      recommendedSifaCost,
    };

    return results;
  };

  useEffect(() => {
    setCurrentResult(calculateResult(inputs));
  }, [inputs]);

  // ✨ 策略矩阵生成逻辑 (寻找盈亏平衡点)
  const generateMatrix = useCallback(() => {
    const data = [];
    const columns = [];
    const breakEvenCells = [];

    const costMin = parseInt(matrixConfig.costMin) || 0;
    const costMax = parseInt(matrixConfig.costMax) || 0;
    const leadsMin = parseInt(matrixConfig.leadsMin) || 0;
    const leadsMax = parseInt(matrixConfig.leadsMax) || 0;

    const wConv = parseFloat(matrixConfig.wuchuangConvRate) || 0;
    const gConv = parseFloat(matrixConfig.gerenConvRate) || 0;
    const sConv = parseFloat(matrixConfig.sifaConvRate) || 0;

    // 解析面板上的自定义客单价
    const wPrice = parseFloat(matrixConfig.wuchuangUnitPrice) || 0;
    const gPrice = parseFloat(matrixConfig.gerenUnitPrice) || 0;
    const sPrice = parseFloat(matrixConfig.sifaUnitPrice) || 0;
    const useFloorLabCost = !!matrixConfig.useFloorLabCost;

    // 模拟客单价变动时，同步联动计算出最新的受理费
    const wProcessCost = Number((wPrice * 0.08 + 30).toFixed(2));
    const gProcessCost = Number((gPrice * 0.03 + 30).toFixed(2));
    const sProcessCost = inputs.categories.sifa.processCost;

    for (let cost = costMin; cost <= costMax; cost += 10) {
      columns.push(cost);
    }

    for (let leads = leadsMin; leads <= leadsMax; leads += 10) {
      const row = { leads, cells: [] };
      let closestToZeroCell = null;
      let minAbsProfit = Infinity;

      for (let cost = costMin; cost <= costMax; cost += 10) {
        const simInputs = {
          ...inputs,
          avgCostPerLead: cost,
          totalDailyLeads: leads,
          categories: {
            ...inputs.categories,
            wuchuang: {
              ...inputs.categories.wuchuang,
              convRate: wConv,
              unitPrice: wPrice,
              processCost: wProcessCost,
              dealCost: useFloorLabCost ? 300 : inputs.categories.wuchuang.dealCost,
            },
            geren: {
              ...inputs.categories.geren,
              convRate: gConv,
              unitPrice: gPrice,
              processCost: gProcessCost,
              dealCost: useFloorLabCost ? 230 : inputs.categories.geren.dealCost,
            },
            // 司法仍然按照营收*0.6 的 sifaCostRate 规则，保持不变
            sifa: { ...inputs.categories.sifa, convRate: sConv, unitPrice: sPrice, processCost: sProcessCost },
          },
        };

        const res = calculateResult(simInputs);
        const profit = res.total.grossProfit - matrixConfig.groupCostShare;
        const roi = res.total.roi;

        const cell = { cost, leads, profit, roi };
        row.cells.push(cell);

        if (Math.abs(profit) < minAbsProfit) {
          minAbsProfit = Math.abs(profit);
          closestToZeroCell = cell;
        }
      }

      if (closestToZeroCell) breakEvenCells.push(closestToZeroCell);
      data.push(row);
    }

    setMatrixData({ columns, rows: data, breakEvenCells });
  }, [inputs, matrixConfig]);

  const openMatrixModal = () => {
    setMatrixConfig((prev) => ({
      costMin: Math.max(10, Math.floor(inputs.avgCostPerLead / 10) * 10 - 50),
      costMax: Math.floor(inputs.avgCostPerLead / 10) * 10 + 50,
      leadsMin: Math.max(10, Math.floor(inputs.totalDailyLeads / 10) * 10 - 50),
      leadsMax: Math.floor(inputs.totalDailyLeads / 10) * 10 + 50,
      wuchuangConvRate: inputs.categories.wuchuang.convRate,
      gerenConvRate: inputs.categories.geren.convRate,
      sifaConvRate: inputs.categories.sifa.convRate,
      wuchuangUnitPrice: inputs.categories.wuchuang.unitPrice,
      gerenUnitPrice: inputs.categories.geren.unitPrice,
      sifaUnitPrice: inputs.categories.sifa.unitPrice,
      useFloorLabCost: prev.useFloorLabCost || false,
      groupCostShare: prev.groupCostShare || 0,
    }));
    setMatrixData(null);
    setShowMatrixModal(true);
  };

  const handleMatrixConfigChange = (field, value) => {
    setMatrixConfig((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (showMatrixModal && matrixData) {
      const timer = setTimeout(() => {
        generateMatrix();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    matrixConfig.wuchuangConvRate,
    matrixConfig.gerenConvRate,
    matrixConfig.sifaConvRate,
    matrixConfig.wuchuangUnitPrice,
    matrixConfig.gerenUnitPrice,
    matrixConfig.sifaUnitPrice,
    matrixConfig.useFloorLabCost,
    matrixConfig.groupCostShare,
  ]);

  // ✨ Gemini AI Integration
  const generateAIAnalysis = async () => {
    if (!currentResult) return;

    setIsAnalyzing(true);
    setShowAiModal(true);
    setAiAnalysis("");

    // 说明：GitHub Pages 上不要硬编码 key，建议自行从 localStorage 读取或在代码里填入
    const apiKey = localStorage.getItem("GEMINI_API_KEY") || "";
    if (!apiKey) {
      setAiAnalysis(
        "尚未配置 Gemini API Key。\n\n你可以在浏览器控制台执行：\nlocalStorage.setItem('GEMINI_API_KEY','你的key')\n\n然后重新点击“AI 智能洞察”。"
      );
      setIsAnalyzing(false);
      return;
    }

    const model = "gemini-2.5-flash-preview-09-2025";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const promptData = `
作为资深企业财务与运营分析专家（CFO视角），请根据以下大搜渠道（百度搜索为主）亲子鉴定业务的月度测算快照数据，提供一份专业的诊断报告。

【大盘财务表现】
- 月度总营收：${currentResult.total.revenue.toFixed(0)}元
- 月度总成本：${currentResult.total.totalCost.toFixed(0)}元（其中推广费占${currentResult.total.promoCost.toFixed(
      0
    )}元，人力摊销占${currentResult.total.laborCost.toFixed(0)}元，变动成本占${currentResult.total.otherCost.toFixed(
      0
    )}元）
- 净毛利额：${currentResult.total.grossProfit.toFixed(0)}元
- 全盘综合 ROI (营收/推广)：${currentResult.total.roi.toFixed(2)}

【核心业务线表现拆解】
1. 无创产前检测：贡献营收${currentResult.wuchuang.revenue.toFixed(0)}元，产生毛利${currentResult.wuchuang.grossProfit.toFixed(
      0
    )}元，业务ROI ${currentResult.wuchuang.roi.toFixed(2)}，逆推单转成本约为${currentResult.wuchuang.derivedCost.toFixed(
      0
    )}元。
2. 个人健康检测：贡献营收${currentResult.geren.revenue.toFixed(0)}元，产生毛利${currentResult.geren.grossProfit.toFixed(
      0
    )}元，业务ROI ${currentResult.geren.roi.toFixed(2)}，逆推单转成本约为${currentResult.geren.derivedCost.toFixed(
      0
    )}元。
3. 司法鉴定：贡献营收${currentResult.sifa.revenue.toFixed(0)}元，产生毛利${currentResult.sifa.grossProfit.toFixed(
      0
    )}元，当前设定的单成本为${currentResult.sifa.derivedCost.toFixed(0)}元（零毛利的安全阈值推荐为约为${currentResult.total.recommendedSifaCost.toFixed(
      0
    )}元）。

请按以下结构输出简明扼要的报告（适当使用粗体和emoji）：
1. 💡 **经营健康度总览**：一针见血评价当前利润模型的良性程度。
2. ⚠️ **利润黑洞诊断**：分析成本结构（推广、人力、化验费）是否存在失衡，哪个业务线是短板或拖油瓶。
3. ✨ **核心优化策略**：结合流量漏斗或人员效率给出3条切实可行的优化建议（例如提升某项转化率或调整流量比重）。
注意：直接输出内容，不需要客套话。
`;

    const payload = {
      contents: [{ parts: [{ text: promptData }] }],
    };

    let retries = 5;
    let delay = 1000;
    let success = false;

    while (retries > 0 && !success) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          setAiAnalysis(text);
          success = true;
        } else {
          throw new Error("No text returned from Gemini API");
        }
      } catch (error) {
        retries--;
        if (retries === 0) {
          setAiAnalysis("抱歉，AI 诊断引擎当前响应超时，请关闭弹窗后重新点击尝试。");
        } else {
          await new Promise((res) => setTimeout(res, delay));
          delay *= 2;
        }
      }
    }
    setIsAnalyzing(false);
  };

  const saveToHistory = () => {
    if (!currentResult) return;
    const newRecord = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString("zh-CN", { hour12: false }),
      avgCostPerLead: inputs.avgCostPerLead,
      totalDailyLeads: inputs.totalDailyLeads,
      monthlyPromo: currentResult.total.promoCost,
      totalRevenue: currentResult.total.revenue,
      totalGrossProfit: currentResult.total.grossProfit,
      totalRoi: currentResult.total.roi,
      wuchuangCost: currentResult.wuchuang.derivedCost,
      gerenCost: currentResult.geren.derivedCost,
      sifaCost: currentResult.sifa.derivedCost,
      inputsSnapshot: JSON.parse(JSON.stringify(inputs)),
      resultSnapshot: JSON.parse(JSON.stringify(currentResult)),
    };
    setHistory([...history, newRecord]);
    showToast("当前测算快照已成功保存！");
  };

  const exportToCSV = () => {
    const headers = [
      "快照时间",
      "综合单成本",
      "大盘总日均量",
      "大盘总营收",
      "总推广费",
      "总人力成本",
      "总变动成本",
      "大盘总毛利",
      "综合ROI(销售/推广)",
      "无创日均量",
      "无创转化率",
      "无创推算单成本",
      "无创营收",
      "无创毛利",
      "个人日均量",
      "个人转化率",
      "个人推算单成本",
      "个人营收",
      "个人毛利",
      "司法日均量",
      "司法转化率",
      "司法设定单成本",
      "司法营收",
      "司法毛利",
    ];

    const rows = history.map((row) => {
      const res = row.resultSnapshot || {};
      const inp = row.inputsSnapshot || {};

      const safeNum = (val) => (typeof val === "number" ? val.toFixed(2) : val || 0);

      return [
        row.timestamp,
        safeNum(row.avgCostPerLead),
        safeNum(row.totalDailyLeads),
        safeNum(res.total?.revenue),
        safeNum(res.total?.promoCost),
        safeNum(res.total?.laborCost),
        safeNum(res.total?.otherCost),
        safeNum(res.total?.grossProfit),
        safeNum(res.total?.roi),
        safeNum(inp.totalDailyLeads * inp.categories?.wuchuang?.leadRatio),
        safeNum(inp.categories?.wuchuang?.convRate),
        safeNum(row.wuchuangCost),
        safeNum(res.wuchuang?.revenue),
        safeNum(res.wuchuang?.grossProfit),
        safeNum(inp.totalDailyLeads * inp.categories?.geren?.leadRatio),
        safeNum(inp.categories?.geren?.convRate),
        safeNum(row.gerenCost),
        safeNum(res.geren?.revenue),
        safeNum(res.geren?.grossProfit),
        safeNum(inp.totalDailyLeads * inp.categories?.sifa?.leadRatio),
        safeNum(inp.categories?.sifa?.convRate),
        safeNum(row.sifaCost),
        safeNum(res.sifa?.revenue),
        safeNum(res.sifa?.grossProfit),
      ].join(",");
    });

    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `利润测算明细报告_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGlobalChange = (field, value) => setInputs((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
  const handleManagementChange = (field, value) =>
    setInputs((prev) => ({ ...prev, management: { ...prev.management, [field]: parseFloat(value) || 0 } }));

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

  const handleNestedChange = (section, field, value) =>
    setInputs((prev) => ({ ...prev, [section]: { ...prev[section], [field]: parseFloat(value) || 0 } }));

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

      // 新增：客单价变更时自动联动计算受理费
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

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "666666") {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('密码错误，请重试');
      setPassword('');
    }
  };

  if (!currentResult) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <PieChart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">大搜渠道利润测算模型 V1.0.0</h1>
              <p className="text-slate-500">请输入访问密码继续</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">输入密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入登录密码"
                />
              </div>

              {loginError && (
                <div className="text-red-500 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-md"
              >
                登录进入系统
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-sm">
                权限开通请联系：<span className="font-semibold text-slate-600">杨洪海</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-800 font-sans pb-20 relative">
      {/* 顶部悬浮 Toast 提示 */}
      {toast.show && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[70] transition-opacity duration-300">
          <div className="flex items-center px-5 py-3 rounded-full shadow-xl text-sm font-medium bg-slate-800 text-white border border-slate-700">
            <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-400" />
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* 顶部控制栏 */}
        <header className="flex flex-col xl:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-inner border border-blue-500">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">大搜渠道利润测算模型 V1.0.0</h1>
              <p className="text-sm text-slate-500 mt-1">核心业务：亲子鉴定（无创/个人/司法） | 核心渠道：百度搜索</p>
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

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* 左侧：全局控制台 */}
          <div className="xl:col-span-3 space-y-6">
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
                        className={`absolute left-2.5 top-1.5 text-xs ${
                          inputs.costRatio.sifaManualCost === null ? "text-emerald-500" : "text-slate-400"
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
                        className={`w-full pl-6 pr-2 py-1.5 bg-white border rounded text-sm font-bold outline-none focus:ring-1 ${
                          inputs.costRatio.sifaManualCost === null
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
                    <label className="text-[11px] text-slate-500 block mb-1">营销中心管理层(售前+总监)总人数</label>
                    <input
                      type="number"
                      value={inputs.management.topManagers}
                      onChange={(e) => handleManagementChange("topManagers", e.target.value)}
                      className="w-full px-2 py-1.5 bg-indigo-50/50 border border-indigo-100 rounded text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">营销中心管理层人均薪资</label>
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
          </div>

          {/* 右侧：业务线与结果 */}
          <div className="xl:col-span-9 space-y-6">
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

            {/* 月度核算表 */}
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
                              className={`w-2 h-2 rounded-full mr-2 ${
                                key === "wuchuang" ? "bg-emerald-400" : key === "geren" ? "bg-blue-400" : "bg-amber-400"
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
          </div>
        </div>

        {/* 历史测算记录面板 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6 w-full">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="font-bold text-slate-800 flex items-center">
                <History className="w-5 h-5 mr-2 text-slate-500" /> 历史测算记录快照
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
                <History className="w-12 h-12 mb-3 text-slate-200 opacity-50" />
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
      </div>

      {/* ============================================================== */}
      {/* ✨ 策略矩阵模拟弹窗 Modal (盈亏平衡点追踪) */}
      {/* ============================================================== */}
      {showMatrixModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[1400px] max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
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
              <div className="flex items-center space-x-3">
                {/* 集团成本分摊输入框 - 橙色主题，与标题栏协调 */}
                <div className="flex items-center px-3 py-2 bg-white/95 hover:bg-white rounded-lg border-2 border-orange-300 shadow-md transition-all">
                  <label className="text-xs font-bold text-orange-700 whitespace-nowrap mr-2">
                    集团成本分摊:
                  </label>
                  <div className="relative">
                    <span className="absolute left-1.5 top-1 text-orange-600 text-xs font-bold">¥</span>
                    <input
                      type="number"
                      step="1000"
                      value={matrixConfig.groupCostShare}
                      onChange={(e) => handleMatrixConfigChange("groupCostShare", e.target.value)}
                      className="w-28 pl-5 pr-2 py-1 bg-orange-50/50 border border-orange-200 text-orange-700 rounded text-sm font-bold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 text-right placeholder-orange-400"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* 检测底价模式 - 绿色主题，表示底价检测 */}
                <div className="flex items-center px-3 py-2 bg-emerald-50/95 hover:bg-emerald-50 rounded-lg border-2 border-emerald-300 shadow-md transition-all" title="检测底价模式计算规则：无创 300 元/单，个人 150 元/单，司法 0.5">
                  <label className="flex items-center text-xs font-bold text-emerald-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="mr-2 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                      checked={!!matrixConfig.useFloorLabCost}
                      onChange={(e) => handleMatrixConfigChange("useFloorLabCost", e.target.checked)}
                    />
                    检测底价模式
                  </label>
                </div>
                <button onClick={() => setShowMatrixModal(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Control Panel */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 flex flex-wrap items-end gap-4">
              {/* 区间设定 */}
              <div className="flex space-x-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">综合单成本(下限)</label>
                  <input
                    type="number"
                    step="10"
                    value={matrixConfig.costMin}
                    onChange={(e) => handleMatrixConfigChange("costMin", e.target.value)}
                    className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">综合单成本(上限)</label>
                  <input
                    type="number"
                    step="10"
                    value={matrixConfig.costMax}
                    onChange={(e) => handleMatrixConfigChange("costMax", e.target.value)}
                    className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex space-x-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">总日均售中量(下限)</label>
                  <input
                    type="number"
                    step="10"
                    value={matrixConfig.leadsMin}
                    onChange={(e) => handleMatrixConfigChange("leadsMin", e.target.value)}
                    className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">总日均售中量(上限)</label>
                  <input
                    type="number"
                    step="10"
                    value={matrixConfig.leadsMax}
                    onChange={(e) => handleMatrixConfigChange("leadsMax", e.target.value)}
                    className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 转化率实时调节区 */}
              <div className="flex space-x-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <label className="text-[10px] font-bold text-emerald-600 block mb-1">无创转化率</label>
                  <input
                    type="number"
                    step="0.01"
                    value={matrixConfig.wuchuangConvRate}
                    onChange={(e) => handleMatrixConfigChange("wuchuangConvRate", e.target.value)}
                    className="w-20 px-2 py-1 bg-emerald-50/50 border border-emerald-200 text-emerald-700 rounded text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-indigo-600 block mb-1">个人转化率</label>
                  <input
                    type="number"
                    step="0.01"
                    value={matrixConfig.gerenConvRate}
                    onChange={(e) => handleMatrixConfigChange("gerenConvRate", e.target.value)}
                    className="w-20 px-2 py-1 bg-indigo-50/50 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-amber-600 block mb-1">司法转化率</label>
                  <input
                    type="number"
                    step="0.01"
                    value={matrixConfig.sifaConvRate}
                    onChange={(e) => handleMatrixConfigChange("sifaConvRate", e.target.value)}
                    className="w-20 px-2 py-1 bg-amber-50/50 border border-amber-200 text-amber-700 rounded text-sm font-semibold outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* 客单价实时调节区 */}
              <div className="flex space-x-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <label className="text-[10px] font-bold text-emerald-600 block mb-1">无创客单价</label>
                  <input
                    type="number"
                    step="100"
                    value={matrixConfig.wuchuangUnitPrice}
                    onChange={(e) => handleMatrixConfigChange("wuchuangUnitPrice", e.target.value)}
                    className="w-24 px-2 py-1 bg-emerald-50/50 border border-emerald-200 text-emerald-700 rounded text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-indigo-600 block mb-1">个人客单价</label>
                  <input
                    type="number"
                    step="100"
                    value={matrixConfig.gerenUnitPrice}
                    onChange={(e) => handleMatrixConfigChange("gerenUnitPrice", e.target.value)}
                    className="w-24 px-2 py-1 bg-indigo-50/50 border border-indigo-200 text-indigo-700 rounded text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-amber-600 block mb-1">司法客单价</label>
                  <input
                    type="number"
                    step="100"
                    value={matrixConfig.sifaUnitPrice}
                    onChange={(e) => handleMatrixConfigChange("sifaUnitPrice", e.target.value)}
                    className="w-24 px-2 py-1 bg-amber-50/50 border border-amber-200 text-amber-700 rounded text-sm font-semibold outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                onClick={generateMatrix}
                className="flex items-center h-[46px] px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-md"
              >
                <BarChart3 className="w-4 h-4 mr-2" /> 生成/刷新矩阵
              </button>
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
      )}

      {/* 确认操作弹窗 Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-2">操作确认</h3>
              <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button
                onClick={() => setConfirmModal({ show: false, message: "", onConfirm: null })}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ show: false, message: "", onConfirm: null });
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                确认执行
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal 弹窗 */}
      {showAiModal && (
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
                <X className="w-6 h-6" />
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
      )}
    </div>
  );
}

export default App;

