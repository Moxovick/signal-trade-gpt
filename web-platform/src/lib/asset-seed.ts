/**
 * Default PocketOption asset whitelist.
 *
 * Sourced from the user's confirmed PO instrument list (June 2026).
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
  signalTier: SignalTier;
  provider: "none" | "binance" | "twelvedata" | "yahoo";
  providerSymbol?: string;
};

// ───────────────────────────────────────
// Currencies
// ───────────────────────────────────────
const CURRENCIES: Array<Omit<SeedAsset, "category" | "signalTier" | "provider" | "providerSymbol">> = [
  // OTC pairs
  { symbol: "AED/CNY OTC", displaySymbol: "AED/CNY", isOtc: true },
  { symbol: "AUD/CAD OTC", displaySymbol: "AUD/CAD", isOtc: true },
  { symbol: "CAD/JPY OTC", displaySymbol: "CAD/JPY", isOtc: true },
  { symbol: "EUR/GBP OTC", displaySymbol: "EUR/GBP", isOtc: true },
  { symbol: "EUR/JPY OTC", displaySymbol: "EUR/JPY", isOtc: true },
  { symbol: "GBP/JPY OTC", displaySymbol: "GBP/JPY", isOtc: true },
  { symbol: "NZD/USD OTC", displaySymbol: "NZD/USD", isOtc: true },
  { symbol: "OMR/CNY OTC", displaySymbol: "OMR/CNY", isOtc: true },
  { symbol: "USD/CNH OTC", displaySymbol: "USD/CNH", isOtc: true },
  { symbol: "USD/MYR OTC", displaySymbol: "USD/MYR", isOtc: true },
  { symbol: "USD/PHP OTC", displaySymbol: "USD/PHP", isOtc: true },
  { symbol: "USD/SGD OTC", displaySymbol: "USD/SGD", isOtc: true },
  { symbol: "YER/USD OTC", displaySymbol: "YER/USD", isOtc: true },
  { symbol: "USD/ARS OTC", displaySymbol: "USD/ARS", isOtc: true },
  { symbol: "USD/PKR OTC", displaySymbol: "USD/PKR", isOtc: true },
  { symbol: "EUR/NZD OTC", displaySymbol: "EUR/NZD", isOtc: true },
  { symbol: "AUD/NZD OTC", displaySymbol: "AUD/NZD", isOtc: true },
  { symbol: "USD/CLP OTC", displaySymbol: "USD/CLP", isOtc: true },
  { symbol: "CHF/JPY OTC", displaySymbol: "CHF/JPY", isOtc: true },
  { symbol: "LBP/USD OTC", displaySymbol: "LBP/USD", isOtc: true },
  { symbol: "USD/THB OTC", displaySymbol: "USD/THB", isOtc: true },
  { symbol: "AUD/USD OTC", displaySymbol: "AUD/USD", isOtc: true },
  { symbol: "AUD/JPY OTC", displaySymbol: "AUD/JPY", isOtc: true },
  { symbol: "NGN/USD OTC", displaySymbol: "NGN/USD", isOtc: true },
  { symbol: "QAR/CNY OTC", displaySymbol: "QAR/CNY", isOtc: true },
  { symbol: "BHD/CNY OTC", displaySymbol: "BHD/CNY", isOtc: true },
  { symbol: "USD/JPY OTC", displaySymbol: "USD/JPY", isOtc: true },
  { symbol: "NZD/JPY OTC", displaySymbol: "NZD/JPY", isOtc: true },
  { symbol: "USD/INR OTC", displaySymbol: "USD/INR", isOtc: true },
  { symbol: "EUR/HUF OTC", displaySymbol: "EUR/HUF", isOtc: true },
  { symbol: "MAD/USD OTC", displaySymbol: "MAD/USD", isOtc: true },
  { symbol: "CAD/CHF OTC", displaySymbol: "CAD/CHF", isOtc: true },
  { symbol: "USD/EGP OTC", displaySymbol: "USD/EGP", isOtc: true },
  { symbol: "ZAR/USD OTC", displaySymbol: "ZAR/USD", isOtc: true },
  { symbol: "EUR/USD OTC", displaySymbol: "EUR/USD", isOtc: true },
  { symbol: "GBP/USD OTC", displaySymbol: "GBP/USD", isOtc: true },
  { symbol: "AUD/CHF OTC", displaySymbol: "AUD/CHF", isOtc: true },
  { symbol: "USD/BRL OTC", displaySymbol: "USD/BRL", isOtc: true },
  { symbol: "USD/BDT OTC", displaySymbol: "USD/BDT", isOtc: true },
  { symbol: "EUR/CHF OTC", displaySymbol: "EUR/CHF", isOtc: true },
  { symbol: "KES/USD OTC", displaySymbol: "KES/USD", isOtc: true },
  { symbol: "USD/COP OTC", displaySymbol: "USD/COP", isOtc: true },
  { symbol: "CHF/NOK OTC", displaySymbol: "CHF/NOK", isOtc: true },
  { symbol: "USD/VND OTC", displaySymbol: "USD/VND", isOtc: true },
  { symbol: "JOD/CNY OTC", displaySymbol: "JOD/CNY", isOtc: true },
  { symbol: "TND/USD OTC", displaySymbol: "TND/USD", isOtc: true },
  { symbol: "USD/IDR OTC", displaySymbol: "USD/IDR", isOtc: true },
  { symbol: "USD/DZD OTC", displaySymbol: "USD/DZD", isOtc: true },
  { symbol: "UAH/USD OTC", displaySymbol: "UAH/USD", isOtc: true },
  { symbol: "USD/MXN OTC", displaySymbol: "USD/MXN", isOtc: true },
  { symbol: "GBP/AUD OTC", displaySymbol: "GBP/AUD", isOtc: true },
  { symbol: "USD/CHF OTC", displaySymbol: "USD/CHF", isOtc: true },
  { symbol: "EUR/TRY OTC", displaySymbol: "EUR/TRY", isOtc: true },
  { symbol: "USD/CAD OTC", displaySymbol: "USD/CAD", isOtc: true },
  { symbol: "SAR/CNY OTC", displaySymbol: "SAR/CNY", isOtc: true },
  // Exchange (non-OTC) pairs
  { symbol: "CHF/JPY", displaySymbol: "CHF/JPY", isOtc: false },
  { symbol: "EUR/CAD", displaySymbol: "EUR/CAD", isOtc: false },
  { symbol: "AUD/JPY", displaySymbol: "AUD/JPY", isOtc: false },
  { symbol: "CAD/JPY", displaySymbol: "CAD/JPY", isOtc: false },
  { symbol: "AUD/CHF", displaySymbol: "AUD/CHF", isOtc: false },
  { symbol: "EUR/USD", displaySymbol: "EUR/USD", isOtc: false },
  { symbol: "EUR/CHF", displaySymbol: "EUR/CHF", isOtc: false },
  { symbol: "AUD/CAD", displaySymbol: "AUD/CAD", isOtc: false },
  { symbol: "EUR/AUD", displaySymbol: "EUR/AUD", isOtc: false },
  { symbol: "GBP/JPY", displaySymbol: "GBP/JPY", isOtc: false },
  { symbol: "USD/JPY", displaySymbol: "USD/JPY", isOtc: false },
  { symbol: "EUR/JPY", displaySymbol: "EUR/JPY", isOtc: false },
  { symbol: "EUR/GBP", displaySymbol: "EUR/GBP", isOtc: false },
  { symbol: "GBP/USD", displaySymbol: "GBP/USD", isOtc: false },
  { symbol: "GBP/CAD", displaySymbol: "GBP/CAD", isOtc: false },
  { symbol: "USD/CAD", displaySymbol: "USD/CAD", isOtc: false },
  { symbol: "GBP/CHF", displaySymbol: "GBP/CHF", isOtc: false },
  { symbol: "AUD/USD", displaySymbol: "AUD/USD", isOtc: false },
  { symbol: "USD/CHF", displaySymbol: "USD/CHF", isOtc: false },
  { symbol: "CAD/CHF", displaySymbol: "CAD/CHF", isOtc: false },
  { symbol: "GBP/AUD", displaySymbol: "GBP/AUD", isOtc: false },
];

// ───────────────────────────────────────
// Crypto
// ───────────────────────────────────────
const CRYPTO: Array<Omit<SeedAsset, "category" | "signalTier" | "provider" | "providerSymbol"> & {
  binance?: string;
}> = [
  { symbol: "Bitcoin ETF OTC", displaySymbol: "Bitcoin ETF", isOtc: true },
  { symbol: "BNB OTC", displaySymbol: "BNB", isOtc: true },
  { symbol: "Polkadot OTC", displaySymbol: "Polkadot (DOT)", isOtc: true },
  { symbol: "Litecoin OTC", displaySymbol: "Litecoin (LTC)", isOtc: true },
  { symbol: "Toncoin OTC", displaySymbol: "Toncoin (TON)", isOtc: true },
  { symbol: "Ethereum OTC", displaySymbol: "Ethereum (ETH)", isOtc: true },
  { symbol: "Avalanche OTC", displaySymbol: "Avalanche (AVAX)", isOtc: true },
  { symbol: "Chainlink OTC", displaySymbol: "Chainlink (LINK)", isOtc: true },
  { symbol: "Polygon OTC", displaySymbol: "Polygon (MATIC)", isOtc: true },
  { symbol: "Bitcoin OTC", displaySymbol: "Bitcoin (BTC)", isOtc: true },
  { symbol: "Cardano OTC", displaySymbol: "Cardano (ADA)", isOtc: true },
  { symbol: "TRON OTC", displaySymbol: "TRON (TRX)", isOtc: true },
  { symbol: "Solana OTC", displaySymbol: "Solana (SOL)", isOtc: true },
  { symbol: "Dogecoin OTC", displaySymbol: "Dogecoin (DOGE)", isOtc: true },
  { symbol: "Bitcoin", displaySymbol: "Bitcoin (BTC)", isOtc: false, binance: "BTCUSDT" },
];

// ───────────────────────────────────────
// Commodities
// ───────────────────────────────────────
const COMMODITIES: Array<Omit<SeedAsset, "category" | "signalTier" | "provider" | "providerSymbol"> & {
  twelve?: string;
}> = [
  { symbol: "Brent Oil OTC", displaySymbol: "Brent Oil", isOtc: true },
  { symbol: "WTI Oil OTC", displaySymbol: "WTI Oil", isOtc: true },
  { symbol: "Silver OTC", displaySymbol: "Silver (XAG)", isOtc: true },
  { symbol: "Gold OTC", displaySymbol: "Gold (XAU)", isOtc: true },
  { symbol: "Natural Gas OTC", displaySymbol: "Natural Gas", isOtc: true },
  { symbol: "Palladium OTC", displaySymbol: "Palladium (XPD)", isOtc: true },
  { symbol: "Platinum OTC", displaySymbol: "Platinum (XPT)", isOtc: true },
];

// ───────────────────────────────────────
// Stocks
// ───────────────────────────────────────
const STOCKS: Array<Omit<SeedAsset, "category" | "signalTier" | "provider" | "providerSymbol"> & {
  ticker?: string;
}> = [
  { symbol: "Apple OTC", displaySymbol: "Apple", isOtc: true, ticker: "AAPL" },
  { symbol: "GameStop OTC", displaySymbol: "GameStop", isOtc: true, ticker: "GME" },
  { symbol: "VISA OTC", displaySymbol: "Visa", isOtc: true, ticker: "V" },
  { symbol: "American Express OTC", displaySymbol: "American Express", isOtc: true, ticker: "AXP" },
  { symbol: "VIX OTC", displaySymbol: "VIX", isOtc: true, ticker: "VIX" },
  { symbol: "Pfizer OTC", displaySymbol: "Pfizer", isOtc: true, ticker: "PFE" },
  { symbol: "AMD OTC", displaySymbol: "AMD", isOtc: true, ticker: "AMD" },
  { symbol: "Johnson & Johnson OTC", displaySymbol: "Johnson & Johnson", isOtc: true, ticker: "JNJ" },
  { symbol: "Marathon Digital OTC", displaySymbol: "Marathon Digital", isOtc: true, ticker: "MARA" },
  { symbol: "Amazon OTC", displaySymbol: "Amazon", isOtc: true, ticker: "AMZN" },
  { symbol: "Netflix OTC", displaySymbol: "Netflix", isOtc: true, ticker: "NFLX" },
  { symbol: "ExxonMobil OTC", displaySymbol: "ExxonMobil", isOtc: true, ticker: "XOM" },
  { symbol: "Coinbase OTC", displaySymbol: "Coinbase", isOtc: true, ticker: "COIN" },
  { symbol: "Cisco OTC", displaySymbol: "Cisco", isOtc: true, ticker: "CSCO" },
  { symbol: "Alibaba OTC", displaySymbol: "Alibaba", isOtc: true, ticker: "BABA" },
  { symbol: "Citigroup OTC", displaySymbol: "Citigroup", isOtc: true, ticker: "C" },
  { symbol: "FedEx OTC", displaySymbol: "FedEx", isOtc: true, ticker: "FDX" },
  { symbol: "Meta OTC", displaySymbol: "Meta", isOtc: true, ticker: "META" },
  { symbol: "Intel OTC", displaySymbol: "Intel", isOtc: true, ticker: "INTC" },
  { symbol: "Palantir OTC", displaySymbol: "Palantir", isOtc: true, ticker: "PLTR" },
  { symbol: "McDonald's OTC", displaySymbol: "McDonald's", isOtc: true, ticker: "MCD" },
  { symbol: "Tesla OTC", displaySymbol: "Tesla", isOtc: true, ticker: "TSLA" },
  { symbol: "Microsoft OTC", displaySymbol: "Microsoft", isOtc: true, ticker: "MSFT" },
];

// ───────────────────────────────────────
// Indices
// ───────────────────────────────────────
const INDICES: Array<Omit<SeedAsset, "category" | "signalTier" | "provider" | "providerSymbol"> & {
  twelve?: string;
}> = [
  { symbol: "AUS 200 OTC", displaySymbol: "AUS 200", isOtc: true },
  { symbol: "FTSE 100 OTC", displaySymbol: "FTSE 100", isOtc: true },
  { symbol: "DAX 30 OTC", displaySymbol: "DAX 30", isOtc: true },
  { symbol: "Dow Jones OTC", displaySymbol: "Dow Jones", isOtc: true },
  { symbol: "E35EUR OTC", displaySymbol: "Euro Stoxx 35", isOtc: true },
  { symbol: "E50EUR OTC", displaySymbol: "Euro Stoxx 50", isOtc: true },
  { symbol: "CAC 40 OTC", displaySymbol: "CAC 40", isOtc: true },
  { symbol: "Nikkei 225 OTC", displaySymbol: "Nikkei 225", isOtc: true },
  { symbol: "NASDAQ 100 OTC", displaySymbol: "NASDAQ 100", isOtc: true },
  { symbol: "S&P 500 OTC", displaySymbol: "S&P 500", isOtc: true },
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
    return { provider: "twelvedata", providerSymbol: undefined };
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
      "WTI Oil OTC": "WTI",
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
