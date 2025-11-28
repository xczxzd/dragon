import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ScreenCaptureControl } from './components/ScreenCaptureControl';
import { AnalysisPanel } from './components/AnalysisPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { IndicatorPanel } from './components/IndicatorPanel';
import { AutoTraderPanel } from './components/AutoTraderPanel';
import type { Analysis, CaptureError, SignalLog, BotStatus, BotLog } from './types';
import { analyzeImage } from './services/geminiService';

const PRE_ANALYSIS_BUFFER_MS = 2000;
const MAX_HISTORY_LENGTH = 10;

const App: React.FC = () => {
    const [isCapturing, setIsCapturing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [captureError, setCaptureError] = useState<CaptureError | null>(null);
    const [analysisInterval, setAnalysisInterval] = useState<number>(60000); // 1 minuto por padrão
    const [signalHistory, setSignalHistory] = useState<SignalLog[]>([]);
    const [botStatus, setBotStatus] = useState<BotStatus>('DISCONNECTED');
    const [botLogs, setBotLogs] = useState<BotLog[]>([]);

    const analysisTimeoutRef = useRef<number | null>(null);
    const isAnalyzingRef = useRef<boolean>(false);

    const addBotLog = useCallback((message: string, type: BotLog['type'] = 'INFO') => {
        setBotLogs(prev => [...prev.slice(-100), { id: Date.now(), timestamp: new Date(), message, type }]);
    }, []);

    const handleAnalysis = useCallback(async (imageDataUrl: string) => {
        if (isAnalyzingRef.current) return;

        isAnalyzingRef.current = true;
        setIsLoading(true);
        setError(null);
        try {
            const result = await analyzeImage(imageDataUrl);
            setAnalysis(result);

            if (result.signal === 'CALL' || result.signal === 'PUT') {
                setSignalHistory(prevHistory => {
                    const newLog: SignalLog = {
                        ...result,
                        id: Date.now(),
                        timestamp: new Date(),
                    };
                    const updatedHistory = [newLog, ...prevHistory];
                    return updatedHistory.slice(0, MAX_HISTORY_LENGTH);
                });

                if (botStatus === 'CONNECTED') {
                    const tradeType = result.signal === 'CALL' ? 'COMPRA' : 'VENDA';
                    addBotLog(`Sinal recebido: ${tradeType} para ${result.asset} @ ${result.price.toFixed(5)} (Confiança: ${result.confidence}/10)`, 'SIGNAL');
                    addBotLog(`Enviando ordem simulada de ${tradeType}...`, 'INFO');
                    // Simulate API call to place trade
                    setTimeout(() => {
                         addBotLog(`Ordem simulada de ${tradeType} executada com sucesso!`, 'SUCCESS');
                    }, 1500);
                }
            }

        } catch (err) {
            console.error("Analysis failed:", err);
            const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            setError(`Falha na análise da IA. ${errorMessage}`);
            setAnalysis(null);
        } finally {
            setIsLoading(false);
            isAnalyzingRef.current = false;
        }
    }, [addBotLog, botStatus]);

    const stopAnalysisLoop = useCallback(() => {
        if (analysisTimeoutRef.current) {
            window.clearTimeout(analysisTimeoutRef.current);
            analysisTimeoutRef.current = null;
        }
        setAnalysis(null);
        setError(null);
        setIsLoading(false);
        isAnalyzingRef.current = false;
    }, []);
    
    const startAnalysisLoop = useCallback((getFrame: () => string | null, interval: number) => {
        stopAnalysisLoop(); 

        const performAnalysisAndScheduleNext = () => {
            setAnalysis(null);

            const frame = getFrame();
            if (frame) {
                handleAnalysis(frame).finally(() => {
                    const now = Date.now();
                    let nextDelay = interval - (now % interval) - PRE_ANALYSIS_BUFFER_MS;
                    if (nextDelay < 500) nextDelay += interval; // Ensure a minimum delay
                    analysisTimeoutRef.current = window.setTimeout(performAnalysisAndScheduleNext, nextDelay);
                });
            } else {
                 const now = Date.now();
                 let nextDelay = interval - (now % interval) - PRE_ANALYSIS_BUFFER_MS;
                 if (nextDelay < 500) nextDelay += interval;
                 analysisTimeoutRef.current = window.setTimeout(performAnalysisAndScheduleNext, nextDelay);
            }
        };

        const now = Date.now();
        let initialDelay = interval - (now % interval) - PRE_ANALYSIS_BUFFER_MS;
        if (initialDelay < 500) initialDelay += interval;
        
        analysisTimeoutRef.current = window.setTimeout(performAnalysisAndScheduleNext, initialDelay);

    }, [handleAnalysis, stopAnalysisLoop]);
    
    const handleConnect = useCallback(() => {
        setBotStatus('CONNECTING');
        addBotLog('Iniciando conexão simulada...');
        
        setTimeout(() => {
            setBotStatus('CONNECTED');
            addBotLog('Conexão estabelecida! Auto-Trader ativado.', 'SUCCESS');
            addBotLog('Aguardando sinais da PRISMA IA...', 'INFO');
        }, 1500);
    }, [addBotLog]);

    const handleDisconnect = useCallback(() => {
        setBotStatus('DISCONNECTED');
        addBotLog('Auto-Trader desativado. Captura de tela interrompida.');
    }, [addBotLog]);


    return (
        <div className="min-h-screen bg-indigo-950 text-purple-200 font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-bold text-purple-200 border-b-2 border-purple-800 pb-2">Painel de Controle</h2>
                        <ScreenCaptureControl
                            isCapturing={isCapturing}
                            setIsCapturing={setIsCapturing}
                            startAnalysisLoop={startAnalysisLoop}
                            stopAnalysisLoop={stopAnalysisLoop}
                            captureError={captureError}
                            setCaptureError={setCaptureError}
                            analysisInterval={analysisInterval}
                            setAnalysisInterval={setAnalysisInterval}
                            onCaptureStart={handleConnect}
                            onCaptureStop={handleDisconnect}
                        />
                         <AutoTraderPanel 
                            status={botStatus}
                            logs={botLogs}
                        />
                    </div>
                    <div className="flex flex-col gap-6">
                         <h2 className="text-2xl font-bold text-purple-200 border-b-2 border-purple-800 pb-2">Análise da IA</h2>
                        <AnalysisPanel 
                            analysis={analysis}
                            isLoading={isLoading}
                            error={error}
                            isCapturing={isCapturing}
                        />
                        <h2 className="text-2xl font-bold text-purple-200 border-b-2 border-purple-800 pb-2 mt-4">Indicadores Técnicos</h2>
                        <IndicatorPanel analysis={analysis} isLoading={isLoading} />

                         <h2 className="text-2xl font-bold text-purple-200 border-b-2 border-purple-800 pb-2 mt-4">Histórico de Sinais</h2>
                        <HistoryPanel history={signalHistory} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;