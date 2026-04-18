import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, color = 'blue', trend, trendLabel, delay = 0 }) {
  const cardRef = useRef(null);

  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   val: 'text-blue-700' },
    violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', val: 'text-violet-700' },
    emerald:{ bg: 'bg-emerald-50',icon: 'bg-emerald-100 text-emerald-600',val:'text-emerald-700'},
    amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600',  val: 'text-amber-700' },
    red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',      val: 'text-red-700' },
    slate:  { bg: 'bg-slate-50',  icon: 'bg-slate-100 text-slate-600',  val: 'text-slate-700' },
  };

  const c = colors[color] ?? colors.blue;

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, delay, ease: 'power3.out' }
    );
  }, [delay]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div ref={cardRef} className={`${c.bg} rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${c.icon}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={12} />
            {trendLabel}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className={`text-2xl font-extrabold ${c.val}`}>{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}
