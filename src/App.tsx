import React, { useState, useEffect } from 'react';
import { LocalEvent } from './types';
import PricingDashboard from './components/PricingDashboard';
import EventCalendar from './components/EventCalendar';
import ForecastSection from './components/ForecastSection';
import { Hotel, Calendar, BarChart3, TrendingUp, Sparkles, MapPin, ExternalLink, HelpCircle } from 'lucide-react';

export default function App() {
  // Set default starting date as today's date
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTodayFormattedJP = () => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const d = new Date();
    return `${d.getFullYear()}年 ${d.getMonth() + 1}月${d.getDate()}日 (${days[d.getDay()]})`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [occupancy, setOccupancy] = useState<number>(40);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forecast'>('dashboard');
  const [allEvents, setAllEvents] = useState<LocalEvent[]>([]);
  const [showHowTo, setShowHowTo] = useState<boolean>(false);

  // Fetch constants on launch
  useEffect(() => {
    fetch('/api/local area-constants')
      .then(res => res.json())
      .then(data => {
        if (data && data.events) {
          setAllEvents(data.events);
        }
      })
      .catch(err => {
        console.error("Error fetching constants:", err);
        // Fallback robust local event list for resilience
        setAllEvents([
          {
            id: "ev_1",
            title: "市民マラソン大会 (City Marathon)",
            date: "2026-02-08",
            category: "sports",
            description: "地域を代表する大規模マラソンイベント。周辺ホテルは早期から満室になります。",
            impactLevel: "high",
            impactPercentage: 45,
            location: "市役所前・中央公園ほか"
          },
          {
            id: "ev_2",
            title: "地域温泉まつり",
            date: "2026-03-19",
            category: "festival",
            description: "湯祈祷や神輿、餅まきなどが行われる春の祭事。周辺の宿泊需要が大幅に増加します。",
            impactLevel: "medium",
            impactPercentage: 20,
            location: "温泉周辺"
          },
          {
            id: "ev_3",
            title: "地域春まつり",
            date: "2026-04-04",
            category: "festival",
            description: "地域を代表する春まつり。桜シーズンと合わせた観光のピーク期。",
            impactLevel: "high",
            impactPercentage: 25,
            location: "城跡・中央公園周辺"
          },
          {
            id: "ev_4",
            title: "ゴールデンウィーク 特需",
            date: "2026-05-02",
            category: "holiday",
            description: "大型連休による全国的なレジャー観光旅行増。家族連れやカップルの長期滞在が並びます。",
            impactLevel: "high",
            impactPercentage: 35,
            location: "市内内全域"
          },
          {
            id: "ev_5",
            title: "港まつり 花火大会",
            date: "2026-08-01",
            category: "festival",
            description: "地方最大級の1万発超が打ち上がる花火大会。県内外から数十万人が来客し、宿泊需要は年間最高レベルに。",
            impactLevel: "high",
            impactPercentage: 55,
            location: "港湾ふ頭エリア"
          },
          {
            id: "ev_6",
            title: "夏の市民おどり大会 (郷土芸能のおどり)",
            date: "2026-08-12",
            category: "festival",
            description: "A市名物、郷土芸能のおどりが繰り広げられる3日間の大熱演の夏祭り。市内メイン通りが歩行者天国になります。",
            impactLevel: "high",
            impactPercentage: 30,
            location: "中心商店街・中心街・中央公園地区"
          },
          {
            id: "ev_7",
            title: "秋祭り (鉢合わせ・神輿神事)",
            date: "2026-10-07",
            category: "festival",
            description: "豪快な神輿の「鉢合わせ」が全国的にも有名な秋の大祭。宵宮・本宮で地域全体が沸き立ちます。",
            impactLevel: "medium",
            impactPercentage: 20,
            location: "市内神社・市内神社"
          },
          {
            id: "ev_8",
            title: "年末年始・ビジネス休業 / レジャー特需",
            date: "2026-12-31",
            category: "holiday",
            description: "帰省客や年末年始観光客による高価格帯での満室想定。",
            impactLevel: "high",
            impactPercentage: 40,
            location: "市内周辺"
          }
        ]);
      });
  }, []);

  const handleSelectDateFromCalendar = (dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveTab('dashboard'); // Auto-navigate to analyzer on choice
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-[#27272A] flex flex-col justify-between select-none">
      
      {/* Upper Navigation & Brand Header - Geometric Balance System */}
      <header className="bg-white border-b border-[#E4E4E7] shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:h-16 gap-4">
            
            {/* Logo and Specific target name */}
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold tracking-tight text-[#18181B] text-base">
                    サンプルホテル <span className="font-sans font-normal text-xs text-[#71717A] ml-1">宿泊価格最適化システム</span>
                  </h1>
                  <span className="text-[10px] px-2 py-0.5 rounded border border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B] font-medium">
                    公式管理者ツール
                  </span>
                </div>
              </div>
            </div>

            {/* Right details */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-xs font-medium text-gray-750">{getTodayFormattedJP()}</div>
                <div className="text-[9px] text-[#A1A1AA]">A県市内中心部14-12</div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Primary tab triggers - Centered bar */}
      <div className="bg-white border-b border-[#E4E4E7] py-0.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all duration-150 ${
                activeTab === 'dashboard' 
                  ? 'border-[#18181B] text-[#18181B]' 
                  : 'border-transparent text-[#71717A] hover:text-[#27272A] hover:border-[#E4E4E7]'
              }`}
            >
              価格比較・適正価格算出
            </button>
            
            <button
              id="tab-forecast"
              onClick={() => setActiveTab('forecast')}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all duration-150 ${
                activeTab === 'forecast' 
                  ? 'border-[#18181B] text-[#18181B]' 
                  : 'border-transparent text-[#71717A] hover:text-[#27272A] hover:border-[#E4E4E7]'
              }`}
            >
              ３ヶ月先の客室価格・変動％予測
            </button>
          </nav>
        </div>
      </div>

      {/* Main Container Work Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        


        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && (
            <PricingDashboard
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              occupancy={occupancy}
              onOccupancyChange={setOccupancy}
              onForecastTrigger={() => setActiveTab('forecast')}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastSection
              startDate={selectedDate}
              occupancy={occupancy}
              onSelectDate={handleSelectDateFromCalendar}
            />
          )}
        </div>

      </main>

      {/* Understated Minimalist Footer */}
      <footer className="bg-white border-t border-[#E4E4E7] py-6 text-center text-[11px] text-[#71717A]">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium text-[#27272A]" id="app-footer-brand">
            市内ホテル価格最適化システム — サンプルホテル（A県市内中心部１４−１２）専用システム
          </p>
          <div className="flex justify-center gap-4 text-[#A1A1AA]">
            <span>基準指標値: 通常(平時)時からの変動・乖離率(%)</span>
            <span>|</span>
            <span>周辺調査範囲: 市内内 主要ウィークリー・マンスリー・アパートメントホテル10軒</span>
            <span>|</span>
            <span>データ集約: じゃらん / 楽天トラベル</span>
          </div>
          <p className="pt-2 text-[10px] text-[#A1A1AA] font-mono">
            &copy; 2026 Sample Hotel. System Version 2.4.1 | Developed with Google AI Studio.
          </p>
        </div>
      </footer>

    </div>
  );
}
