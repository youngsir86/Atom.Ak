import React, { useState } from "react";
import { PieChart } from "./ui/Icons";

export const LoginScreen = ({ onLoginSuccess }) => {
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === "666666") {
            onLoginSuccess();
        } else {
            setLoginError("密码错误，请重试");
            setPassword("");
        }
    };

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
};
