import React, { useState } from "react";
import { useProfitModel } from "./hooks/useProfitModel";
import { useGeminiAI } from "./hooks/useGeminiAI";
import { useHistory } from "./hooks/useHistory";
import { useMatrixSimulator } from "./hooks/useMatrixSimulator";

import { LoginScreen } from "./components/LoginScreen";
import { ResultSummaryCard } from "./components/ResultSummaryCard";
import { GlobalConfigSection } from "./components/GlobalConfigSection";
import { BusinessLinePanel } from "./components/BusinessLinePanel";
import { ResultTable } from "./components/ResultTable";
import { HistoryPanel } from "./components/HistoryPanel";
import { MatrixSimulator } from "./components/MatrixSimulator";
import { AIInsightModal } from "./components/AIInsightModal";
import { ConfirmModal } from "./components/ConfirmModal";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    show: false,
    message: "",
    onConfirm: null,
  });

  // 使用自定义 Hooks
  const {
    inputs,
    currentResult,
    handleGlobalChange,
    handleNestedChange,
    handleRatioChange,
    handleCategoryChange,
    handleManagementChange,
    setAsDefault,
    restoreDefaults,
  } = useProfitModel();

  const { history, saveToHistory, deleteHistoryRecord, clearAllHistory, exportToCSV } = useHistory(
    inputs,
    currentResult,
    setConfirmModal
  );

  const { isAnalyzing, aiAnalysis, showAiModal, setShowAiModal, generateAIAnalysis } = useGeminiAI(
    inputs,
    currentResult,
    history
  );

  const {
    matrixConfig,
    matrixData,
    showMatrixModal,
    setShowMatrixModal,
    handleMatrixConfigChange,
    generateMatrix,
  } = useMatrixSimulator(inputs, currentResult);

  // 登录态拦截
  if (!isAuthenticated) {
    return (
      <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20 selection:bg-blue-200 selection:text-blue-900">
      <div className="w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">

        {/* 顶部状态汇总与主操作区 */}
        <ResultSummaryCard
          currentResult={currentResult}
          openMatrixModal={() => setShowMatrixModal(true)}
          generateAIAnalysis={generateAIAnalysis}
          setAsDefault={() => setAsDefault(setConfirmModal)}
          restoreDefaults={() => restoreDefaults(setConfirmModal)}
          saveToHistory={saveToHistory}
        />

        {/* 骨干布局：左侧全局配置 + 右侧业务线设定 */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-3 space-y-6">
            <GlobalConfigSection
              inputs={inputs}
              currentResult={currentResult}
              handleGlobalChange={handleGlobalChange}
              handleNestedChange={handleNestedChange}
              handleRatioChange={handleRatioChange}
              handleManagementChange={handleManagementChange}
            />
          </div>

          <div className="xl:col-span-9 space-y-6">
            <BusinessLinePanel
              inputs={inputs}
              currentResult={currentResult}
              handleCategoryChange={handleCategoryChange}
            />
            {/* 底部详细核算表 */}
            <ResultTable currentResult={currentResult} />
          </div>
        </div>

        {/* 历史记录面板 */}
        <HistoryPanel
          history={history}
          clearAllHistory={() => clearAllHistory()}
          exportToCSV={exportToCSV}
          deleteHistoryRecord={deleteHistoryRecord}
        />
      </div>

      {/* ============== Modals ================= */}
      <MatrixSimulator
        matrixConfig={matrixConfig}
        matrixData={matrixData}
        showMatrixModal={showMatrixModal}
        setShowMatrixModal={setShowMatrixModal}
        handleMatrixConfigChange={handleMatrixConfigChange}
        generateMatrix={generateMatrix}
      />

      <AIInsightModal
        showAiModal={showAiModal}
        setShowAiModal={setShowAiModal}
        isAnalyzing={isAnalyzing}
        aiAnalysis={aiAnalysis}
      />

      <ConfirmModal confirmModal={confirmModal} setConfirmModal={setConfirmModal} />
    </div>
  );
}

export default App;
