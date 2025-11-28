import React from 'react';
import type { Analysis } from '../types';
import { ArrowUpIcon, ArrowDownIcon, ClockIcon, SparklesIcon, ExclamationTriangleIcon } from './icons';

interface AnalysisPanelProps {
    analysis: Analysis | null;
    isLoading: boolean;
    error: string | null;
    isCapturing: boolean;
}

const SignalIndicator: React.FC<{ signal: Analysis['signal'] }> = ({ signal }) => {
    switch (signal) {
        case 'CALL':
            return (
                <div className="flex flex-col items-center justify-center p-6 bg-green-500/20 rounded-full border-4 border-green-500 w-40 h-40 mx-auto">
                    <ArrowUpIcon className="w-16 h-16 text-green-400" />
                    <span className="text-3xl font-bold text-green-300 mt-2">COMPRA</span>
                </div>
            );
        case 'PUT':
            return (
                <div className="flex flex-col items-center justify-center p-6 bg-red-500/20 rounded-full border-4 border-red-500 w-40 h-40 mx-auto">
                    <ArrowDownIcon className="w-16 h-16 text-red-400" />
                    <span className="text-3xl font-bold text-red-300 mt-2">VENDA</span>
                </div>
            );
        case 'WAIT':
            return (
                <div className="flex flex-col items-center justify-center p-6 bg-yellow-500/20 rounded-full border-4 border-yellow-500 w-40 h-40 mx-auto">
                    <ClockIcon className="w-16 h-16 text-yellow-400" />
                    <span className="text-3xl font-bold text-yellow-300 mt-2">AGUARDAR</span>
                </div>
            );
        default:
            return null;
    }
};

const ConfidenceMeter: React.FC<{ confidence: number }> = ({ confidence }) => {
    const confidenceColor = confidence > 7 ? 'text-green-400' : confidence > 4 ? 'text-yellow-400' : 'text-red-400';
    return (
        <div className="text-center">
            <p className="text-sm text-purple-300 mb-1">Confiança do Sinal</p>
            <p className={`text-2xl font-bold ${confidenceColor}`}>{confidence}/10</p>
        </div>
    );
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading, error, isCapturing }) => {
    
    const renderContent = () => {
        if (error) {
            return (
                 <div className="text-center text-red-300 flex flex-col items-center justify-center h-full gap-4 p-4">
                    <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
                    <p className="font-bold">Erro na Análise</p>
                    <p className="text-sm text-red-300/80">{error}</p>
                </div>
            );
        }

        if (isLoading && !analysis) {
             return (
                <div className="text-center text-purple-300 flex flex-col items-center justify-center h-full gap-4 animate-pulse">
                    <SparklesIcon className="w-12 h-12 text-fuchsia-400" />
                    <p>Analisando o mercado...</p>
                    <p className="text-xs text-purple-400">A PRISMA IA está processando os dados.</p>
                </div>
            );
        }

        if (!isCapturing && !analysis) {
             return (
                <div className="text-center text-purple-400 flex flex-col items-center justify-center h-full gap-4 p-4">
                    <SparklesIcon className="w-12 h-12 text-purple-500" />
                    <p className="font-semibold">Aguardando Análise</p>
                    <p className="text-sm">Inicie a captura de tela para receber sinais da IA em tempo real.</p>
                </div>
            );
        }
        
        if (!analysis) {
             return (
                 <div className="text-center text-purple-400 flex flex-col items-center justify-center h-full gap-4">
                    <SparklesIcon className="w-12 h-12 text-purple-500" />
                    <p>Aguardando próxima oportunidade...</p>
                </div>
            );
        }

        return (
            <div className={`flex flex-col gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="text-center">
                    <p className="text-lg text-purple-300">{analysis.asset}</p>
                    <p className="text-4xl font-bold text-white tracking-wider">{analysis.price > 0 ? analysis.price.toFixed(5) : 'N/A'}</p>
                </div>

                <div className="grid grid-cols-3 items-center">
                    <div>{/* spacer */}</div>
                    <SignalIndicator signal={analysis.signal} />
                    <ConfidenceMeter confidence={analysis.confidence} />
                </div>

                <div className="bg-indigo-950/50 p-4 rounded-lg">
                    <h3 className="font-bold text-fuchsia-400 mb-2">Justificativa da IA:</h3>
                    <p className="text-purple-300 text-sm">{analysis.reasoning}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-indigo-900/70 p-4 rounded-lg shadow-xl border border-purple-800 min-h-[480px] flex flex-col justify-center">
            {renderContent()}
        </div>
    );
};
