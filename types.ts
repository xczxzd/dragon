export interface Analysis {
    asset: string;
    price: number;
    signal: 'CALL' | 'PUT' | 'WAIT';
    reasoning: string;
    indicators: {
        rsi: number;
        macd: number;
        adx: number;
        wma8: number;
        wma20: number;
        heikinAshi: 'STRONG_BULLISH' | 'STRONG_BEARISH' | 'NEUTRAL' | 'INDECISION';
        fractalBreakout: 'UP' | 'DOWN' | 'NONE';
        candlestickPattern: string;
        priceActionContext: string;
    };
    confidence: number;
}

export interface CaptureError {
    title: string;
    message: string;
}

export interface SignalLog extends Analysis {
    id: number;
    timestamp: Date;
}

export type BotStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface BotLog {
    id: number;
    timestamp: Date;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'ERROR' | 'SIGNAL';
}
