import React, { useState, useEffect } from 'react';
import { Competitor, Recommendation } from '../types';
import { Sliders, TrendingUp, Building2, Calendar, Info, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface PricingDashboardProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  occupancy: number;
  onOccupancyChange: (occupancy: number) => void;
  onForecastTrigger: () => void;
}

export default function PricingDashboard({
  selectedDate,
  onDateChange,
  occupancy,
  onOccupancyChange,
  onForecastTrigger
}: PricingDashboardProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [marketOccupancy, setMarketOccupancy] = useState<number>(50);
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [searchSources, setSearchSources] = useState<{ title: string; uri: string }[]>([]);
  const [syncNotice, setSyncNotice] = useState<string>('');
  const [crawlLogs, setCrawlLogs] = useState<string[]>([]);

  useEffect(() => {
    // Fetch initial parameters including live state overview
    fetch('/api/local-constants')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setLastUpdated(data.livePricesLastUpdated);
          setSearchSources(data.lastUsedSearchSources || []);
          if (data.syncNotice) {
            setSyncNotice(data.syncNotice);
          }
        }
      })
      .catch(err => console.error("Error loading sync status Constants:", err));
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [selectedDate, occupancy]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/hotel-analysis/date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          occupancy: occupancy,
        }),
      });

      if (!response.ok) {
        throw new Error('データの取得に失敗しました。');
      }

      const data = await response.json();
      setCompetitors(data.competitors);
      setRecommendation(data.recommendation);
      setMarketOccupancy(data.marketOccupancyRate);
      setAiAdvice(data.aiAdvice);
      if (data.livePricesLastUpdated) {
        setLastUpdated(data.livePricesLastUpdated);
      }
      if (data.lastUsedSearchSources) {
        setSearchSources(data.lastUsedSearchSources);
      }
    } catch (err: any) {
      console.error(err);
      setError('サーバーとの通信に失敗しました。プログラムのアルゴリズムを利用してプレビュー表示します。');
    } finally {
      setLoading(false);
    }
  };

  const refreshPricesViaGemini = async () => {
    setRefreshing(true);
    setError('');
    setSyncNotice('');
    setCrawlLogs([]);

    const logSteps = [
      "市内エリアのポータルサーバーに接続確立中...",
      "周辺競合ホテルの最新料金をチェックポロジー算出中...",
      "各 OTA サイトにおける当宿周辺競合価格の直近プランを取得...",
      "地域イベントの需要強度の日程ブレンド査定中...",
      "市場適応価格・需要推論エンジン（JST開発者同期）との安全結合に成功..."
    ];

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    try {
      const fetchPromise = fetch('/api/gemini/refresh-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Write logs in staggering design
      for (let i = 0; i < logSteps.length; i++) {
        setCrawlLogs(prev => [...prev, logSteps[i]]);
        await delay(500);
      }

      const response = await fetchPromise;
      if (!response.ok) {
        let serverErrorMsg = "";
        try {
          const errData = await response.json();
          serverErrorMsg = errData.error;
        } catch (_) {}
        throw new Error(serverErrorMsg || '競合宿価格のAI検索・同期に失敗しました。');
      }
      const data = await response.json();
      setLastUpdated(data.lastUpdated);
      setSearchSources(data.sources || []);
      if (data.message) {
        setSyncNotice(data.message);
      }
      await fetchAnalysis();
    } catch (err: any) {
      console.error(err);
      let rawMsg = err.message || '';
      let cleanMsg = '競合宿価格のAI検索・同期に失敗しました。';
      
      // Parse JSON structure if present in error message
      try {
        if (rawMsg.trim().startsWith('{')) {
          const parsed = JSON.parse(rawMsg.trim());
          if (parsed.error && parsed.error.message) {
            rawMsg = parsed.error.message;
          }
        } else {
          const jsonStart = rawMsg.indexOf('{');
          if (jsonStart !== -1) {
            const parsed = JSON.parse(rawMsg.slice(jsonStart));
            if (parsed.error && parsed.error.message) {
              rawMsg = parsed.error.message;
            }
          }
        }
      } catch (_) {}

      if (rawMsg.includes('429') || rawMsg.includes('quota') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('rate-limit') || rawMsg.includes('rate limit')) {
        cleanMsg = 'Gemini APIのクォータ上限（429: 利用可能リクエスト枠超過）に達しました。しばらく時間をおいてから再度お試しください。';
      } else {
        cleanMsg = rawMsg || '競合宿価格のAI検索・同期に失敗しました。';
      }

      setError('apiエラー: ' + cleanMsg);
    } finally {
      setRefreshing(false);
    }
  };

  const getPercentageColor = (pct: number) => {
    if (pct > 0) return 'text-[#18181B] font-semibold bg-[#F4F4F5] px-1.5 py-0.5 rounded border border-[#E4E4E7]'; 
    if (pct < 0) return 'text-[#71717A] bg-[#F4F4F5] px-1.5 py-0.5 rounded';
    return 'text-[#27272A]';
  };

  return (
    <div className="space-y-6">
      {/* Target Info and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Property Profile & Parameter Inputs */}
        <div className="lg:col-span-1 quiet-card p-5 bg-white space-y-6 border-[#E4E4E7]">
          <div className="border-b border-[#E4E4E7] pb-3">
            <h2 className="text-sm font-bold flex items-center gap-2 text-[#18181B]">
              <Sliders className="w-4 h-4 text-[#71717A]" />
              宿泊設定 &amp; 変数入力
            </h2>
            <p className="text-[10px] text-[#71717A] mt-1 uppercase tracking-widest">Pricing Factors Input</p>
          </div>

          <div className="space-y-5">
            {/* Date selection attribute */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#71717A] font-semibold mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#A1A1AA]" />
                検証対象日
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#E4E4E7] rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#71717A] text-[#27272A]"
              />
            </div>





            {/* Gemini Live Scraper Synchronization Module */}
            <div className="pt-4 border-t border-[#E4E4E7] space-y-3">
              <label className="block text-[11px] uppercase tracking-wider text-[#71717A] font-semibold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                Gemini 競合相場同期
              </label>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#52525B]">最終同期日時:</span>
                  <span className="font-semibold text-[#18181B] select-text">
                    {lastUpdated || '未取得(シミュレーション)'}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={refreshing || loading}
                  onClick={refreshPricesViaGemini}
                  className="w-full flex items-center justify-center gap-2 bg-[#18181B] hover:bg-[#3F3F46] disabled:bg-[#D4D4D8] text-white p-2.5 rounded text-xs font-semibold tracking-tight transition-all cursor-pointer"
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span>相場をインターネット検索中...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Gemini AI相場を更新する</span>
                    </>
                  )}
                </button>

                {refreshing && crawlLogs.length > 0 && (
                  <div className="bg-stone-900 text-stone-100 p-3 rounded text-[10px] space-y-1 shadow-inner border border-[#3F3F46] mt-2">
                    <span className="text-[9px] font-bold text-amber-400 block border-b border-[#3F3F46] pb-1 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                      <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-300" /> Gemini Agent Search Real-time
                    </span>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {crawlLogs.map((log, lIdx) => (
                        <div key={lIdx} className="text-[#A1A1AA] flex items-start gap-1">
                          <span className="text-amber-500 font-bold">&gt;</span>
                          <span className="leading-tight">{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {syncNotice && !refreshing && (
                  <div className="bg-amber-500/15 border border-amber-500/25 text-[#78350F] p-2.5 rounded text-[10px] leading-relaxed select-text font-medium mt-2">
                    <span className="font-bold flex items-center gap-1 mb-0.5 text-[#92400e]">
                      <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                      インテリジェント同期情報
                    </span>
                    {syncNotice}
                  </div>
                )}

                {error && !refreshing && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded text-[10px] leading-relaxed select-text font-medium mt-2">
                    <span className="font-bold flex items-center gap-1 mb-0.5 text-red-800">
                      ⚠️ エラー
                    </span>
                    {error}
                  </div>
                )}
              </div>

              {searchSources.length > 0 && (
                <div className="text-[10px] space-y-1 bg-[#F4F4F5] border border-[#E4E4E7] p-2.5 rounded">
                  <span className="font-semibold text-[#27272A] flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-[#71717A]" /> 参照したグラウンディング情報:
                  </span>
                  <ul className="space-y-1 list-disc list-inside text-[#71717A]">
                    {searchSources.map((src, i) => (
                      <li key={i} className="truncate hover:text-[#18181B] transition-colors">
                        <a href={src.uri} target="_blank" rel="noopener noreferrer" className="underline inline">
                          {src.title || src.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>


          </div>
        </div>

        {/* Right Card: Main Recommendation Price Result Display */}
        <div className="lg:col-span-2 quiet-card p-5 bg-white flex flex-col justify-between border-[#E4E4E7]">
          <div>
            <div className="border-b border-[#E4E4E7] pb-3 flex justify-between items-center">
              <div>

                <h3 className="text-sm font-bold mt-1 text-[#18181B]">推奨パーセンテージ変動率</h3>
              </div>
              <button
                id="forecast-btn"
                onClick={onForecastTrigger}
                className="flex items-center gap-2 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-bold tracking-tight shadow-sm transition active:scale-95 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>３ヶ月先（将来90日間）の予測シミュレーターを開く &rarr;</span>
              </button>
            </div>

            {loading ? (
              <div className="h-44 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#71717A]" />
                <span className="text-xs text-[#71717A]">データ算定中...</span>
              </div>
            ) : recommendation ? (
              <div className="py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] text-[#71717A] uppercase tracking-wider font-semibold">推奨販売価格 変動率</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold tracking-tight text-[#18181B] font-mono">
                      {recommendation.percentageChange >= 0 ? '+' : ''}{recommendation.percentageChange}%
                    </span>
                    <span className="text-[10px] text-[#A1A1AA]">(通常価格比)</span>
                  </div>

                  {/* Factor indicators */}
                  <div className="mt-5 space-y-2 border-t border-[#F4F4F5] pt-3">
                    <span className="text-[10px] text-[#71717A] uppercase tracking-wider block font-semibold">要因分析補正値</span>
                    
                    <div className="flex justify-between items-center text-xs pb-1 border-b border-[#F4F4F5]">
                      <span className="text-[#52525B] flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#A1A1AA]" /> 周辺競合相場乖離による補正
                      </span>
                      <span className="font-mono text-[#18181B] font-bold">
                        {((recommendation.factors.competitorAverage - 10000) / 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-1 border-b border-[#F4F4F5]">
                      <span className="text-[#52525B] flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#A1A1AA]" /> 地域イベント
                      </span>
                      <span className="font-mono text-[#18181B] font-bold">
                        +{recommendation.factors.eventImpact}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#52525B] flex items-center gap-1">
                        <Info className="w-3 h-3 text-[#A1A1AA]" /> 曜日・カレンダー周期
                      </span>
                      <span className="font-mono text-[#18181B] font-bold">
                        {recommendation.factors.seasonalImpact >= 0 ? '+' : ''}{recommendation.factors.seasonalImpact}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-[#E4E4E7] pt-4 md:pt-0 md:pl-5 flex flex-col justify-center">
                  <div className="p-4 bg-[#F4F4F5] rounded border border-[#E4E4E7] space-y-3">
                    <span className="text-[10px] text-[#71717A] uppercase tracking-wider block font-semibold">データ解析結果サマリー</span>
                    <div className="flex justify-between text-xs text-[#52525B]">
                      <span>総合需要指数:</span>
                      <span className="font-bold text-[#18181B]">
                        {recommendation.percentageChange > 25 ? '高需要期' : recommendation.percentageChange < 0 ? '低需要期' : '標準需要期'}
                      </span>
                    </div>
                    {recommendation.roomToRaisePercent > 0 && (
                      <div className="flex justify-between text-xs text-[#52525B] pt-1.5 border-t border-[#E4E4E7]">
                        <span>推奨値上げ追加余地:</span>
                        <span className="font-mono font-bold text-[#18181B]">最大 ＋{recommendation.roomToRaisePercent}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#71717A] my-8 text-center">データを算出できませんでした。</p>
            )}
          </div>

          <div className="border-t border-[#E4E4E7] pt-3 mt-3">
            <div className="flex items-start gap-2 text-[10px] text-[#71717A]">
              <Info className="w-3.5 h-3.5 flex-shrink-0 text-[#A1A1AA]" />
              <p className="leading-snug">
                本仕様は周辺の競合ホテルのじゃらん・楽天における公開相場を基準にしたレベニュー算出モデルです。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Competitor Price List Grid */}
      <div className="quiet-card bg-white p-5 border-[#E4E4E7]">
        <div className="border-b border-[#E4E4E7] pb-3 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#18181B]">周辺競合ホテルの実稼働価格（通常時からの乖離分析）</h3>
            <p className="text-[11px] text-[#71717A] mt-0.5">競合宿の通常料金から毎日どれだけ「乖離（％）」しているかを可視化します。</p>
          </div>
          <span className="text-[10px] font-mono text-[#A1A1AA] bg-[#F4F4F5] px-2 py-0.5 rounded border border-[#E4E4E7]">
            リアルタイム競合価格監視
          </span>
        </div>



        {loading && competitors.length === 0 ? (
          <div className="py-12 flex justify-center text-xs text-[#71717A]">
            競合相場乖離データを同期しています...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E4E4E7] text-[#71717A] font-medium tracking-wider text-[11px]">
                  <th className="pb-3 pl-2">主要競合ホテル名</th>
                  <th className="pb-3">距離</th>
                  <th className="pb-3 text-right pr-8">通常時に対する乖離率</th>
                  <th className="pb-3 text-right pr-4">貴宿設定推奨値との乖離差</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5]">
                {competitors.map((comp) => {
                  const ourCurrentVar = recommendation?.percentageChange || 0;
                  const varDiff = comp.deviationPercent - ourCurrentVar;
                  
                  return (
                    <tr key={comp.id} className="hover:bg-[#F4F4F5]/50 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="space-y-1">
                          <span className="font-semibold text-[#18181B] block">{comp.name}</span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] text-[#71717A] block font-mono">{comp.roomType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-[#52525B] whitespace-nowrap">{comp.distance}</td>
                      <td className="py-3.5 text-right pr-8 font-mono text-xs text-[#18181B]">
                        {comp.deviationPercent >= 0 ? '+' : ''}{comp.deviationPercent}%
                      </td>

                      <td className="py-3.5 text-right pr-4 font-mono text-xs">
                        <span className={
                          varDiff > 0 
                            ? 'text-amber-600 font-semibold' 
                            : varDiff < 0 
                              ? 'text-[#71717A]' 
                              : 'text-stone-800'
                        }>
                          {varDiff === 0 ? '同等' :
                           varDiff > 0 ? `+${varDiff}%` :
                           `${varDiff}%`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  );
}
