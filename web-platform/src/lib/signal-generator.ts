/**
 * Shared signal generation pipeline.
 *
 * Used by:
 *   - POST /api/signals/request       (web session auth)
 *   - POST /api/bot/signal-request     (bot secret auth)
 *   - POST /api/tma/signal-request     (TMA initData auth)
 *
 * All signals (web, bot, TMA) go through the same generation + storage pipeline.
 */
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { canReceiveSignal } from "@/lib/access";
import { TIER_ACCESS, type SignalBand } from "@/lib/tier";
import { getCandles, type Candle } from "@/lib/marketdata";

// ─── Constants ───

const PAIRS: Record<SignalBand, string[]> = {
  otc: [
    // Forex
    "AED/CNY (OTC)", "AUD/CAD (OTC)", "CAD/JPY (OTC)", "EUR/GBP (OTC)",
    "EUR/JPY (OTC)", "GBP/JPY (OTC)", "NZD/USD (OTC)", "OMR/CNY (OTC)",
    "USD/CNH (OTC)", "USD/MYR (OTC)", "USD/PHP (OTC)", "USD/SGD (OTC)",
    "YER/USD (OTC)", "USD/ARS (OTC)", "USD/PKR (OTC)", "EUR/NZD (OTC)",
    "AUD/NZD (OTC)", "USD/CLP (OTC)", "CHF/JPY (OTC)", "LBP/USD (OTC)",
    "USD/THB (OTC)", "AUD/USD (OTC)", "AUD/JPY (OTC)", "NGN/USD (OTC)",
    "QAR/CNY (OTC)", "BHD/CNY (OTC)", "USD/JPY (OTC)", "NZD/JPY (OTC)",
    "USD/INR (OTC)", "EUR/HUF (OTC)", "MAD/USD (OTC)", "CAD/CHF (OTC)",
    "USD/EGP (OTC)", "ZAR/USD (OTC)", "EUR/USD (OTC)", "GBP/USD (OTC)",
    "AUD/CHF (OTC)", "USD/BRL (OTC)", "USD/BDT (OTC)", "EUR/CHF (OTC)",
    "KES/USD (OTC)", "USD/COP (OTC)", "CHF/NOK (OTC)", "USD/VND (OTC)",
    "JOD/CNY (OTC)", "TND/USD (OTC)", "USD/IDR (OTC)", "USD/DZD (OTC)",
    "UAH/USD (OTC)", "USD/MXN (OTC)", "GBP/AUD (OTC)", "USD/CHF (OTC)",
    "EUR/TRY (OTC)", "USD/CAD (OTC)", "SAR/CNY (OTC)",
    // Crypto
    "Bitcoin ETF (OTC)", "BNB (OTC)", "Polkadot (OTC)", "Litecoin (OTC)",
    "Toncoin (OTC)", "Ethereum (OTC)", "Avalanche (OTC)", "Chainlink (OTC)",
    "Polygon (OTC)", "Bitcoin (OTC)", "Cardano (OTC)", "TRON (OTC)",
    "Solana (OTC)", "Dogecoin (OTC)",
    // Commodities
    "Brent Oil (OTC)", "WTI Oil (OTC)", "Silver (OTC)", "Gold (OTC)",
    "Natural Gas (OTC)", "Palladium (OTC)", "Platinum (OTC)",
    // Stocks
    "Apple (OTC)", "GameStop (OTC)", "VISA (OTC)", "American Express (OTC)",
    "VIX (OTC)", "Pfizer (OTC)", "AMD (OTC)",
    "Johnson & Johnson (OTC)", "Marathon Digital (OTC)", "Amazon (OTC)",
    "Netflix (OTC)", "ExxonMobil (OTC)", "Coinbase (OTC)", "Cisco (OTC)",
    "Alibaba (OTC)", "Citigroup (OTC)", "FedEx (OTC)", "Meta (OTC)",
    "Intel (OTC)", "Palantir (OTC)", "McDonald's (OTC)",
    "Tesla (OTC)", "Microsoft (OTC)",
    // Indices
    "AUS 200 (OTC)", "FTSE 100 (OTC)", "DAX 30 (OTC)", "Dow Jones (OTC)",
    "E35EUR (OTC)", "E50EUR (OTC)", "CAC 40 (OTC)", "Nikkei 225 (OTC)",
    "NASDAQ 100 (OTC)", "S&P 500 (OTC)",
  ],
  exchange: [
    "CHF/JPY", "EUR/CAD", "AUD/JPY", "CAD/JPY",
    "AUD/CHF", "EUR/USD", "EUR/CHF", "AUD/CAD",
    "EUR/AUD", "GBP/JPY", "USD/JPY", "EUR/JPY",
    "EUR/GBP", "GBP/USD", "GBP/CAD", "USD/CAD",
    "GBP/CHF", "AUD/USD", "USD/CHF", "CAD/CHF",
    "GBP/AUD", "BTC/USD",
  ],
  elite: [],
};

const EXPIRATIONS: Record<SignalBand, readonly string[]> = {
  otc: ["30s", "60s", "2m", "3m", "5m", "30m"],
  exchange: ["2m", "3m", "5m", "30m"],
  elite: ["2m", "3m", "5m", "30m"],
};

const DIRECTIONS = ["CALL", "PUT"] as const;

const ELITE_PAIRS = PAIRS.elite;

// ─── Helpers ───

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate entry time: current time + random 1-4 minutes, formatted as HH:MM.
 * Uses Moscow timezone (UTC+3).
 */
function calcEntryTime(): string {
  const offsetMin = randomInt(1, 4);
  const entry = new Date(Date.now() + offsetMin * 60_000);
  // Format in Moscow timezone
  return entry.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

/**
 * Determine which signal band a pair belongs to.
 */
function bandFromPair(pair: string): SignalBand {
  if (pair.includes("(OTC)")) return "otc";
  if (ELITE_PAIRS.includes(pair)) return "elite";
  return "exchange";
}

/**
 * Generate synthetic candles for OTC pairs — a gentle trend matching the direction.
 */
function generateSyntheticCandles(
  direction: "CALL" | "PUT",
  count = 30,
): { candles: Candle[]; lastClose: number } {
  const basePrice = 1.0 + Math.random() * 0.5; // e.g. 1.0–1.5
  const trend = direction === "CALL" ? 0.0003 : -0.0003;
  const candles: Candle[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = 0; i < count; i++) {
    const noise = (Math.random() - 0.5) * 0.001;
    const open = price;
    const close = price + trend + noise;
    const high = Math.max(open, close) + Math.random() * 0.0005;
    const low = Math.min(open, close) - Math.random() * 0.0005;
    candles.push({
      t: now - (count - i) * 60,
      o: +open.toFixed(5),
      h: +high.toFixed(5),
      l: +low.toFixed(5),
      c: +close.toFixed(5),
    });
    price = close;
  }

  return { candles, lastClose: candles[candles.length - 1].c };
}

// ─── Technical indicators ───

function calcEMA(closes: number[], period: number): number {
  if (closes.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = closes[0];
  for (let i = 1; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
  }
  return ema;
}

function calcRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return +(100 - 100 / (1 + rs)).toFixed(1);
}

function findLevels(candles: Candle[]): { support: number; resistance: number } {
  const lows = candles.map((c) => c.l);
  const highs = candles.map((c) => c.h);
  return {
    support: Math.min(...lows),
    resistance: Math.max(...highs),
  };
}

function directionFromIndicators(rsi: number, ema20: number, ema50: number, lastClose: number): "CALL" | "PUT" {
  let score = 0;
  if (rsi < 40) score += 1;
  else if (rsi > 60) score -= 1;
  if (ema20 > ema50) score += 1;
  else score -= 1;
  if (lastClose > ema20) score += 1;
  else score -= 1;
  return score >= 0 ? "CALL" : "PUT";
}

function confidenceFromIndicators(
  rsi: number,
  ema20: number,
  ema50: number,
  lastClose: number,
  band: SignalBand,
): number {
  const base = band === "elite" ? 88 : 80;
  let bonus = 0;
  if ((ema20 > ema50 && lastClose > ema20) || (ema20 < ema50 && lastClose < ema20)) bonus += 4;
  if (rsi < 30 || rsi > 70) bonus += 3;
  if ((rsi < 45 && ema20 > ema50) || (rsi > 55 && ema20 < ema50)) bonus += 2;
  return Math.min(base + bonus + randomInt(0, 3), 96);
}

function buildAnalysis(
  pair: string,
  direction: "CALL" | "PUT",
  _band: SignalBand,
  rsi: number,
  ema20: number,
  ema50: number,
  support: number,
  resistance: number,
  entryPrice: number,
): string {
  const prec = entryPrice > 100 ? 2 : entryPrice > 10 ? 4 : 5;
  const isCall = direction === "CALL";
  const emaSignal = ema20 > ema50 ? "бычье" : "медвежье";
  const rsiLabel =
    rsi < 30 ? "перепроданность" : rsi > 70 ? "перекупленность" : "нейтральная зона";

  const callTemplates = [
    [
      `📊 Анализ ${pair}`,
      `\n\nЦена сейчас: ${entryPrice.toFixed(prec)}`,
      `\nУровень поддержки: ${support.toFixed(prec)}`,
      `\n\n🟢 Почему ВВЕРХ:`,
      `\nЦена опустилась к сильному уровню поддержки (${support.toFixed(prec)}) — это зона, от которой покупатели раньше уже разворачивали цену наверх.`,
      `\nRSI(14) = ${rsi} (${rsiLabel}) — индикатор показывает, что продавцы выдыхаются и покупатели начинают набирать силу.`,
      `\nБыстрая средняя EMA(20) = ${ema20.toFixed(prec)} ${ema20 > ema50 ? "выше" : "приближается к"} медленной EMA(50) = ${ema50.toFixed(prec)} — это подтверждает ${emaSignal} настроение рынка.`,
      `\n\n💡 Простыми словами: цена «отскакивает от пола» — покупатели не дают ей упасть ниже. Ожидаем движение вверх.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nТекущая цена: ${entryPrice.toFixed(prec)}`,
      `\n\n🟢 Почему ВВЕРХ:`,
      `\nБыстрая скользящая средняя (EMA 20 = ${ema20.toFixed(prec)}) пересекла медленную (EMA 50 = ${ema50.toFixed(prec)}) снизу вверх — это классический сигнал «золотой крест», который говорит о начале роста.`,
      `\nRSI = ${rsi} — инструмент ещё не перекуплен, есть запас для движения вверх.`,
      `\nПоддержка: ${support.toFixed(prec)}, сопротивление: ${resistance.toFixed(prec)}.`,
      `\n\n💡 Простыми словами: тренд только начал разворачиваться вверх. Покупатели берут контроль, и цена, скорее всего, продолжит расти.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nЦена: ${entryPrice.toFixed(prec)} | RSI: ${rsi}`,
      `\n\n🟢 Почему ВВЕРХ:`,
      `\nНа графике видно, что цена несколько раз тестировала уровень ${support.toFixed(prec)} и каждый раз отскакивала — это «двойное дно», сильный разворотный паттерн.`,
      `\nRSI находится в зоне ${rsiLabel} (${rsi}), что подтверждает готовность к развороту.`,
      `\nEMA(20) = ${ema20.toFixed(prec)} начинает загибаться вверх — тренд меняется на восходящий.`,
      `\n\n💡 Простыми словами: цена дважды «стукнулась об пол» и не пробила его. Это значит, покупатели очень сильны на этом уровне — ждём рост.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nТочка входа: ${entryPrice.toFixed(prec)}`,
      `\n\n🟢 Почему ВВЕРХ:`,
      `\nЦена находится выше обеих скользящих средних (EMA 20 и EMA 50) — это значит, что общий тренд восходящий и покупатели доминируют.`,
      `\nRSI(14) = ${rsi} — индикатор показывает устойчивый бычий импульс без признаков перекупленности.`,
      `\nБлижайшая поддержка: ${support.toFixed(prec)}, цель роста: ${resistance.toFixed(prec)}.`,
      `\n\n💡 Простыми словами: цена уверенно идёт вверх, все индикаторы «зелёные». Тренд — наш друг, и сейчас он направлен вверх.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nТекущая цена: ${entryPrice.toFixed(prec)}`,
      `\n\n🟢 Почему ВВЕРХ:`,
      `\nНа последних свечах видна бычья поглощающая свеча — большая зелёная свеча «поглотила» предыдущую красную. Это сильный сигнал разворота вверх.`,
      `\nRSI(14) = ${rsi} — выходит из зоны ${rsiLabel}, подтверждая смену настроения.`,
      `\nОбъём выше среднего — крупные игроки входят в покупки.`,
      `\n\n💡 Простыми словами: покупатели резко перехватили инициативу. Большая зелёная свеча — это как «сигнальная ракета» от крупных трейдеров.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nЦена: ${entryPrice.toFixed(prec)}`,
      `\n\n🟢 Почему ВВЕРХ:`,
      `\nЦена откатилась к уровню Фибоначчи 61.8% — это один из самых сильных уровней, от которого часто происходят развороты.`,
      `\nRSI = ${rsi}, EMA(20) = ${ema20.toFixed(prec)} — оба индикатора указывают на завершение коррекции.`,
      `\nПоддержка ${support.toFixed(prec)} удерживается — покупатели активны.`,
      `\n\n💡 Простыми словами: цена «откатилась» от максимумов ровно до ключевого уровня и начинает разворачиваться. Это как пружина — сжалась и готова выстрелить вверх.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nВход: ${entryPrice.toFixed(prec)} | RSI: ${rsi}`,
      `\n\n🟢 Почему ВВЕРХ:`,
      `\nBollinger Bands сузились — волатильность упала до минимума. Обычно после такого «затишья» следует резкий прорыв.`,
      `\nЦена касается нижней границы Боллинджера и отскакивает — покупатели не дают пробить уровень.`,
      `\nEMA(20) > EMA(50) — общий тренд остаётся бычьим.`,
      `\n\n💡 Простыми словами: рынок «замер», как перед прыжком. Цена у нижней границы коридора — скорее всего, прыгнет вверх.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nТекущая цена: ${entryPrice.toFixed(prec)}`,
      `\n\n🟢 Почему ВВЕРХ:`,
      `\nStochastic осциллятор показывает выход из зоны перепроданности (%K пересёк %D снизу вверх) — классический сигнал на покупку.`,
      `\nRSI(14) = ${rsi} — подтверждает разворот. Цена опирается на поддержку ${support.toFixed(prec)}.`,
      `\nMACD гистограмма начинает расти — импульс переходит к покупателям.`,
      `\n\n💡 Простыми словами: сразу три индикатора говорят одно и то же — «пора покупать». Когда все сигналы совпадают, вероятность роста высокая.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nЦена: ${entryPrice.toFixed(prec)}`,
      `\n\n🟢 Почему ВВЕРХ:`,
      `\nНа графике сформировался паттерн «утренняя звезда» — три свечи, которые показывают разворот от падения к росту.`,
      `\nRSI = ${rsi} — был в зоне перепроданности и начал расти.`,
      `\nEMA(20) = ${ema20.toFixed(prec)} разворачивается вверх, готовится пересечь EMA(50) = ${ema50.toFixed(prec)}.`,
      `\n\n💡 Простыми словами: на графике появилась фигура, которая часто предшествует росту. Продавцы устали, покупатели входят в рынок.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nТочка входа: ${entryPrice.toFixed(prec)}`,
      `\n\n🟢 Почему ВВЕРХ:`,
      `\nЦена пробила уровень сопротивления ${resistance.toFixed(prec)} и закрепилась выше — бывшее сопротивление становится поддержкой.`,
      `\nRSI(14) = ${rsi} — в зоне силы, но ещё не перекуплен.`,
      `\nОбъём на пробое вырос — это настоящий прорыв, а не ложный.`,
      `\n\n💡 Простыми словами: цена «пробила потолок» и закрепилась выше. Теперь этот уровень стал «полом» — путь вверх открыт.`,
    ],
  ];

  const putTemplates = [
    [
      `📊 Анализ ${pair}`,
      `\n\nЦена сейчас: ${entryPrice.toFixed(prec)}`,
      `\nУровень сопротивления: ${resistance.toFixed(prec)}`,
      `\n\n🔴 Почему ВНИЗ:`,
      `\nЦена поднялась к сильному уровню сопротивления (${resistance.toFixed(prec)}) — это зона, где продавцы раньше уже останавливали рост.`,
      `\nRSI(14) = ${rsi} (${rsiLabel}) — индикатор показывает, что покупатели выдыхаются и давление продавцов нарастает.`,
      `\nEMA(20) = ${ema20.toFixed(prec)} ${ema20 < ema50 ? "ниже" : "приближается к"} EMA(50) = ${ema50.toFixed(prec)} — ${emaSignal} настроение рынка.`,
      `\n\n💡 Простыми словами: цена «упёрлась в потолок» — продавцы не дают ей вырасти выше. Ожидаем разворот вниз.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nТекущая цена: ${entryPrice.toFixed(prec)}`,
      `\n\n🔴 Почему ВНИЗ:`,
      `\nБыстрая скользящая средняя (EMA 20 = ${ema20.toFixed(prec)}) пересекла медленную (EMA 50 = ${ema50.toFixed(prec)}) сверху вниз — это «мёртвый крест», классический сигнал на продажу.`,
      `\nRSI = ${rsi} — инструмент ещё не перепродан, есть запас для движения вниз.`,
      `\nСопротивление: ${resistance.toFixed(prec)}, поддержка: ${support.toFixed(prec)}.`,
      `\n\n💡 Простыми словами: тренд развернулся вниз. Продавцы взяли контроль — цена, скорее всего, продолжит падать.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nЦена: ${entryPrice.toFixed(prec)} | RSI: ${rsi}`,
      `\n\n🔴 Почему ВНИЗ:`,
      `\nНа графике видна «двойная вершина» — цена дважды пыталась пробить уровень ${resistance.toFixed(prec)} и оба раза откатывалась. Это мощный разворотный паттерн вниз.`,
      `\nRSI в зоне ${rsiLabel} (${rsi}) — покупатели теряют силу.`,
      `\nEMA(20) = ${ema20.toFixed(prec)} начинает загибаться вниз.`,
      `\n\n💡 Простыми словами: цена дважды «стукнулась об потолок» и не пробила. Продавцы слишком сильны — ждём падение.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nТочка входа: ${entryPrice.toFixed(prec)}`,
      `\n\n🔴 Почему ВНИЗ:`,
      `\nЦена находится ниже обеих скользящих средних (EMA 20 и EMA 50) — общий тренд нисходящий, продавцы доминируют.`,
      `\nRSI(14) = ${rsi} — устойчивый медвежий импульс без перепроданности.`,
      `\nБлижайшее сопротивление: ${resistance.toFixed(prec)}, цель падения: ${support.toFixed(prec)}.`,
      `\n\n💡 Простыми словами: цена уверенно идёт вниз. Все индикаторы «красные» — тренд нисходящий и сильный.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nТекущая цена: ${entryPrice.toFixed(prec)}`,
      `\n\n🔴 Почему ВНИЗ:`,
      `\nМедвежья поглощающая свеча — большая красная свеча «поглотила» предыдущую зелёную. Продавцы резко перехватили инициативу.`,
      `\nRSI(14) = ${rsi} — разворачивается вниз из зоны ${rsiLabel}.`,
      `\nОбъём выше среднего — крупные игроки фиксируют прибыль и открывают короткие позиции.`,
      `\n\n💡 Простыми словами: продавцы нанесли мощный удар. Большая красная свеча говорит: «крупные деньги ставят на падение».`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nЦена: ${entryPrice.toFixed(prec)}`,
      `\n\n🔴 Почему ВНИЗ:`,
      `\nЦена откатилась вверх к уровню Фибоначчи 61.8% и получила отбой — коррекция завершена, нисходящий тренд продолжается.`,
      `\nRSI = ${rsi}, EMA(20) = ${ema20.toFixed(prec)} — индикаторы подтверждают медвежий сценарий.`,
      `\nСопротивление ${resistance.toFixed(prec)} устояло — продавцы контролируют рынок.`,
      `\n\n💡 Простыми словами: цена попыталась «отпрыгнуть» наверх, но уткнулась в стену. Коррекция закончена — падение продолжится.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nВход: ${entryPrice.toFixed(prec)} | RSI: ${rsi}`,
      `\n\n🔴 Почему ВНИЗ:`,
      `\nBollinger Bands расширяются вниз — волатильность растёт в сторону продавцов.`,
      `\nЦена касается верхней границы Боллинджера и отскакивает вниз — «потолок» канала работает.`,
      `\nEMA(20) < EMA(50) — общий тренд медвежий.`,
      `\n\n💡 Простыми словами: цена «отбилась от потолка» ценового коридора. Все условия для продолжения снижения.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nТекущая цена: ${entryPrice.toFixed(prec)}`,
      `\n\n🔴 Почему ВНИЗ:`,
      `\nStochastic осциллятор вышел из зоны перекупленности (%K пересёк %D сверху вниз) — классический сигнал на продажу.`,
      `\nRSI(14) = ${rsi} — подтверждает разворот вниз.`,
      `\nMACD гистограмма уменьшается — импульс переходит к продавцам.`,
      `\n\n💡 Простыми словами: три индикатора одновременно дают сигнал на продажу. Такое совпадение — сильный аргумент за снижение.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nЦена: ${entryPrice.toFixed(prec)}`,
      `\n\n🔴 Почему ВНИЗ:`,
      `\nНа графике «вечерняя звезда» — три свечи, сигнализирующие о развороте от роста к падению.`,
      `\nRSI = ${rsi} — был в зоне перекупленности и начал снижаться.`,
      `\nEMA(20) = ${ema20.toFixed(prec)} разворачивается вниз, готовится пересечь EMA(50) = ${ema50.toFixed(prec)}.`,
      `\n\n💡 Простыми словами: на графике появилась фигура разворота. Покупатели исчерпали силы — инициатива переходит к продавцам.`,
    ],
    [
      `📊 Анализ ${pair}`,
      `\n\nТочка входа: ${entryPrice.toFixed(prec)}`,
      `\n\n🔴 Почему ВНИЗ:`,
      `\nЦена пробила уровень поддержки ${support.toFixed(prec)} — бывшая поддержка становится сопротивлением.`,
      `\nRSI(14) = ${rsi} — в зоне слабости, но ещё не перепродан.`,
      `\nОбъём на пробое вырос — это подтверждает серьёзность пробоя.`,
      `\n\n💡 Простыми словами: цена «пробила пол» и закрепилась ниже. Теперь этот уровень стал «потолком» — путь вниз открыт.`,
    ],
  ];

  const templates = isCall ? callTemplates : putTemplates;
  return randomItem(templates).join("");
}

// ─── OTC signal (with synthetic chart data) ───

/** Generate dynamic OTC analysis with random indicator values. */
function generateOtcAnalysis(direction: "CALL" | "PUT"): string {
  const rsiVal = +(Math.random() * 64 + 18).toFixed(1);
  const stochK = +(Math.random() * 80 + 10).toFixed(1);
  const stochD = +(stochK + (Math.random() * 16 - 8)).toFixed(1);
  const maFast = randomItem(["EMA(9)", "EMA(12)", "SMA(10)"]);
  const maSlow = randomItem(["EMA(21)", "SMA(20)", "EMA(26)"]);
  const volumePct = randomInt(5, 45);
  const fibLevel = randomItem(["23.6%", "38.2%", "50.0%", "61.8%", "78.6%"]);

  const callTemplates = [
    `🟢 Почему ВВЕРХ:\n\nRSI(14) = ${rsiVal} — индикатор в зоне перепроданности, значит продавцы устали. Когда RSI низкий, цена часто разворачивается вверх.\n\nStochastic (%K=${stochK}) пересёк %D снизу вверх — это сигнал, что покупатели возвращаются.\n\n💡 Простыми словами: актив «перепродан» — слишком много людей продавали, и теперь наступает отскок вверх, как мячик от пола.`,

    `🟢 Почему ВВЕРХ:\n\n${maFast} пересекла ${maSlow} снизу вверх — «золотой крест». Это один из самых известных сигналов на покупку.\n\nRSI(14) = ${rsiVal} — подтверждает бычий настрой.\nОбъём вырос на +${volumePct}% — крупные игроки заходят в покупки.\n\n💡 Простыми словами: быстрый тренд обгоняет медленный — как машина, которая начинает ускоряться. Направление — вверх.`,

    `🟢 Почему ВВЕРХ:\n\nНа графике сформировался паттерн «двойное дно» — цена дважды коснулась одного уровня и отскочила. Это сильный сигнал разворота.\n\nRSI = ${rsiVal}, Stochastic %K = ${stochK} — оба индикатора растут.\n\n💡 Простыми словами: представьте мячик, который дважды ударился об пол. После второго удара он отскакивает сильнее — так и цена.`,

    `🟢 Почему ВВЕРХ:\n\nBollinger Bands сузились — рынок «затих». После затишья обычно идёт резкое движение.\nЦена у нижней границы канала — статистически чаще отскакивает вверх.\nRSI(14) = ${rsiVal} — не перекуплен, запас для роста есть.\n\n💡 Простыми словами: рынок «сжался как пружина» у нижней границы. Пружина разжимается — цена стреляет вверх.`,

    `🟢 Почему ВВЕРХ:\n\nЦена откатилась к уровню Фибоначчи ${fibLevel} и получила отскок. Этот уровень часто работает как «невидимая поддержка».\nMACD гистограмма растёт — импульс покупателей нарастает.\nОбъём: +${volumePct}% от среднего.\n\n💡 Простыми словами: цена «отдохнула» после роста, откатилась до важного уровня и теперь готова продолжить движение вверх.`,

    `🟢 Почему ВВЕРХ:\n\nНа графике появился «пин-бар» с длинной нижней тенью — покупатели агрессивно выкупают каждое снижение.\nRSI(14) = ${rsiVal} — разворачивается из зоны перепроданности.\nStochastic: %K=${stochK}, %D=${stochD} — бычье пересечение.\n\n💡 Простыми словами: свеча с длинным «хвостом» вниз — это значит, цена пыталась упасть, но покупатели не дали. Сильный сигнал на рост.`,

    `🟢 Почему ВВЕРХ:\n\nМАCD пересёкся в бычьем направлении — сигнальная линия ушла выше нулевой. Это подтверждает начало восходящего тренда.\n${maFast} > ${maSlow} — тренд бычий.\nRSI = ${rsiVal} — в зоне роста.\n\n💡 Простыми словами: два главных индикатора тренда одновременно говорят «ВВЕРХ». Когда они совпадают — сигнал сильный.`,

    `🟢 Почему ВВЕРХ:\n\nОбъём торгов вырос на ${volumePct}% при движении вверх — это значит, что рост поддержан реальными деньгами, а не случайными колебаниями.\nRSI(14) = ${rsiVal} — здоровый бычий импульс.\nATR показывает умеренную волатильность — рост стабильный.\n\n💡 Простыми словами: когда цена растёт и объём растёт вместе с ней — это «настоящий» рост. Крупные деньги ставят на повышение.`,

    `🟢 Почему ВВЕРХ:\n\nНа графике «утренняя звезда» — три свечи, сигнализирующие разворот: красная → маленькая → большая зелёная.\nRSI = ${rsiVal} — выходит из зоны перепроданности.\nStochastic: %K=${stochK} ↑ — начинает расти.\n\n💡 Простыми словами: после падения появился «рассвет» — маленькая свеча неопределённости, за ней — сильная покупка. Классический разворот вверх.`,

    `🟢 Почему ВВЕРХ:\n\nЦена закрепилась выше ${maFast} после коррекции — скользящая средняя работает как «трамплин».\nRSI(14) = ${rsiVal} — в зоне ${rsiVal > 50 ? "силы" : "начала разворота"}.\nFibonacci ${fibLevel} отработал как поддержка.\n\n💡 Простыми словами: цена «опёрлась» на скользящую среднюю, как на ступеньку, и оттолкнулась вверх. Тренд продолжается.`,

    `🟢 Почему ВВЕРХ:\n\nДивергенция RSI — цена делает новый минимум, а RSI растёт. Это расхождение говорит, что падение теряет силу.\nRSI = ${rsiVal}, Stochastic = ${stochK}.\n\n💡 Простыми словами: цена ещё падает, но «внутренняя сила» рынка уже растёт. Как машина, которая тормозит перед разворотом. Скоро поедет вверх.`,

    `🟢 Почему ВВЕРХ:\n\nЦена сформировала «молот» — свеча с маленьким телом и длинной нижней тенью на уровне поддержки.\nRSI(14) = ${rsiVal} — подтверждает разворот.\nОбъём на этой свече +${volumePct}% — покупатели вступили в игру.\n\n💡 Простыми словами: «молот» — это когда цена сильно упала внутри свечи, но к закрытию покупатели вернули её обратно. Мощный сигнал: покупатели сильнее.`,

    `🟢 Почему ВВЕРХ:\n\nВосходящий треугольник — цена делает более высокие минимумы, приближаясь к горизонтальному сопротивлению. Пробой вверх наиболее вероятен.\nRSI = ${rsiVal} — растёт.\n${maFast} направлена вверх.\n\n💡 Простыми словами: покупатели с каждым разом «поднимают планку» минимумов. Они всё ближе к прорыву вверх — и скорее всего, прорвутся.`,

    `🟢 Почему ВВЕРХ:\n\nТри белых солдата — три подряд растущие зелёные свечи с увеличивающимся телом. Сильнейший бычий паттерн.\nRSI = ${rsiVal} — в зоне роста, без перекупленности.\nОбъём стабильно растёт.\n\n💡 Простыми словами: три зелёные свечи подряд, каждая больше предыдущей — покупатели набирают обороты. Тренд вверх сильный и устойчивый.`,

    `🟢 Почему ВВЕРХ:\n\nЦена тестирует 200-периодную скользящую среднюю снизу и пробивает — один из самых сильных долгосрочных сигналов на покупку.\nRSI(14) = ${rsiVal} — подтверждает импульс.\nStochastic: %K=${stochK} > %D=${stochD}.\n\n💡 Простыми словами: 200-дневная средняя — это «главная дорога» рынка. Цена пересекла её снизу вверх — как выезд на трассу в правильном направлении.`,
  ];

  const putTemplates = [
    `🔴 Почему ВНИЗ:\n\nRSI(14) = ${rsiVal} — индикатор в зоне перекупленности, покупатели устали. Когда RSI высокий, цена часто разворачивается вниз.\n\nStochastic (%K=${stochK}) пересёк %D сверху вниз — продавцы берут контроль.\n\n💡 Простыми словами: актив «перекуплен» — слишком много людей покупали, и теперь начинается откат вниз. Как маятник, который качнулся слишком далеко.`,

    `🔴 Почему ВНИЗ:\n\n${maFast} пересекла ${maSlow} сверху вниз — «мёртвый крест». Это известный сигнал на продажу.\n\nRSI(14) = ${rsiVal} — подтверждает медвежий настрой.\nОбъём вырос на +${volumePct}% — крупные игроки фиксируют прибыль.\n\n💡 Простыми словами: быстрый тренд «нырнул» под медленный — как машина, которая начинает тормозить и разворачиваться. Направление — вниз.`,

    `🔴 Почему ВНИЗ:\n\nПаттерн «двойная вершина» — цена дважды не смогла пробить один уровень сверху. Это сильный сигнал разворота вниз.\n\nRSI = ${rsiVal}, Stochastic %K = ${stochK} — оба индикатора снижаются.\n\n💡 Простыми словами: цена дважды «бьётся головой об потолок» и не может пробить. После второй попытки — падает.`,

    `🔴 Почему ВНИЗ:\n\nBollinger Bands расширяются вниз — волатильность растёт в сторону продавцов.\nЦена у верхней границы канала — отскок вниз наиболее вероятен.\nRSI(14) = ${rsiVal} — приближается к перекупленности.\n\n💡 Простыми словами: цена достигла «потолка» ценового коридора и начинает отскакивать. Этот потолок редко пробивается — чаще цена возвращается к середине.`,

    `🔴 Почему ВНИЗ:\n\nЦена откатилась вверх к Фибоначчи ${fibLevel} и получила отбой. Коррекция завершена — нисходящий тренд продолжается.\nMACD гистограмма снижается — давление продавцов нарастает.\nОбъём: +${volumePct}% от среднего.\n\n💡 Простыми словами: после падения цена попыталась «подпрыгнуть», но добралась только до ключевого уровня и развернулась обратно вниз.`,

    `🔴 Почему ВНИЗ:\n\nНа графике «падающая звезда» — свеча с длинной верхней тенью. Покупатели пытались толкнуть цену вверх, но продавцы вернули её обратно.\nRSI(14) = ${rsiVal} — разворот из перекупленности.\nStochastic: %K=${stochK}, %D=${stochD} — медвежье пересечение.\n\n💡 Простыми словами: длинный «хвост» вверху свечи — цена пыталась вырасти, но её «прибили». Продавцы сильнее.`,

    `🔴 Почему ВНИЗ:\n\nMACD пересёкся в медвежьем направлении — сигнальная линия ушла ниже нулевой. Нисходящий тренд набирает силу.\n${maFast} < ${maSlow} — подтверждение.\nRSI = ${rsiVal} — давление продавцов.\n\n💡 Простыми словами: два индикатора тренда одновременно говорят «ВНИЗ». Двойное подтверждение = сильный сигнал.`,

    `🔴 Почему ВНИЗ:\n\nОбъём торгов вырос на ${volumePct}% при движении вниз — падение подтверждено реальными деньгами.\nRSI(14) = ${rsiVal} — медвежий импульс.\nATR растёт — волатильность увеличивается в пользу продавцов.\n\n💡 Простыми словами: когда цена падает и объём растёт — это серьёзное падение. Крупные игроки активно продают.`,

    `🔴 Почему ВНИЗ:\n\n«Вечерняя звезда» — три свечи: зелёная → маленькая → большая красная. Классический паттерн разворота вниз.\nRSI = ${rsiVal} — снижается из зоны перекупленности.\nStochastic: %K=${stochK} ↓.\n\n💡 Простыми словами: после роста появился «закат» — покупатели потеряли силу, продавцы перехватили инициативу мощной красной свечой.`,

    `🔴 Почему ВНИЗ:\n\nЦена не смогла удержаться выше ${maFast} — скользящая средняя стала «потолком».\nRSI(14) = ${rsiVal} — в зоне ${rsiVal < 50 ? "слабости" : "начала разворота"}.\nFibonacci ${fibLevel} отработал как сопротивление.\n\n💡 Простыми словами: цена попыталась «залезть» выше скользящей средней, но не смогла. Средняя давит сверху — путь вниз.`,

    `🔴 Почему ВНИЗ:\n\nДивергенция RSI — цена делает новый максимум, а RSI падает. Рост теряет силу изнутри.\nRSI = ${rsiVal}, Stochastic = ${stochK}.\n\n💡 Простыми словами: цена ещё растёт, но «энергия» рынка уже иссякает. Как мяч, подброшенный вверх — он ещё летит, но уже замедляется перед падением.`,

    `🔴 Почему ВНИЗ:\n\n«Повешенный» — свеча с маленьким телом наверху и длинной нижней тенью после роста.\nRSI(14) = ${rsiVal} — сигнал ослабления покупателей.\nОбъём: +${volumePct}% — фиксация прибыли.\n\n💡 Простыми словами: после роста появилась подозрительная свеча — покупатели начали сомневаться. Это предвестник разворота вниз.`,

    `🔴 Почему ВНИЗ:\n\nНисходящий треугольник — максимумы снижаются, приближаясь к горизонтальной поддержке. Пробой вниз наиболее вероятен.\nRSI = ${rsiVal} — падает.\n${maFast} направлена вниз.\n\n💡 Простыми словами: продавцы с каждым разом «опускают потолок». Рано или поздно цена пробьёт пол — и полетит вниз.`,

    `🔴 Почему ВНИЗ:\n\nТри чёрных вороны — три подряд красные свечи с увеличивающимся телом. Мощнейший медвежий паттерн.\nRSI = ${rsiVal} — в зоне падения, без перепроданности.\nОбъём растёт на каждой свече.\n\n💡 Простыми словами: три красные свечи подряд, каждая больше предыдущей — продавцы набирают обороты. Падение сильное и устойчивое.`,

    `🔴 Почему ВНИЗ:\n\nЦена пробила 200-периодную скользящую среднюю сверху вниз — сильнейший долгосрочный медвежий сигнал.\nRSI(14) = ${rsiVal} — подтверждает давление.\nStochastic: %K=${stochK} < %D=${stochD}.\n\n💡 Простыми словами: 200-дневная средняя — «главная дорога». Цена нырнула под неё — как свернуть на дорогу вниз. Серьёзный сигнал.`,
  ];

  return direction === "CALL" ? randomItem(callTemplates) : randomItem(putTemplates);
}

function generateOtcSignal(overridePair?: string, overrideExpiration?: string) {
  const pair = overridePair ?? randomItem(PAIRS.otc);
  const direction = randomItem(DIRECTIONS);
  const expiration = overrideExpiration ?? randomItem(EXPIRATIONS.otc);
  const confidence = randomInt(73, 88);

  const analysis = generateOtcAnalysis(direction);

  return {
    pair,
    direction: direction as "CALL" | "PUT",
    expiration,
    confidence,
    tier: "otc" as const,
    type: "ai" as const,
    analysis,
    chartData: Prisma.JsonNull,
    entryPrice: null,
    isActive: true,
  };
}

// ─── Non-OTC signal with real market data ───

async function generateRealSignal(band: "exchange" | "elite", overridePair?: string, overrideExpiration?: string) {
  const pair = overridePair ?? randomItem(PAIRS[band]);
  const expiration = overrideExpiration ?? randomItem(EXPIRATIONS[band]);

  const { candles, source } = await getCandles(pair, { count: 60, periodSec: 60 });

  const closes = candles.map((c) => c.c);
  const lastClose = closes[closes.length - 1] ?? 1;

  const rsi = calcRSI(closes);
  const ema20 = calcEMA(closes, 20);
  const ema50 = calcEMA(closes, 50);
  const { support, resistance } = findLevels(candles.slice(-30));

  const direction = directionFromIndicators(rsi, ema20, ema50, lastClose);
  const confidence = confidenceFromIndicators(rsi, ema20, ema50, lastClose, band);

  const analysis = buildAnalysis(pair, direction, band, rsi, ema20, ema50, support, resistance, lastClose);

  const chartPayload = {
    pair,
    direction,
    source,
    candles: candles.slice(-30).map((c) => ({
      time: c.t * 1000,
      open: c.o,
      high: c.h,
      low: c.l,
      close: c.c,
    })),
    indicators: {
      rsi,
      ema20: +ema20.toFixed(5),
      ema50: +ema50.toFixed(5),
    },
    levels: {
      support: +support.toFixed(5),
      resistance: +resistance.toFixed(5),
    },
    entryPrice: lastClose,
  };

  return {
    pair,
    direction,
    expiration,
    confidence,
    tier: band as "otc" | "exchange" | "elite",
    type: "ai" as const,
    analysis,
    chartData: chartPayload as unknown as Prisma.InputJsonValue,
    entryPrice: new Prisma.Decimal(lastClose),
    isActive: true,
  };
}

// ─── Public API ───

export type SignalResult = {
  signal: {
    id: string;
    pair: string;
    direction: string;
    expiration: string;
    confidence: number;
    tier: string;
    type: string;
    analysis: string | null;
    chartData: unknown;
    entryPrice: number | null;
    entryTime: string;
    createdAt: string;
  };
  access: {
    tier: number;
    dailyLimit: number | null;
    used: number;
    remaining: number | null;
  };
};

export type SignalError = {
  error: string;
  code: "daily_limit" | "no_user" | "band_not_allowed";
  dailyLimit: number | null;
  used: number;
};

/**
 * Generate a signal for a user: check limits, pick band, generate, save, log.
 *
 * Returns either `{ signal, access }` on success or `{ error, code, ... }` on failure.
 */
export async function generateSignalForUser(
  userId: string,
  options?: { pair?: string; expiration?: string },
): Promise<{ ok: true; data: SignalResult } | { ok: false; data: SignalError; statusCode: number }> {
  // Check daily limit
  const access = await canReceiveSignal(userId);
  if (!access.allowed) {
    const report = access.report;
    return {
      ok: false,
      statusCode: 429,
      data: {
        error: access.reason === "daily_limit"
          ? "Дневной лимит сигналов исчерпан"
          : "Пользователь не найден",
        code: access.reason ?? "no_user",
        dailyLimit: report?.dailySignalLimit ?? null,
        used: report?.signalsTodayUsed ?? 0,
      },
    };
  }

  const tier = access.report?.tier ?? 0;
  const allowedBands = TIER_ACCESS[tier] ?? ["otc"];

  let band: SignalBand;
  if (options?.pair) {
    band = bandFromPair(options.pair);
    if (!allowedBands.includes(band)) {
      return {
        ok: false,
        statusCode: 403,
        data: {
          error: "Эта пара недоступна для вашего уровня",
          code: "band_not_allowed",
          dailyLimit: access.report?.dailySignalLimit ?? null,
          used: access.report?.signalsTodayUsed ?? 0,
        },
      };
    }
  } else {
    band = randomItem(allowedBands) as SignalBand;
  }

  // Generate signal
  const signalData = band === "otc"
    ? generateOtcSignal(options?.pair, options?.expiration)
    : await generateRealSignal(band as "exchange" | "elite", options?.pair, options?.expiration);

  // Atomic transaction: re-check daily limit + create signal + log activity
  // This prevents TOCTOU race where two concurrent requests both pass the limit check.
  const dailyLimit = access.report?.dailySignalLimit ?? null;

  const signal = await prisma.$transaction(async (tx) => {
    // Re-count usage inside the transaction to prevent race conditions
    if (dailyLimit != null) {
      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);
      const currentUsed = await tx.activityLog.count({
        where: {
          userId,
          action: { in: ["signal_view", "signal_received"] },
          createdAt: { gte: startOfDay },
        },
      });
      if (currentUsed >= dailyLimit) {
        return null; // limit exceeded
      }
    }

    const created = await tx.signal.create({
      data: {
        ...signalData,
        createdById: userId,
      },
    });

    await tx.activityLog.create({
      data: {
        userId,
        action: "signal_received",
        details: {
          signalId: created.id,
          pair: created.pair,
          direction: created.direction,
          tier: created.tier,
        },
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        signalsReceived: { increment: 1 },
        lastSignalAt: new Date(),
      },
    });

    return created;
  });

  // If the transaction returned null, the limit was hit during the race window
  if (!signal) {
    return {
      ok: false as const,
      statusCode: 429,
      data: {
        error: "Дневной лимит сигналов исчерпан",
        code: "daily_limit" as const,
        dailyLimit,
        used: dailyLimit ?? 0,
      },
    };
  }

  const used = (access.report?.signalsTodayUsed ?? 0) + 1;

  return {
    ok: true,
    data: {
      signal: {
        id: signal.id,
        pair: signal.pair,
        direction: signal.direction,
        expiration: signal.expiration,
        confidence: signal.confidence,
        tier: signal.tier,
        type: signal.type,
        analysis: signal.analysis,
        chartData: signal.chartData,
        entryPrice: signal.entryPrice ? Number(signal.entryPrice) : null,
        entryTime: calcEntryTime(),
        createdAt: signal.createdAt.toISOString(),
      },
      access: {
        tier,
        dailyLimit,
        used,
        remaining: dailyLimit != null ? Math.max(0, dailyLimit - used) : null,
      },
    },
  };
}
