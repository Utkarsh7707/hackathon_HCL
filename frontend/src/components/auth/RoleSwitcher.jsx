import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { User, Building2, ShieldCheck } from 'lucide-react';

export const ROLES = [
  { id: 'patient',        label: 'Patient',        icon: User,         desc: 'Book vaccine slots' },
  { id: 'hospital_admin', label: 'Hospital Admin',  icon: Building2,    desc: 'Manage your hospital' },
  { id: 'super_admin',    label: 'Super Admin',     icon: ShieldCheck,  desc: 'Platform oversight' },
];

export default function RoleSwitcher({ active, onChange }) {
  const pillRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const idx = ROLES.findIndex((r) => r.id === active);
    const container = containerRef.current;
    if (!container || !pillRef.current) return;
    const tabs = container.querySelectorAll('[data-tab]');
    if (!tabs[idx]) return;
    const tab = tabs[idx];
    gsap.to(pillRef.current, {
      x: tab.offsetLeft,
      width: tab.offsetWidth,
      duration: 0.35,
      ease: 'power2.out',
    });
  }, [active]);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">I am a</p>
      <div ref={containerRef} className="relative flex bg-slate-100 rounded-xl p-1 gap-0">
        {/* sliding pill */}
        <div
          ref={pillRef}
          className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm pointer-events-none"
          style={{ width: 0 }}
        />
        {ROLES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            data-tab
            onClick={() => onChange(id)}
            className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-colors duration-200 ${
              active === id ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center">
        {ROLES.find((r) => r.id === active)?.desc}
      </p>
    </div>
  );
}
