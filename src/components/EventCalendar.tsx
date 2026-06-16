import React, { useState } from 'react';
import { LocalEvent } from '../types';
import { Calendar, ChevronLeft, ChevronRight, MapPin, AlertCircle, Sparkles, Flame } from 'lucide-react';

interface EventCalendarProps {
  onSelectDate: (date: string) => void;
  allEvents: LocalEvent[];
}

export default function EventCalendar({ onSelectDate, allEvents }: EventCalendarProps) {
  // Default to June 2026 since current metadata time is June 2026
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // 0-indexed, so 5 = June

  const monthNames = [
    '1月 (Jan)', '2月 (Feb)', '3月 (Mar)', '4月 (Apr)', 
    '5月 (May)', '6月 (Jun)', '7月 (Jul)', '8月 (Aug)', 
    '9月 (Sep)', '10月 (Oct)', '11月 (Nov)', '12月 (Dec)'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 6 = Saturday
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const startDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate date cells
  const dayCells = [];
  // Blank cells
  for (let i = 0; i < startDay; i++) {
    dayCells.push(null);
  }
  // Days of month
  for (let d = 1; d <= totalDays; d++) {
    dayCells.push(d);
  }

  // Get event for a specific calendar cell
  const getEventsForDay = (day: number): LocalEvent[] => {
    return allEvents.filter(ev => {
      const evDate = new Date(ev.date);
      return evDate.getFullYear() === currentYear &&
             evDate.getMonth() === currentMonth &&
             evDate.getDate() === day;
    });
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'festival': return 'bg-orange-50 text-orange-700 border border-orange-100';
      case 'sports': return 'bg-[#3F3F46] text-white border border-[#27272A]';
      case 'concert': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'holiday': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-[#F4F4F5] text-[#27272A] border border-[#E4E4E7]';
    }
  };

  const handleCellClick = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const clickedDateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onSelectDate(clickedDateStr);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Grid Container */}
      <div className="quiet-card bg-white p-5 border-[#E4E4E7]">
        
        {/* Calendar Nav Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#E4E4E7]">
          <div>
            <span className="text-[10px] text-[#71717A] font-mono tracking-widest uppercase block">A県A市・中心商店街周辺エリア</span>
            <h3 className="text-sm font-bold text-[#18181B] flex items-center gap-2 mt-0.5">
              <Calendar className="w-4 h-4 text-[#71717A]" />
              周辺イベントカレンダー (連携済み)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#18181B] bg-[#F4F4F5] border border-[#E4E4E7] px-3 py-1 rounded">
              {currentYear}年 {monthNames[currentMonth]}
            </span>
            <div className="flex border border-[#E4E4E7] divide-x divide-[#E4E4E7] rounded overflow-hidden bg-white">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 px-3 hover:bg-[#F4F4F5] transition text-[#27272A]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 px-3 hover:bg-[#F4F4F5] transition text-[#27272A]"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Days Grid - Bento Geometric layout */}
        <div className="grid grid-cols-7 gap-px bg-[#E4E4E7] border border-[#E4E4E7] rounded overflow-hidden mt-4">
          {/* Calendar Header Row */}
          <div className="bg-[#F4F4F5] py-2 text-center text-[10px] font-bold text-red-500">SUN</div>
          <div className="bg-[#F4F4F5] py-2 text-center text-[10px] font-bold text-[#27272A]">MON</div>
          <div className="bg-[#F4F4F5] py-2 text-center text-[10px] font-bold text-[#27272A]">TUE</div>
          <div className="bg-[#F4F4F5] py-2 text-center text-[10px] font-bold text-[#27272A]">WED</div>
          <div className="bg-[#F4F4F5] py-2 text-center text-[10px] font-bold text-[#27272A]">THU</div>
          <div className="bg-[#F4F4F5] py-2 text-center text-[10px] font-bold text-[#27272A]">FRI</div>
          <div className="bg-[#F4F4F5] py-2 text-center text-[10px] font-bold text-blue-500">SAT</div>
          
          {dayCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="bg-[#F4F4F5]/40 h-24"></div>;
            }

            const dayEvents = getEventsForDay(day);
            const isWeekend = (idx % 7 === 0) || (idx % 7 === 6);
            const cellBg = isWeekend ? 'bg-[#F4F4F5]/30' : 'bg-white';

            return (
              <div
                key={`day-${day}`}
                className={`${cellBg} h-24 p-2 hover:bg-[#F4F4F5] transition cursor-pointer flex flex-col justify-between`}
                onClick={() => handleCellClick(day)}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-mono text-[11px] font-bold ${
                    idx % 7 === 0 ? 'text-red-500' :
                    idx % 7 === 6 ? 'text-blue-500' :
                    'text-[#18181B]'
                  }`}>
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                  )}
                </div>

                <div className="mt-1 flex-grow overflow-y-auto space-y-1">
                  {dayEvents.slice(0, 2).map(ev => (
                    <div
                      key={ev.id}
                      className="text-[9px] p-1 rounded font-sans leading-tight border bg-[#F4F4F5] text-[#18181B] border-[#E4E4E7] shadow-sm truncate"
                      title={`${ev.title} (+${ev.impactPercentage}% 補正)`}
                    >
                      <span className="font-semibold">{ev.title}</span>
                    </div>
                  ))}
                </div>

                <div className="text-right text-[8px] text-[#A1A1AA] invisible hover:visible">
                  検証➔
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#71717A] mt-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-[#A1A1AA]" />
          <p>
            日付枠内をクリックすると、その日のリアルタイム競合価格比較および最適化シミュレーションに直接ジャンプできます。
          </p>
        </div>
      </div>

      {/* Specific local details card list */}
      <div className="quiet-card bg-white p-5 border-[#E4E4E7]">
        <h4 className="text-sm font-bold text-[#18181B] border-[#E4E4E7] border-b pb-3 mb-4">
          A県A市：代表的なイベント一覧（価格補正トリガー）
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => {
                onSelectDate(ev.date);
              }}
              className="p-4 border border-[#E4E4E7] bg-white rounded hover:border-[#71717A] hover:bg-[#F4F4F5]/50 transition cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-mono font-bold text-[#71717A]">{ev.date}</span>
                  <span className={`px-2 py-0.5 text-[9px] rounded font-semibold uppercase tracking-wider ${getCategoryClass(ev.category)}`}>
                    {ev.category === 'festival' ? '伝統祭礼' :
                     ev.category === 'sports' ? '代表スポーツ' :
                     ev.category === 'holiday' ? '連休特需' : '歴史観光'}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-[#18181B]">{ev.title}</h5>
                <p className="text-[11px] text-[#71717A] leading-relaxed mt-1">{ev.description}</p>
              </div>

              <div className="border-t border-dashed border-[#E4E4E7] pt-2.5 flex justify-between items-center text-[10px] text-[#71717A]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  {ev.location}
                </span>
                <span className="text-[#18181B] font-bold flex items-center gap-0.5">
                  予測上方変動: +{ev.impactPercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
