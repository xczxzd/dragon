import React, { useRef, useCallback, useEffect } from 'react';
import { VideoCameraIcon, StopCircleIcon, ExclamationTriangleIcon } from './icons';
import type { CaptureError } from '../types';

interface ScreenCaptureControlProps {
    isCapturing: boolean;
    setIsCapturing: (isCapturing: boolean) => void;
    startAnalysisLoop: (getFrame: () => string | null, interval: number) => void;
    stopAnalysisLoop: () => void;
    captureError: CaptureError | null;
    setCaptureError: (error: CaptureError | null) => void;
    analysisInterval: number;
    setAnalysisInterval: (interval: number) => void;
    onCaptureStart: () => void;
    onCaptureStop: () => void;
}

export const ScreenCaptureControl: React.FC<ScreenCaptureControlProps> = ({
    isCapturing,
    setIsCapturing,
    startAnalysisLoop,
    stopAnalysisLoop,
    captureError,
    setCaptureError,
    analysisInterval,
    setAnalysisInterval,
    onCaptureStart,
    onCaptureStop,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const getFrameAsDataUrl = useCallback((): string | null => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas && video.readyState >= 2) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                return canvas.toDataURL('image/jpeg', 0.8);
            }
        }
        return null;
    }, []);

    const handleStopCapture = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCapturing(false);
        stopAnalysisLoop();
        setCaptureError(null);
        onCaptureStop();
    }, [setIsCapturing, stopAnalysisLoop, setCaptureError, onCaptureStop]);

    useEffect(() => {
        if (isCapturing) {
            startAnalysisLoop(getFrameAsDataUrl, analysisInterval);
        }
    }, [analysisInterval, isCapturing, getFrameAsDataUrl, startAnalysisLoop]);


    const handleStartCapture = async () => {
        setCaptureError(null);
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'never',
                    frameRate: 5
                } as MediaTrackConstraints,
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCapturing(true);
            onCaptureStart();
            startAnalysisLoop(getFrameAsDataUrl, analysisInterval);

            stream.getVideoTracks()[0].addEventListener('ended', handleStopCapture);

        } catch (err: any) {
            console.error("Error starting screen capture:", err);
            if (err.name === 'NotAllowedError') {
                setCaptureError({
                    title: "Permissão de Tela Negada",
                    message: "A permissão de tela é essencial para a IA analisar o mercado. Para tentar novamente, clique em 'Iniciar Captura'. Se a janela de permissão não aparecer, verifique as configurações do seu navegador."
                });
            } else {
                 setCaptureError({
                    title: "Erro na Captura",
                    message: `Não foi possível iniciar a captura. Erro: ${err.name}. Tente recarregar a página ou verifique as permissões do navegador.`
                });
            }
            setIsCapturing(false);
        }
    };
    
    const timeframes = [
        { label: '1 Min', value: 60000 },
        { label: '5 Min', value: 300000 },
        { label: '15 Min', value: 900000 },
    ];

    return (
        <div className="bg-indigo-900/70 p-4 rounded-lg shadow-xl border border-purple-800 flex flex-col gap-4">
            
            <div className="mb-2">
                <label className="block text-sm font-medium text-purple-300 mb-2">
                    Intervalo de Análise (Timeframe)
                </label>
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-indigo-950 p-1">
                    {timeframes.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setAnalysisInterval(option.value)}
                            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 ${
                                analysisInterval === option.value
                                    ? 'bg-fuchsia-600 text-white shadow-md'
                                    : 'bg-transparent text-purple-300 hover:bg-purple-900/50'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                {!isCapturing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center">
                        <VideoCameraIcon className="w-16 h-16 text-purple-600 mb-4" />
                        <p className="text-purple-300">A prévia da tela aparecerá aqui</p>
                    </div>
                )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />

            {captureError && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 mt-0.5 text-red-400 flex-shrink-0" />
                    <div className="text-left">
                         <p className="font-bold">{captureError.title}</p>
                        <p className="text-red-300/90">{captureError.message}</p>
                    </div>
                </div>
            )}
            
            {isCapturing ? (
                <button
                    onClick={handleStopCapture}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                    <StopCircleIcon className="w-6 h-6" />
                    Parar Captura
                </button>
            ) : (
                <button
                    onClick={handleStartCapture}
                    className="w-full flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                    <VideoCameraIcon className="w-6 h-6" />
                    Iniciar Captura e Análise
                </button>
            )}
        </div>
    );
};