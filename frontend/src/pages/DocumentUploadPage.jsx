import { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import {
  Upload, FileImage, X, CheckCircle2, Loader2,
  AlertCircle, Syringe, ArrowRight, ShieldCheck,
} from 'lucide-react';
import { hospitalAdminApi } from '../api/hospitalAdmin';

/* ─── single drop-zone ─── */
function DropZone({ label, hint, file, onFile, error }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  }, [onFile]);

  const preview = file ? URL.createObjectURL(file) : null;
  const isPdf = file?.type === 'application/pdf';

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer
          ${file ? 'border-emerald-300 bg-emerald-50 cursor-default' : dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        />

        {!file ? (
          <div className="flex flex-col items-center gap-2 py-8 px-4">
            <div className={`p-3 rounded-xl ${dragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
              <Upload size={20} className={dragging ? 'text-blue-600' : 'text-slate-400'} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">
                {dragging ? 'Drop it here' : 'Click or drag & drop'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
            </div>
          </div>
        ) : (
          <div className="p-3">
            <div className="flex items-start gap-3">
              {isPdf ? (
                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                  <FileImage size={20} className="text-slate-500" />
                </div>
              ) : (
                <img
                  src={preview}
                  alt="preview"
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1.5">
                  <CheckCircle2 size={10} /> Ready
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onFile(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

/* ─── main page ─── */
export default function DocumentUploadPage({ auth, onUploadSuccess }) {
  const [idProof, setIdProof] = useState(null);
  const [regCert, setRegCert] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const cardRef = useRef(null);
  const toastRef = useRef(null);

  const hospitalName = auth?.hospital?.name ?? 'Your Hospital';
  const regNumber    = auth?.hospital?.registrationNumber ?? '';

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 32, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    );
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    if (toastRef.current) {
      gsap.fromTo(toastRef.current, { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
    }
    if (type === 'error') {
      gsap.to(cardRef.current, { x: -5, duration: 0.06, repeat: 5, yoyo: true, ease: 'none', onComplete: () => gsap.set(cardRef.current, { x: 0 }) });
    }
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!idProof) errs.idProof = 'Admin ID proof is required';
    if (!regCert) errs.regCert = 'Registration certificate is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('adminIdProof',           idProof);
      formData.append('registrationCertificate', regCert);

      const result = await hospitalAdminApi.uploadDocuments(auth.token, formData);
      onUploadSuccess(result.data);
    } catch (err) {
      showToast('error', err?.message ?? 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">

      {/* toast */}
      {toast && (
        <div
          ref={toastRef}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg border max-w-sm w-full
            ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
        >
          <AlertCircle size={14} />
          {toast.msg}
        </div>
      )}

      <div ref={cardRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-lg overflow-hidden">

        {/* header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Syringe size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium">VaxBook — Hospital Verification</p>
              <p className="text-white font-bold text-sm">{hospitalName}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* context */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1">
            <p className="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
              <ShieldCheck size={14} /> One last step before you go live
            </p>
            <p className="text-xs text-blue-600 leading-relaxed">
              Upload your Admin ID proof and the Hospital Registration Certificate for{' '}
              <span className="font-semibold">Reg. {regNumber}</span>.
              Our super admin will review and approve within 24–48 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <DropZone
              label="Admin ID Proof"
              hint="Aadhaar, PAN, Passport or official ID · JPG, PNG, PDF · Max 5MB"
              file={idProof}
              onFile={setIdProof}
              error={errors.idProof}
            />
            <DropZone
              label="Hospital Registration Certificate"
              hint="Government issued hospital registration document · JPG, PNG, PDF · Max 5MB"
              file={regCert}
              onFile={setRegCert}
              error={errors.regCert}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Uploading…</>
                : <><span>Submit for Verification</span><ArrowRight size={15} /></>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
