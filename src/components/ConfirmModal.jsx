import React from "react";

export const ConfirmModal = ({ confirmModal, setConfirmModal }) => {
    if (!confirmModal.show) return null;

    return (
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
    );
};
