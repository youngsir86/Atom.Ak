import { useState, useCallback, useEffect } from "react";
import { calculateResult } from "../utils/calculators";

export const useMatrixSimulator = (inputs) => {
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
        useFloorLabCost: false,
        groupCostShare: 0,
    });
    const [matrixData, setMatrixData] = useState(null);

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

        const wPrice = parseFloat(matrixConfig.wuchuangUnitPrice) || 0;
        const gPrice = parseFloat(matrixConfig.gerenUnitPrice) || 0;
        const sPrice = parseFloat(matrixConfig.sifaUnitPrice) || 0;
        const useFloorLabCost = !!matrixConfig.useFloorLabCost;

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return {
        showMatrixModal,
        setShowMatrixModal,
        matrixConfig,
        matrixData,
        openMatrixModal,
        handleMatrixConfigChange,
        generateMatrix,
    };
};
