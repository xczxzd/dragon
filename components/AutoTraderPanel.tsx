import React, { useRef, useEffect } from 'react';
import type { BotStatus, BotLog } from '../types';
import { RobotIcon, LinkIcon, DisconnectIcon } from './icons';

interface AutoTraderPanelProps {
    status: BotStatus;
    logs: BotLog[];
}

const StatusIndicator: React.FC<{ status: BotStatus }> = ({ status }) => {
    const statusConfig = {
        DISCONNECTED: { text: 'Desconectado', color: 'text-gray-400', bgColor: 'bg-gray-700' },
        CONNECTING: { text: 'Conectando...', color: 'text-yellow-300', bgColor: 'bg-yellow-700 animate-pulse' },
        CONNECTED: { text: 'Conectado e Operando', color: 'text-green-300', bgColor: 'bg-green-700' },
        ERROR: { text: 'Erro', color: 'text-red-300', bgColor: 'bg-red-700' },
    };
    const { text, color, bgColor } = statusConfig[status] || statusConfig.DISCONNECTED;

    return (
        <div className="flex items-center gap-2">
            <span className={`relative flex h-3 w-3`}>
                <span className={`absolute inline-flex h-full w-full rounded-full ${bgColor} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${bgColor.split(' ')[0]}`}></span>
            </span>
            <span className={`text-sm font-semibold ${color}`}>{text}</span>
        </div>
    );
};


export const AutoTraderPanel: React.FC<AutoTraderPanelProps> = ({ status, logs }) => {
    const logsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);
    
    const getLogColor = (type: BotLog['type']) => {
        switch(type) {
            case 'SUCCESS': return 'text-green-400';
            case 'ERROR': return 'text-red-400';
            case 'SIGNAL': return 'text-fuchsia-400 font-bold';
            default: return 'text-purple-300';
        }
    };

    return (
        <div className="bg-indigo-900/70 p-4 rounded-lg shadow-xl border border-purple-800 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <RobotIcon className="w-6 h-6 text-fuchsia-400" />
                    <h3 className="text-xl font-bold text-white">Auto-Trader</h3>
                </div>
                <StatusIndicator status={status} />
            </div>

            <div className="bg-black/30 rounded-lg p-2 h-48 flex flex-col">
                <pre className="flex-1 overflow-y-auto text-xs font-mono whitespace-pre-wrap p-2 scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-indigo-950">
                    {logs.map(log => (
                        <div key={log.id}>
                           <span className="text-gray-500 mr-2">{log.timestamp.toLocaleTimeString('pt-BR')}</span>
                           <span className={getLogColor(log.type)}>{log.message}</span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </pre>
            </div>

            {(status === 'DISCONNECTED' || status === 'ERROR') && (
                <div className="text-center text-purple-400 text-sm py-2 bg-indigo-950/50 rounded-md">
                    <p>Inicie a captura para ativar o Auto-Trader.</p>
                </div>
            )}
        </div>
    );
};