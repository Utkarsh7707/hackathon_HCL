import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

const VACCINE_TYPES = [
  { id: 'covid19', label: 'COVID-19', color: 'bg-blue-100 text-blue-700' },
  { id: 'influenza', label: 'Influenza', color: 'bg-purple-100 text-purple-700' },
  { id: 'hepatitisB', label: 'Hepatitis B', color: 'bg-green-100 text-green-700' },
  { id: 'typhoid', label: 'Typhoid', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'hpv', label: 'HPV', color: 'bg-pink-100 text-pink-700' },
  { id: 'mmr', label: 'MMR', color: 'bg-orange-100 text-orange-700' },
];

export default function FilterSidebar({ filters, onChange, onClear }) {
  const [vaccineOpen, setVaccineOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);

  const toggleVaccine = (id) => {
    const updated = filters.vaccines.includes(id)
      ? filters.vaccines.filter((v) => v !== id)
      : [...filters.vaccines, id];
    onChange({ ...filters, vaccines: updated });
  };

  const activeFilterCount =
    filters.vaccines.length +
    (filters.priceMax < 2000 ? 1 : 0) +
    (filters.availableOnly ? 1 : 0);

  return (
    <aside className="w-72 shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-blue-600" />
            <span className="font-semibold text-slate-800 text-sm">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>

        <div className="p-4 space-y-1">
          {/* Vaccine Type Section */}
          <div className="rounded-xl overflow-hidden">
            <button
              onClick={() => setVaccineOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Vaccine Type
              {vaccineOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
            </button>
            {vaccineOpen && (
              <div className="px-3 pb-3 space-y-2">
                {VACCINE_TYPES.map(({ id, label, color }) => (
                  <label
                    key={id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filters.vaccines.includes(id)}
                        onChange={() => toggleVaccine(id)}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded border-2 border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-all flex items-center justify-center">
                        {filters.vaccines.includes(id) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors flex-1">
                      {label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
                      {label.charAt(0)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Price Range Section */}
          <div className="rounded-xl overflow-hidden">
            <button
              onClick={() => setPriceOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Price Range
              {priceOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
            </button>
            {priceOpen && (
              <div className="px-3 pb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-3">
                  <span>₹0</span>
                  <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Up to ₹{filters.priceMax.toLocaleString()}
                  </span>
                  <span>₹2,000</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={100}
                  value={filters.priceMax}
                  onChange={(e) => onChange({ ...filters, priceMax: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-3 gap-2">
                  {[500, 1000, 1500, 2000].map((val) => (
                    <button
                      key={val}
                      onClick={() => onChange({ ...filters, priceMax: val })}
                      className={`flex-1 text-xs py-1 rounded-lg border transition-all ${
                        filters.priceMax === val
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      ₹{val >= 1000 ? `${val / 1000}k` : val}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Availability */}
          <div className="rounded-xl overflow-hidden">
            <button
              onClick={() => setAvailabilityOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Availability
              {availabilityOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
            </button>
            {availabilityOpen && (
              <div className="px-3 pb-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters.availableOnly}
                      onChange={(e) => onChange({ ...filters, availableOnly: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-all relative">
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-4 translate-x-0" />
                    </div>
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                    Available slots only
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
