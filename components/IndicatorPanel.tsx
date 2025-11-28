import React from 'react';
import type { Analysis } from '../types';
import { BarChart3, TrendingUp, Activity, Zap } from './lucide-icons';
import { SparklesIcon } from './icons';

interface IndicatorPanelProps {
    analysis: Analysis | null;
    isLoading: boolean;
}

const IndicatorItem: React.FC<{ label: string; value: string | number; colorClass: string; icon: React.ReactNode }> = ({ label, value, colorClass, icon }) => (
    <div className="bg-indigo-950/50 rounded-lg p-3 border border-purple-900/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="text-fuchsia-400">{icon}</div>
            <span className="text-purple-300 text-sm font-medium">{label}</span>
        </div>
        <span className={`font-bold text-lg ${colorClass}`}>{value}</span>
    </div>
);


export const IndicatorPanel: React.FC<IndicatorPanelProps> = ({ analysis, isLoading }) => {
    
    if (isLoading && !analysis) {
        return (
            <div className="bg-indigo-900/70 p-4 rounded-lg shadow-xl border border-purple-800 min-h-[200px] flex items-center justify-center text-center">
                <div className="text-center text-purple-300 flex flex-col items-center justify-center h-full gap-4 animate-pulse">
                    <SparklesIcon className="w-10 h-10 text-fuchsia-400" />
                    <p>Calculando indicadores...</p>
                </div>
            </div>
        );
    }
    
    if (!analysis?.indicators) {
        return (
            <div className="bg-indigo-900/70 p-4 rounded-lg shadow-xl border border-purple-800 min-h-[200px] flex items-center justify-center text-center">
                 <div className="text-center text-purple-400 flex flex-col items-center justify-center h-full gap-4">
                    <BarChart3 className="w-10 h-10 text-purple-500" />
                    <p>Os dados dos indicadores aparecerão aqui após a análise.</p>
                </div>
            </div>
        );
    }

    const { indicators } = analysis;

    const getRSIColor = (rsi: number) => {
        if (rsi > 70) return 'text-red-300';
        if (rsi < 30) return 'text-green-300';
        return 'text-yellow-300';
    };

    const getMACDColor = (macd: number) => {
        return macd > 0 ? 'text-green-400' : 'text-red-400';
    };

    const getHeikinAshiColor = (ha: string) => {
        if (ha === 'STRONG_BULLISH') return 'text-green-400';
        if (ha === 'STRONG_BEARISH') return 'text-red-400';
        return 'text-yellow-400';
    }
    
    const getHeikinAshiLabel = (ha: string) => {
        if (ha === 'STRONG_BULLISH') return 'ALTA FORTE';
        if (ha === 'STRONG_BEARISH') return 'BAIXA FORTE';
        return 'NEUTRO';
    }
    
    return (
        <div className="bg-indigo-900/70 p-4 rounded-lg shadow-xl border border-purple-800">
            <div className="space-y-3">
                <IndicatorItem 
                    label="RSI (14)" 
                    value={indicators.rsi.toFixed(1)} 
                    colorClass={getRSIColor(indicators.rsi)} 
                    icon={<Activity className="w-5 h-5" />} 
                />
                <IndicatorItem 
                    label="MACD (3,10,5)" 
                    value={indicators.macd.toFixed(4)} 
                    colorClass={getMACDColor(indicators.macd)} 
                    icon={<TrendingUp className="w-5 h-5" />} 
                />
                 <IndicatorItem 
                    label="ADX (14)" 
                    value={indicators.adx.toFixed(1)} 
                    colorClass={indicators.adx > 25 ? "text-green-400" : "text-yellow-400"}
                    icon={<BarChart3 className="w-5 h-5" />} 
                />
                <IndicatorItem 
                    label="Heikin-Ashi" 
                    value={getHeikinAshiLabel(indicators.heikinAshi)} 
                    colorClass={getHeikinAshiColor(indicators.heikinAshi)}
                    icon={<Zap className="w-5 h-5" />} 
                />
            </div>
        </div>
    );
};
