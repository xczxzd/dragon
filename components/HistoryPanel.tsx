import React from 'react';
import type { SignalLog } from '../types';
import { HistoryIcon, ArrowUpIcon, ArrowDownIcon, ClockIcon } from './icons';

const SignalIcon: React.FC<{ signal: SignalLog['signal'] }> = ({ signal }) => {
    switch (signal) {
        case 'CALL':
            return <ArrowUpIcon className="w-5 h-5 text-green-400" />;
        case 'PUT':
            return <ArrowDownIcon className="w-5 h-5 text-red-400" />;
        default:
            return <ClockIcon className="w-5 h-5 text-yellow-400" />;
    }
};

export const HistoryPanel: React.FC<{ history: SignalLog[] }> = ({ history }) => {
    return (
        <div className="bg-indigo-900/70 p-4 rounded-lg shadow-xl border border-purple-800">
            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[150px] text-center text-purple-400">
                    <HistoryIcon className="w-10 h-10 text-purple-500 mb-2" />
                    <p>O histórico de sinais aparecerá aqui.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((log) => (
                        <div key={log.id} className="bg-indigo-950/50 p-3 rounded-md border border-purple-900/70 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <SignalIcon signal={log.signal} />
                                <div>
                                    <p className="font-bold text-white">{log.asset} @ <span className="font-mono">{log.price.toFixed(5)}</span></p>
                                    <p className="text-xs text-purple-400">{log.timestamp.toLocaleTimeString('pt-BR')}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                log.signal === 'CALL' ? 'bg-green-500/20 text-green-300' :
                                log.signal === 'PUT' ? 'bg-red-500/20 text-red-300' :
                                'bg-yellow-500/20 text-yellow-300'
                            }`}>
                                {log.signal}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
