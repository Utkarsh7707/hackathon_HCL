import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Syringe, LogOut, ChevronRight } from 'lucide-react';

const ROLE_META = {
  super_admin:    { label: 'Super Admin',    color: 'bg-violet-100 text-violet-700 border-violet-200' },
  hospital_admin: { label: 'Hospital Admin', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  patient:        { label: 'Patient',        color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

export default function Navbar({ user, pageTitle, onLogout }) {
  const navRef = useRef(null);
  const meta = ROLE_META[user?.role] ?? ROLE_META.patient;
  const initials = (user?.name ?? 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -56, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }
    );
  }, []);

  return (
    <header ref={navRef} className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Left — logo + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Syringe size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-slate-800 text-sm tracking-tight hidden sm:block">VaxBook</span>
          </div>
          {pageTitle && (
            <>
              <ChevronRight size={14} className="text-slate-300 shrink-0" />
              <span className="text-sm font-semibold text-slate-600 truncate">{pageTitle}</span>
            </>
          )}
        </div>

        {/* Right — role badge + avatar + logout */}
        <div className="flex items-center gap-3 shrink-0">
          <span className={`hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
            {meta.label}
          </span>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden md:block max-w-[120px] truncate">
              {user?.name}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all border border-transparent hover:border-red-100"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
