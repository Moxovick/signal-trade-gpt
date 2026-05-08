/**
 * Default PocketOption asset whitelist.
 *
 * Sourced from the user's confirmed PO instrument list (May 2026).
 * Edit / extend in /admin/assets — this file is only used for the initial
 * seed via /api/cron/seed-content.
 *
 * Tier-mapping convention:
 *   - All OTC pairs                          → signalTier "otc"   (T1+)
 *   - Real currencies / crypto / commodities → signalTier "exchange" (T2+)
 *   - Real stocks / indices                  → signalTier "elite"    (T3+)
 *
 * Provider mapping (for charting NON-OTC only):
 *   - Crypto with USD/USDT pair → "binance" with concatenated symbol (BTCUSDT)
 *   - Currency / commodity / index → "twelvedata" with original symbol
 *   - Stocks → "twelvedata" by ticker
 *   - OTC pairs → "none" (no charting at all)
 */

export type AssetCategory = "currency" | "crypto" | "commodity" | "stock" | "index";
export type SignalTier = "otc" | "exchange" | "elite";

export type SeedAsset = {
  symbol: string;
  displaySymbol: string;
  category: AssetCategory;
  isOtc: boolean;
  payoutPct: number;
  signalTier: SignalTier;
  provider: "none" | "binance" | "twelvedata" | "yahoo";
  providerSymbol?: string;
};

// ───────────────────────────────────────
// Currencies
// ───────────────────────────────────────
const CURRENCIES: Array<Omit<SeedAsset, "category" | "signalTier" | "provider" | "providerSymbol">> = [
  { symbol: "AED/CNY OTC", displaySymbol: "AED/CNY", isOtc: true, payoutPct: 92 },
  { symbol: "AUD/CHF OTC", displaySymbol: "AUD/CHF", isOtc: true, payoutPct: 92 },
  { symbol: "AUD/NZD OTC", displaySymbol: "AUD/NZD", isOtc: true, payoutPct: 92 },
  { symbol: "EUR/CHF OTC", displaySymbol: "EUR/CHF", isOtc: true, payoutPct: 92 },
  { symbol: "EUR/RUB OTC", displaySymbol: "EUR/RUB", isOtc: true, payoutPct: 92 },
  { symbol: "KES/USD OTC", displaySymbol: "KES/USD", isOtc: true, payoutPct: 92 },
  { symbol: "NGN/USD OTC", displaySymbol: "NGN/USD", isOtc: true, payoutPct: 92 },
  { symbol: "NZD/USD OTC", displaySymbol: "NZD/USD", isOtc: true, payoutPct: 92 },
  { symbol: "USD/CHF OTC", displaySymbol: "USD/CHF", isOtc: true, payoutPct: 92 },
  { symbol: "USD/INR OTC", displaySymbol: "USD/INR", isOtc: true, payoutPct: 92 },
  { symbol: "USD/MYR OTC", displaySymbol: "USD/MYR", isOtc: true, payoutPct: 92 },
  { symbol: "USD/SGD OTC", displaySymbol: "USD/SGD", isOtc: true, payoutPct: 92 },
  { symbol: "ZAR/USD OTC", displaySymbol: "ZAR/USD", isOtc: true, payoutPct: 92 },
  { symbol: "EUR/USD", displaySymbol: "EUR/USD", isOtc: false, payoutPct: 89 },
  { symbol: "CHF/NOK OTC", displaySymbol: "CHF/NOK", isOtc: true, payoutPct: 88 },
  { symbol: "EUR/GBP", displaySymbol: "EUR/GBP", isOtc: false, payoutPct: 88 },
  { symbol: "AUD/USD", displaySymbol: "AUD/USD", isOtc: false, payoutPct: 87 },
  { symbol: "EUR/JPY", displaySymbol: "EUR/JPY", isOtc: false, payoutPct: 87 },
  { symbol: "CAD/CHF", displaySymbol: "CAD/CHF", isOtc: false, payoutPct: 85 },
  { symbol: "EUR/CAD", displaySymbol: "EUR/CAD", isOtc: false, payoutPct: 85 },
  { symbol: "GBP/CAD", displaySymbol: "GBP/CAD", isOtc: false, payoutPct: 85 },
  { symbol: "GBP/JPY", displaySymbol: "GBP/JPY", isOtc: false, payoutPct: 84 },
  { symbol: "JOD/CNY OTC", displaySymbol: "JOD/CNY", isOtc: true, payoutPct: 84 },
  { symbol: "USD/RUB OTC", displaySymbol: "USD/RUB", isOtc: true, payoutPct: 84 },
  { symbol: "USD/EGP OTC", displaySymbol: "USD/EGP", isOtc: true, payoutPct: 83 },
  { symbol: "EUR/USD OTC", displaySymbol: "EUR/USD", isOtc: true, payoutPct: 82 },
  { symbol: "AUD/JPY", displaySymbol: "AUD/JPY", isOtc: false, payoutPct: 81 },
  { symbol: "USD/IDR OTC", displaySymbol: "USD/IDR", isOtc: true, payoutPct: 81 },
  { symbol: "CAD/CHF OTC", displaySymbol: "CAD/CHF", isOtc: true, payoutPct: 80 },
  { symbol: "CAD/JPY", displaySymbol: "CAD/JPY", isOtc: false, payoutPct: 80 },
  { symbol: "EUR/CHF", displaySymbol: "EUR/CHF", isOtc: false, payoutPct: 80 },
  { symbol: "EUR/NZD OTC", displaySymbol: "EUR/NZD", isOtc: true, payoutPct: 79 },
  { symbol: "USD/BRL OTC", displaySymbol: "USD/BRL", isOtc: true, payoutPct: 79 },
  { symbol: "AUD/CAD OTC", displaySymbol: "AUD/CAD", isOtc: true, payoutPct: 78 },
  { symbol: "USD/JPY", displaySymbol: "USD/JPY", isOtc: false, payoutPct: 78 },
  { symbol: "CHF/JPY", displaySymbol: "CHF/JPY", isOtc: false, payoutPct: 77 },
  { symbol: "OMR/CNY OTC", displaySymbol: "OMR/CNY", isOtc: true, payoutPct: 77 },
  { symbol: "EUR/TRY OTC", displaySymbol: "EUR/TRY", isOtc: true, payoutPct: 75 },
  { symbol: "GBP/AUD", displaySymbol: "GBP/AUD", isOtc: false, payoutPct: 73 },
  { symbol: "GBP/JPY OTC", displaySymbol: "GBP/JPY", isOtc: true, payoutPct: 73 },
  { symbol: "USD/CNH OTC", displaySymbol: "USD/CNH", isOtc: true, payoutPct: 72 },
  { symbol: "USD/DZD OTC", displaySymbol: "USD/DZD", isOtc: true, payoutPct: 72 },
  { symbol: "USD/JPY OTC", displaySymbol: "USD/JPY", isOtc: true, payoutPct: 72 },
  { symbol: "CAD/JPY OTC", displaySymbol: "CAD/JPY", isOtc: true, payoutPct: 71 },
  { symbol: "USD/CAD", displaySymbol: "USD/CAD", isOtc: false, payoutPct: 69 },
  { symbol: "USD/PHP OTC", displaySymbol: "USD/PHP", isOtc: true, payoutPct: 69 },
  { symbol: "USD/COP OTC", displaySymbol: "USD/COP", isOtc: true, payoutPct: 67 },
  { symbol: "YER/USD OTC", displaySymbol: "YER/USD", isOtc: true, payoutPct: 67 },
  { symbol: "USD/MXN OTC", displaySymbol: "USD/MXN", isOtc: true, payoutPct: 66 },
  { symbol: "NZD/JPY OTC", displaySymbol: "NZD/JPY", isOtc: true, payoutPct: 65 },
  { symbol: "USD/CHF", displaySymbol: "USD/CHF", isOtc: false, payoutPct: 65 },
  { symbol: "USD/THB OTC", displaySymbol: "USD/THB", isOtc: true, payoutPct: 63 },
  { symbol: "GBP/AUD OTC", displaySymbol: "GBP/AUD", isOtc: true, payoutPct: 61 },
  { symbol: "MAD/USD OTC", displaySymbol: "MAD/USD", isOtc: true, payoutPct: 58 },
  { symbol: "TND/USD OTC", displaySymbol: "TND/USD", isOtc: true, payoutPct: 58 },
  { symbol: "BHD/CNY OTC", displaySymbol: "BHD/CNY", isOtc: true, payoutPct: 57 },
  { symbol: "EUR/HUF OTC", displaySymbol: "EUR/HUF", isOtc: true, payoutPct: 56 },
  { symbol: "QAR/CNY OTC", displaySymbol: "QAR/CNY", isOtc: true, payoutPct: 56 },
  { symbol: "USD/VND OTC", displaySymbol: "USD/VND", isOtc: true, payoutPct: 53 },
  { symbol: "EUR/JPY OTC", displaySymbol: "EUR/JPY", isOtc: true, payoutPct: 52 },
  { symbol: "USD/ARS OTC", displaySymbol: "USD/ARS", isOtc: true, payoutPct: 52 },
  { symbol: "CHF/JPY OTC", displaySymbol: "CHF/JPY", isOtc: true, payoutPct: 51 },
  { symbol: "UAH/USD OTC", displaySymbol: "UAH/USD", isOtc: true, payoutPct: 47 },
  { symbol: "AUD/CAD", displaySymbol: "AUD/CAD", isOtc: false, payoutPct: 41 },
  { symbol: "SAR/CNY OTC", displaySymbol: "SAR/CNY", isOtc: true, payoutPct: 40 },
  { symbol: "EUR/AUD", displaySymbol: "EUR/AUD", isOtc: false, payoutPct: 39 },
  { symbol: "USD/CAD OTC", displaySymbol: "USD/CAD", isOtc: true, payoutPct: 38 },
  { symbol: "AUD/CHF", displaySymbol: "AUD/CHF", isOtc: false, payoutPct: 37 },
  { symbol: "USD/PKR OTC", displaySymbol: "USD/PKR", isOtc: true, payoutPct: 36 },
  { symbol: "EUR/GBP OTC", displaySymbol: "EUR/GBP", isOtc: true, payoutPct: 33 },
  { symbol: "GBP/CHF", displaySymbol: "GBP/CHF", isOtc: false, payoutPct: 33 },
  { symbol: "LBP/USD OTC", displaySymbol: "LBP/USD", isOtc: true, payoutPct: 30 },
  { symbol: "USD/BDT OTC", displaySymbol: "USD/BDT", isOtc: true, payoutPct: 30 },
  { symbol: "AUD/USD OTC", displaySymbol: "AUD/USD", isOtc: true, payoutPct: 29 },
  { symbol: "GBP/USD", displaySymbol: "GBP/USD", isOtc: false, payoutPct: 28 },
  { symbol: "USD/CLP OTC", displaySymbol: "USD/CLP", isOtc: true, payoutPct: 27 },
  { symbol: "AUD/JPY OTC", displaySymbol: "AUD/JPY", isOtc: true, payoutPct: 26 },
];

// ───────────────────────────────────────
// Crypto
// ───────────────────────────────────────
const CRYPTO: Array<Omit<SeedAsset, "category" | "signalTier" | "provider" | "providerSymbol"> & {
  binance?: string; // BTC/USD-style real spot symbol on Binance, only if NOT OTC
}> = [
  { symbol: "Cardano OTC", displaySymbol: "Cardano (ADA)", isOtc: true, payoutPct: 92 },
  { symbol: "Toncoin OTC", displaySymbol: "Toncoin (TON)", isOtc: true, payoutPct: 92 },
  { symbol: "Avalanche OTC", displaySymbol: "Avalanche (AVAX)", isOtc: true, payoutPct: 88 },
  { symbol: "Polkadot OTC", displaySymbol: "Polkadot (DOT)", isOtc: true, payoutPct: 87 },
  { symbol: "TRON OTC", displaySymbol: "TRON (TRX)", isOtc: true, payoutPct: 86 },
  { symbol: "BNB OTC", displaySymbol: "BNB", isOtc: true, payoutPct: 83 },
  { symbol: "Solana OTC", displaySymbol: "Solana (SOL)", isOtc: true, payoutPct: 79 },
  { symbol: "Dogecoin OTC", displaySymbol: "Dogecoin (DOGE)", isOtc: true, payoutPct: 77 },
  { symbol: "Bitcoin OTC", displaySymbol: "Bitcoin (BTC)", isOtc: true, payoutPct: 75 },
  { symbol: "Bitcoin ETF OTC", displaySymbol: "Bitcoin ETF", isOtc: true, payoutPct: 74 },
  { symbol: "Ethereum OTC", displaySymbol: "Ethereum (ETH)", isOtc: true, payoutPct: 69 },
  { symbol: "Chainlink OTC", displaySymbol: "Chainlink (LINK)", isOtc: true, payoutPct: 58 },
  { symbol: "Polygon OTC", displaySymbol: "Polygon (MATIC)", isOtc: true, payoutPct: 53 },
  { symbol: "Litecoin OTC", displaySymbol: "Litecoin (LTC)", isOtc: true, payoutPct: 49 },
  { symbol: "Bitcoin", displaySymbol: "Bitcoin (BTC)", isOtc: false, payoutPct: 15, binance: "BTCUSDT" },
];

// ───────────────────────────────────────
// Commodities
// ───────────────────────────────────────
const COMMODITIES: Array<Omit<SeedAsset, "category" | "signalTier" | "provider" | "providerSymbol"> & {
  twelve?: string;
}> = [
  { symbol: "Brent Oil OTC", displaySymbol: "Brent Oil", isOtc: true, payoutPct: 80 },
  { symbol: "WTI Crude Oil OTC", displaySymbol: "WTI Crude Oil", isOtc: true, payoutPct: 80 },
  { symbol: "Silver OTC", displaySymbol: "Silver (XAG)", isOtc: true, payoutPct: 80 },
  { symbol: "Gold OTC", displaySymbol: "Gold (XAU)", isOtc: true, payoutPct: 80 },
  { symbol: "Natural Gas OTC", displaySymbol: "Natural Gas", isOtc: true, payoutPct: 45 },
  { symbol: "Palladium spot OTC", displaySymbol: "Palladium (XPD)", isOtc: true, payoutPct: 45 },
  { symbol: "Platinum spot OTC", displaySymbol: "Platinum (XPT)", isOtc: true, payoutPct: 45 },
];

// ───────────────────────────────────────
// Stocks
// ───────────────────────────────────────
const STOCKS: Array<Omit<SeedAsset, "category" | "signalTier" | "provider" | "providerSymbol"> & {
  ticker?: string;
}> = [
  { symbol: "Apple OTC", displaySymbol: "Apple", isOtc: true, payoutPct: 92, ticker: "AAPL" },
  { symbol: "Boeing Company OTC", displaySymbol: "Boeing", isOtc: true, payoutPct: 92, ticker: "BA" },
  { symbol: "McDonald's OTC", displaySymbol: "McDonald's", isOtc: true, payoutPct: 92, ticker: "MCD" },
  { symbol: "Microsoft OTC", displaySymbol: "Microsoft", isOtc: true, payoutPct: 92, ticker: "MSFT" },
  { symbol: "Advanced Micro Devices OTC", displaySymbol: "AMD", isOtc: true, payoutPct: 92, ticker: "AMD" },
  { symbol: "Coinbase Global OTC", displaySymbol: "Coinbase", isOtc: true, payoutPct: 92, ticker: "COIN" },
  { symbol: "Marathon Digital Holdings OTC", displaySymbol: "Marathon Digital", isOtc: true, payoutPct: 92, ticker: "MARA" },
  { symbol: "VISA OTC", displaySymbol: "Visa", isOtc: true, payoutPct: 92, ticker: "V" },
  { symbol: "Netflix OTC", displaySymbol: "Netflix", isOtc: true, payoutPct: 88, ticker: "NFLX" },
  { symbol: "FedEx OTC", displaySymbol: "FedEx", isOtc: true, payoutPct: 86, ticker: "FDX" },
  { symbol: "Cisco OTC", displaySymbol: "Cisco", isOtc: true, payoutPct: 84, ticker: "CSCO" },
  { symbol: "ExxonMobil OTC", displaySymbol: "ExxonMobil", isOtc: true, payoutPct: 77, ticker: "XOM" },
  { symbol: "Palantir Technologies OTC", displaySymbol: "Palantir", isOtc: true, payoutPct: 77, ticker: "PLTR" },
  { symbol: "American Express OTC", displaySymbol: "American Express", isOtc: true, payoutPct: 75, ticker: "AXP" },
  { symbol: "Tesla OTC", displaySymbol: "Tesla", isOtc: true, payoutPct: 71, ticker: "TSLA" },
  { symbol: "Amazon OTC", displaySymbol: "Amazon", isOtc: true, payoutPct: 69, ticker: "AMZN" },
  { symbol: "Intel OTC", displaySymbol: "Intel", isOtc: true, payoutPct: 65, ticker: "INTC" },
  { symbol: "Citigroup Inc OTC", displaySymbol: "Citigroup", isOtc: true, payoutPct: 63, ticker: "C" },
  { symbol: "Johnson & Johnson OTC", displaySymbol: "Johnson & Johnson", isOtc: true, payoutPct: 60, ticker: "JNJ" },
  { symbol: "FACEBOOK INC OTC", displaySymbol: "Meta", isOtc: true, payoutPct: 50, ticker: "META" },
  { symbol: "VIX OTC", displaySymbol: "VIX", isOtc: true, payoutPct: 47, ticker: "VIX" },
  { symbol: "Pfizer Inc OTC", displaySymbol: "Pfizer", isOtc: true, payoutPct: 45, ticker: "PFE" },
  { symbol: "GameStop Corp OTC", displaySymbol: "GameStop", isOtc: true, payoutPct: 41, ticker: "GME" },
];

// ───────────────────────────────────────
// Indices
// ───────────────────────────────────────
const INDICES: Array<Omit<SeedAsset, "category" | "signalTier" | "provider" | "providerSymbol"> & {
  twelve?: string;
}> = [
  { symbol: "AUS 200 OTC", displaySymbol: "AUS 200", isOtc: true, payoutPct: 67 },
  { symbol: "100GBP OTC", displaySymbol: "FTSE 100", isOtc: true, payoutPct: 45 },
  { symbol: "CAC 40", displaySymbol: "CAC 40", isOtc: false, payoutPct: 45 },
  { symbol: "D30EUR OTC", displaySymbol: "DAX 30", isOtc: true, payoutPct: 45 },
  { symbol: "DJI30 OTC", displaySymbol: "Dow Jones 30", isOtc: true, payoutPct: 45 },
  { symbol: "E35EUR", displaySymbol: "Euro Stoxx 35", isOtc: false, payoutPct: 45 },
  { symbol: "E35EUR OTC", displaySymbol: "Euro Stoxx 35", isOtc: true, payoutPct: 45 },
  { symbol: "E50EUR OTC", displaySymbol: "Euro Stoxx 50", isOtc: true, payoutPct: 45 },
  { symbol: "F40EUR OTC", displaySymbol: "CAC 40", isOtc: true, payoutPct: 45 },
  { symbol: "JPN225 OTC", displaySymbol: "Nikkei 225", isOtc: true, payoutPct: 45 },
  { symbol: "US100", displaySymbol: "NASDAQ 100", isOtc: false, payoutPct: 45 },
  { symbol: "US100 OTC", displaySymbol: "NASDAQ 100", isOtc: true, payoutPct: 45 },
  { symbol: "SMI 20", displaySymbol: "SMI 20", isOtc: false, payoutPct: 45 },
  { symbol: "SP500", displaySymbol: "S&P 500", isOtc: false, payoutPct: 45 },
  { symbol: "SP500 OTC", displaySymbol: "S&P 500", isOtc: true, payoutPct: 45 },
];

// ───────────────────────────────────────
// Tier-mapping logic
// ───────────────────────────────────────
function tierFor(category: AssetCategory, isOtc: boolean): SignalTier {
  if (isOtc) return "otc";
  if (category === "stock" || category === "index") return "elite";
  return "exchange";
}

function providerFor(
  category: AssetCategory,
  isOtc: boolean,
  hints: { binance?: string; ticker?: string; twelve?: string },
): { provider: SeedAsset["provider"]; providerSymbol?: string } {
  if (isOtc) return { provider: "none" };
  if (hints.binance) return { provider: "binance", providerSymbol: hints.binance };
  if (hints.ticker) return { provider: "twelvedata", providerSymbol: hints.ticker };
  if (hints.twelve) return { provider: "twelvedata", providerSymbol: hints.twelve };
  if (category === "currency") {
    return { provider: "twelvedata", providerSymbol: undefined }; // Will fall back to symbol stripped of slash
  }
  return { provider: "twelvedata" };
}

// ───────────────────────────────────────
// Public seed list
// ───────────────────────────────────────
export const SEED_ASSETS: SeedAsset[] = [
  ...CURRENCIES.map<SeedAsset>((a) => {
    const cat: AssetCategory = "currency";
    return {
      ...a,
      category: cat,
      signalTier: tierFor(cat, a.isOtc),
      ...providerFor(cat, a.isOtc, {}),
      providerSymbol: a.isOtc ? undefined : a.displaySymbol,
    };
  }),
  ...CRYPTO.map<SeedAsset>((a) => {
    const cat: AssetCategory = "crypto";
    const { binance, ...rest } = a;
    return {
      ...rest,
      category: cat,
      signalTier: tierFor(cat, a.isOtc),
      ...providerFor(cat, a.isOtc, { binance }),
    };
  }),
  ...COMMODITIES.map<SeedAsset>((a) => {
    const cat: AssetCategory = "commodity";
    const { twelve, ...rest } = a;
    const symbolMap: Record<string, string> = {
      "Brent Oil OTC": "BRENT",
      "WTI Crude Oil OTC": "WTI",
      "Silver OTC": "XAG/USD",
      "Gold OTC": "XAU/USD",
    };
    return {
      ...rest,
      category: cat,
      signalTier: tierFor(cat, a.isOtc),
      ...providerFor(cat, a.isOtc, { twelve: twelve ?? symbolMap[a.symbol] }),
    };
  }),
  ...STOCKS.map<SeedAsset>((a) => {
    const cat: AssetCategory = "stock";
    const { ticker, ...rest } = a;
    return {
      ...rest,
      category: cat,
      signalTier: tierFor(cat, a.isOtc),
      ...providerFor(cat, a.isOtc, { ticker }),
    };
  }),
  ...INDICES.map<SeedAsset>((a) => {
    const cat: AssetCategory = "index";
    const { twelve, ...rest } = a;
    return {
      ...rest,
      category: cat,
      signalTier: tierFor(cat, a.isOtc),
      ...providerFor(cat, a.isOtc, { twelve }),
    };
  }),
];
