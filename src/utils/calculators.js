// 核心参数的利润公式与人力推算
export const calculateResult = (currentInputs) => {
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
