/**
 * Types for Sample City Hotel Competitor Pricing Dashboard
 * Refined specifically for 2-column core focus: 
 * 1. Competitor Normal Price Deviation & "Room to Increase" Signals
 * 2. 3-Month Future Pricing Variance % Forecast
 */

export interface Competitor {
  id: string;
  name: string;
  distance: string;
  basePrice: number; // Normal standard price
  currentPrice: number; // Simulated price for selected date
  source: 'jalan' | 'rakuten' | 'both';
  rating: number;
  roomType: string;
  deviationPercent: number; // Current Price vs Base Price (通常比乖離率!)
  liveSource?: string;
  liveConfidence?: string;
}

export interface LocalEvent {
  id: string;
  title: string;
  date: string;
  category: 'festival' | 'sports' | 'concert' | 'season' | 'holiday';
  description: string;
  impactLevel: 'high' | 'medium' | 'low';
  impactPercentage: number;
  location: string;
}

export interface Recommendation {
  basePrice: number;
  recommendedPrice: number;
  percentageChange: number; // vs our base
  reason: string;
  roomToRaisePercent: number; // もうちょい上げていい判定値 (%)
  factors: {
    competitorAverage: number;
    competitorAvgDeviation: number; // 競合全体の通常比平均乖離率
    occupancyImpact: number;
    eventImpact: number;
    seasonalImpact: number;
  };
}

export interface DateAnalysisResponse {
  date: string;
  competitors: Competitor[];
  recommendation: Recommendation;
  marketDemandIndex: 'high' | 'medium' | 'low';
  marketOccupancyRate: number;
  aiAdvice?: string;
}

export interface ForecastItem {
  date: string;
  recommendedPrice: number;
  varianceFromAvgPercent?: number; // 未来の平均からの値段の変動% (calculated dynamically on client, make optional in backend)
  competitorAvgPrice: number;
  competitorAvgDeviationPercent?: number; // 競合の通常時からの乖離率 (calculated dynamically or static)
  eventImpact: number;
  events: string[];
  occupancyEstimate: number;
  demandFactor?: number;
}
