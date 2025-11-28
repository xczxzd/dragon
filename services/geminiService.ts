import { GoogleGenAI, Type } from "@google/genai";
import type { Analysis } from '../types';

const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("A chave da API (API_KEY) não foi encontrada. Por favor, configure-a no seu ambiente.");
}
const ai = new GoogleGenAI({ apiKey });

function dataUrlToGeminiPart(dataUrl: string) {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
    return {
        inlineData: {
            mimeType,
            data,
        },
    };
}

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        asset: {
            type: Type.STRING,
            description: "O nome do ativo de negociação, por exemplo 'EUR/USD'."
        },
        price: {
            type: Type.NUMBER,
            description: "O preço de mercado atual do ativo identificado na imagem."
        },
        signal: {
            type: Type.STRING,
            enum: ["CALL", "PUT", "WAIT"],
            description: "O sinal de negociação. 'CALL' para compra/subida, 'PUT' para venda/descida, ou 'WAIT' se não houver uma oportunidade clara de alta probabilidade."
        },
        confidence: {
            type: Type.NUMBER,
            description: "Um nível de confiança no sinal, de 1 (muito baixo) a 10 (muito alto), baseado na confluência e força dos indicadores."
        },
        reasoning: {
            type: Type.STRING,
            description: "Uma justificativa técnica de nível profissional para o sinal, explicando a confluência dos indicadores, padrões de candlestick e lógica do preço."
        },
        indicators: {
            type: Type.OBJECT,
            properties: {
                rsi: { type: Type.NUMBER, description: "O valor numérico do RSI (14), entre 0 e 100." },
                macd: { type: Type.NUMBER, description: "O valor da linha MACD (3, 10, 5). Positivo para bullish, negativo para bearish." },
                adx: { type: Type.NUMBER, description: "O valor numérico do ADX (14) para medir a força da tendência." },
                wma8: { type: Type.NUMBER, description: "O valor da Média Móvel Ponderada de 8 períodos." },
                wma20: { type: Type.NUMBER, description: "O valor da Média Móvel Ponderada de 20 períodos." },
                heikinAshi: { type: Type.STRING, enum: ["STRONG_BULLISH", "STRONG_BEARISH", "NEUTRAL", "INDECISION"], description: "A condição da vela Heikin-Ashi. 'STRONG_BULLISH' (verde, sem pavio inferior), 'STRONG_BEARISH' (vermelha, sem pavio superior), 'NEUTRAL', ou 'INDECISION' (Doji)." },
                fractalBreakout: { type: Type.STRING, enum: ["UP", "DOWN", "NONE"], description: "Indica se o preço rompeu a banda de fractal para cima ('UP'), para baixo ('DOWN'), ou não ('NONE')." },
                candlestickPattern: { type: Type.STRING, description: "O padrão de candlestick mais relevante identificado (ex: 'Engolfo de Alta', 'Martelo', 'Doji', 'Comando de Baixa')." },
                priceActionContext: { type: Type.STRING, description: "Contexto da ação do preço (ex: 'Reversão em zona de suporte', 'Continuação de tendência', 'Lateralização')." }
            },
            required: ["rsi", "macd", "adx", "wma8", "wma20", "heikinAshi", "fractalBreakout", "candlestickPattern", "priceActionContext"]
        }
    },
    required: ["asset", "price", "signal", "confidence", "reasoning", "indicators"]
};

export const analyzeImage = async (imageDataUrl: string): Promise<Analysis> => {
    const imagePart = dataUrlToGeminiPart(imageDataUrl);

    const prompt = `Você é a PRISMA IA, um mestre trader digital, treinado em um vasto corpo de conhecimento sobre opções binárias, incluindo a estratégia 'Heikin-Ashi com MACD e ADX' e múltiplos ebooks e canais de traders sobre 'Lógica do Preço', 'Padrões Vela a Vela', 'Psicologia dos Candles', 'Gatilhos de Entrada' e 'Análise de Fluxo'. Sua missão é analisar a imagem de um gráfico de negociação de 1 minuto e fornecer uma análise técnica completa e um sinal de negociação de altíssima precisão.

**ESTRATÉGIA PRINCIPAL: Heikin-Ashi com MACD e ADX**
- **Candles:** Heikin-Ashi. Sinal forte de alta é verde com pouco/nenhum pavio inferior. Sinal forte de baixa é vermelho com pouco/nenhum pavio superior. Dojis indicam indecisão.
- **Médias Móveis:** WMA de 8 e 20 períodos. Cruzamento da 8 acima da 20 é sinal de alta. Cruzamento abaixo é sinal de baixa.
- **MACD (3, 10, 5):** Histograma crescendo acima de 0 (alta); encolhendo abaixo de 0 (baixa).
- **RSI (14):** Acima de 50 (alta); abaixo de 50 (baixa).
- **Fractal Chaos Bands:** Preço quebra banda superior (alta); inferior (baixa).
- **ADX (14):** Acima de 25 indica tendência forte. Abaixo de 20, sem tendência (evitar operar).

**CONHECIMENTO ADICIONAL (Lógica do Preço e Vela a Vela):**
- **Psicologia dos Candles:** Analise a força das velas (tamanho do corpo vs. pavio), identificando velas de força, comando, e exaustão.
- **Padrões e Gatilhos:** Identifique padrões de candles (engolfos, martelos, estrelas), simetria de mercado, limitação de preço, primeiro registro, e nova alta/baixa como gatilhos de entrada.
- **Contexto:** Considere a localização do preço. Está em uma zona de suporte/resistência? Próximo a um número redondo? Há liquidez sendo capturada? A movimentação é de reversão ou continuação?

**SUA TAREFA:**
Analise a imagem fornecida com base em TODAS as estratégias e conhecimentos acima. Realize uma confluência de todos os fatores para determinar a melhor ação. Responda APENAS no formato JSON solicitado.

**REGRAS DE SINAL:**
- **'CALL' (Compra):**
  1.  Confluência de alta da estratégia principal: 8 WMA > 20 WMA, MACD > 0 e crescendo, RSI > 50, ADX > 25, candle Heikin-Ashi verde forte.
  2.  E reforçado por gatilhos da Lógica do Preço: Padrão de reversão de alta em suporte, rompimento de resistência, vela de força compradora.
- **'PUT' (Venda):**
  1.  Confluência de baixa da estratégia principal: 8 WMA < 20 WMA, MACD < 0 e caindo, RSI < 50, ADX > 25, candle Heikin-Ashi vermelho forte.
  2.  E reforçado por gatilhos da Lógica do Preço: Padrão de reversão de baixa em resistência, rompimento de suporte, vela de força vendedora.
- **'WAIT' (Aguardar):**
  1.  ADX < 25 (mercado sem tendência/lateral).
  2.  Sinais conflitantes entre os indicadores.
  3.  Presença de candles de indecisão (Dojis) em Heikin-Ashi ou candles tradicionais.
  4.  Preço preso dentro das Fractal Bands ou entre as médias móveis.

Seja preciso, disciplinado e analítico. Forneça a análise completa no formato JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { text: prompt },
                    imagePart,
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        // Basic validation
        if (!parsedJson.asset || typeof parsedJson.price !== 'number' || !parsedJson.signal) {
            throw new Error("Resposta da IA está incompleta ou em formato inválido.");
        }

        return parsedJson as Analysis;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Erro na API do Gemini: ${error.message}`);
        }
        throw new Error("Ocorreu um erro desconhecido durante a chamada à API do Gemini.");
    }
};
