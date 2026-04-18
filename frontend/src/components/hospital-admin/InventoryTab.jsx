import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Plus, Syringe, PackageCheck, AlertTriangle, Pencil,
  Trash2, X, Loader2, CheckCircle2, ChevronDown, RefreshCw,
} from 'lucide-react';
import { inventoryApi } from '../../api/inventory';

const TYPE_COLORS = {
  covid19:    'bg-blue-100 text-blue-700',
  influenza:  'bg-purple-100 text-purple-700',
  hepatitisB: 'bg-green-100 text-green-700',
  hepatitisA: 'bg-teal-100 text-teal-700',
  typhoid:    'bg-yellow-100 text-yellow-700',
  hpv:        'bg-pink-100 text-pink-700',
  mmr:        'bg-orange-100 text-orange-700',
  varicella:  'bg-indigo-100 text-indigo-700',
  rabies:     'bg-red-100 text-red-700',
  other:      'bg-slate-100 text-slate-600',
};

const VACCINE_TYPES = [
  'covid19', 'influenza', 'hepatitisB', 'hepatitisA', 'typhoid',
  'hpv', 'mmr', 'varicella', 'rabies', 'cholera', 'other',
];

/* ─── Add / top-up modal ─── */
function AddModal({ token, catalog, initialVaccineId = '', onSuccess, onClose }) {
  const [vaccineId, setVaccineId]     = useState(initialVaccineId);
  const [stock, setStock]             = useState('');
  const [price, setPrice]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(ref.current,
      { scale: 0.9, opacity: 0, y: 12 },
      { scale: 1,   opacity: 1, y: 0,  duration: 0.28, ease: 'back.out(1.8)' }
    );
  }, []);

  useEffect(() => {
    setVaccineId(initialVaccineId || '');
  }, [initialVaccineId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vaccineId || !stock || !price) { setError('All fields are required.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await inventoryApi.add(token, {
        vaccineId,
        totalStock:   Number(stock),
        pricePerDose: Number(price),
      });
      onSuccess(res.data);
    } catch (err) {
      setError(err?.message ?? 'Failed to add vaccine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div ref={ref} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-800">Add Vaccine to Inventory</p>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={15} />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
            <AlertTriangle size={12} /> {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Vaccine</label>
            <div className="relative">
              <select
                value={vaccineId}
                onChange={(e) => setVaccineId(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white pr-8"
              >
                <option value="">Select vaccine…</option>
                {catalog.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Stock (doses)</label>
              <input
                type="number" min="1" value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Price / dose (₹)</label>
              <input
                type="number" min="0" value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 850"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Plus size={14} /> Add to Inventory</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function CreateVaccineModal({ token, onSuccess, onClose }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('covid19');
  const [manufacturer, setManufacturer] = useState('');
  const [dosesRequired, setDosesRequired] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(ref.current,
      { scale: 0.9, opacity: 0, y: 12 },
      { scale: 1, opacity: 1, y: 0, duration: 0.28, ease: 'back.out(1.8)' }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !type) {
      setError('Name and type are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await inventoryApi.createCatalogVaccine(token, {
        name: name.trim(),
        type,
        manufacturer: manufacturer.trim(),
        dosesRequired: Number(dosesRequired) || 1,
      });
      onSuccess(res.data);
    } catch (err) {
      setError(err?.message ?? 'Failed to create vaccine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div ref={ref} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-800">Create New Vaccine</p>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={15} />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
            <AlertTriangle size={12} /> {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Covaxin X"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Type</label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white pr-8"
                >
                  {VACCINE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">Doses</label>
              <input
                type="number"
                min="1"
                value={dosesRequired}
                onChange={(e) => setDosesRequired(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Manufacturer (optional)</label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="e.g. Bharat Biotech"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : <><Plus size={14} /> Create Vaccine</>}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Edit modal ─── */
function EditModal({ token, item, onSuccess, onClose }) {
  const [addStock, setAddStock] = useState('');
  const [price, setPrice]       = useState(String(item.pricePerDose));
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const ref = useRef(null);

  useEffect(() => {
    gsap.fromTo(ref.current,
      { scale: 0.9, opacity: 0, y: 12 },
      { scale: 1,   opacity: 1, y: 0,  duration: 0.28, ease: 'back.out(1.8)' }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const body = { pricePerDose: Number(price) };
      if (addStock) body.addStock = Number(addStock);
      const res = await inventoryApi.update(token, item.id, body);
      onSuccess(res.data);
    } catch (err) {
      setError(err?.message ?? 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div ref={ref} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800 text-sm">Edit Inventory</p>
            <p className="text-xs text-slate-500 mt-0.5">{item.vaccine?.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={15} />
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Add stock (doses)</label>
            <input
              type="number" min="1" value={addStock}
              onChange={(e) => setAddStock(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
            <p className="text-xs text-slate-400">Current: {item.availableStock} / {item.totalStock} doses</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Default price / dose (₹)</label>
            <input
              type="number" min="0" value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── inventory card ─── */
function VaccineCard({ item, onEdit, onRemove }) {
  const pct      = item.totalStock > 0 ? Math.round((item.usedStock / item.totalStock) * 100) : 0;
  const isLow    = item.availableStock <= 10 && item.availableStock > 0;
  const isEmpty  = item.availableStock === 0;
  const typeColor = TYPE_COLORS[item.vaccine?.type] ?? TYPE_COLORS.other;
  const barColor  = isEmpty ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 space-y-4 ${isEmpty ? 'border-red-200' : isLow ? 'border-amber-200' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Syringe size={16} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-sm leading-tight truncate">{item.vaccine?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.vaccine?.manufacturer}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${typeColor}`}>
          {item.vaccine?.type}
        </span>
      </div>

      {/* stock bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">{item.usedStock} used</span>
          <span className={`font-semibold ${isEmpty ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
            {item.availableStock} left
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-400 text-right">{item.totalStock} total doses</p>
      </div>

      {/* badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
          ₹{item.pricePerDose.toLocaleString()} / dose
        </span>
        {isEmpty  && <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={9} />Out of stock</span>}
        {isLow    && <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={9} />Low stock</span>}
        {!isEmpty && !isLow && <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={9} />In stock</span>}
      </div>

      {/* actions */}
      <div className="flex gap-2 pt-1 border-t border-slate-100">
        <button
          onClick={() => onEdit(item)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors"
        >
          <Pencil size={11} /> Edit
        </button>
        <button
          onClick={() => onRemove(item)}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 py-1.5 rounded-lg transition-colors"
        >
          <Trash2 size={11} /> Remove
        </button>
      </div>
    </div>
  );
}

/* ─── main tab ─── */
export default function InventoryTab({ token }) {
  const [inventory, setInventory] = useState([]);
  const [catalog,   setCatalog]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [initialAddVaccineId, setInitialAddVaccineId] = useState('');
  const gridRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const [invRes, catRes] = await Promise.all([
        inventoryApi.list(token),
        inventoryApi.getCatalog(),
      ]);
      setInventory(invRes.data ?? []);
      setCatalog(catRes.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  useEffect(() => {
    if (!gridRef.current || loading) return;
    gsap.fromTo(
      gridRef.current.querySelectorAll('[data-card]'),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.07, duration: 0.38, ease: 'power2.out' }
    );
  }, [loading]);

  const handleAddSuccess = (newItem) => {
    setInventory((prev) => {
      const idx = prev.findIndex((i) => i.id === newItem.id);
      return idx >= 0
        ? prev.map((i, j) => (j === idx ? { ...i, ...newItem } : i))
        : [newItem, ...prev];
    });
    setShowAdd(false);
    setInitialAddVaccineId('');
  };

  const handleCreateVaccineSuccess = (newVaccine) => {
    setCatalog((prev) => {
      const next = [newVaccine, ...prev.filter((v) => v.id !== newVaccine.id)];
      return next.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
    setShowCreate(false);
    setInitialAddVaccineId(newVaccine.id);
    setShowAdd(true);
  };

  const handleEditSuccess = (updated) => {
    setInventory((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
    setEditItem(null);
  };

  const handleRemove = async (item) => {
    if (!window.confirm(`Remove ${item.vaccine?.name} from inventory?`)) return;
    try {
      await inventoryApi.remove(token, item.id);
      setInventory((prev) => prev.filter((i) => i.id !== item.id));
    } catch { /* ignore */ }
  };

  const activeItems   = inventory.filter((i) => i.isActive);
  const inactiveItems = inventory.filter((i) => !i.isActive);

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Vaccine Inventory</h3>
          <p className="text-xs text-slate-500 mt-0.5">{activeItems.length} active vaccines</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-all">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
          >
            <Plus size={13} /> Create New Vaccine
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
          >
            <Plus size={13} /> Add Vaccine
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 h-48 animate-pulse" />
          ))}
        </div>
      ) : activeItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <PackageCheck size={36} className="opacity-30" />
          <p className="text-sm font-medium">No vaccines in inventory yet</p>
          <button onClick={() => setShowAdd(true)} className="text-xs text-blue-600 hover:underline font-medium">
            Add your first vaccine
          </button>
        </div>
      ) : (
        <div ref={gridRef} className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeItems.map((item) => (
            <div key={item.id} data-card>
              <VaccineCard item={item} onEdit={setEditItem} onRemove={handleRemove} />
            </div>
          ))}
          {inactiveItems.length > 0 && (
            <p className="col-span-full text-xs text-slate-400 text-center pt-2">
              {inactiveItems.length} inactive vaccine{inactiveItems.length > 1 ? 's' : ''} hidden
            </p>
          )}
        </div>
      )}

      {showAdd && (
        <AddModal
          token={token}
          catalog={catalog}
          initialVaccineId={initialAddVaccineId}
          onSuccess={handleAddSuccess}
          onClose={() => {
            setShowAdd(false);
            setInitialAddVaccineId('');
          }}
        />
      )}
      {showCreate && (
        <CreateVaccineModal
          token={token}
          onSuccess={handleCreateVaccineSuccess}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editItem && (
        <EditModal
          token={token}
          item={editItem}
          onSuccess={handleEditSuccess}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}
