import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2,
  Loader2, AlertCircle, Syringe, ChevronRight,
} from 'lucide-react';
import RoleSwitcher, { ROLES } from '../components/auth/RoleSwitcher';
import { authApi } from '../api/auth';

/* ─── small reusable field ─── */
function Field({ label, name, type = 'text', value, onChange, error, placeholder, optional }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-600">
        {label}
        {optional && <span className="text-slate-400 font-normal ml-1">(optional)</span>}
      </label>
      <div className="relative">
        <input
          name={name}
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white outline-none transition-all
            ${error
              ? 'border-red-400 ring-2 ring-red-100 focus:border-red-400'
              : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

/* ─── step indicator for hospital admin ─── */
function StepDots({ current, total }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-blue-600' : 'w-1.5 bg-slate-200'}`} />
      ))}
    </div>
  );
}

/* ─── main page ─── */
export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [role, setRole] = useState('patient');
  const [step, setStep] = useState(0); // only relevant for hospital_admin signup
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'error'|'success', msg }
  const [fieldErrors, setFieldErrors] = useState({});

  const formRef = useRef(null);
  const toastRef = useRef(null);
  const successRef = useRef(null);

  /* form state */
  const [fields, setFields] = useState({
    name: '', email: '', password: '', phone: '',
    // hospital admin extras
    hospitalName: '', city: '', pincode: '', address: '',
    hospitalRegistrationNumber: '', adminIdProofUrl: '', registrationCertificateUrl: '',
    // super admin
    setupKey: '',
  });

  const set = (e) => {
    setFields((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [e.target.name]: undefined }));
  };

  /* reset when switching role/mode */
  useEffect(() => {
    setStep(0);
    setFieldErrors({});
    setToast(null);
    if (formRef.current) {
      gsap.fromTo(formRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' });
    }
  }, [role, mode]);

  /* show toast */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    if (toastRef.current) {
      gsap.fromTo(toastRef.current, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
    }
    if (type === 'error') {
      gsap.to(formRef.current, { x: -6, duration: 0.06, repeat: 5, yoyo: true, ease: 'none', onComplete: () => gsap.set(formRef.current, { x: 0 }) });
    }
    setTimeout(() => setToast(null), 4500);
  };

  /* validation helpers */
  const required = (val, label) => (!val?.trim() ? `${label} is required` : null);
  const validEmail = (val) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? 'Enter a valid email' : null);
  const minLen = (val, n, label) => (val?.trim().length < n ? `${label} must be at least ${n} characters` : null);

  const validateStep = () => {
    const errs = {};
    if (mode === 'login') {
      const e = required(fields.email, 'Email') || validEmail(fields.email);
      const p = required(fields.password, 'Password');
      if (e) errs.email = e;
      if (p) errs.password = p;
      return errs;
    }
    // signup
    if (step === 0) {
      const n = required(fields.name, 'Name') || minLen(fields.name, 2, 'Name');
      const e = required(fields.email, 'Email') || validEmail(fields.email);
      const p = required(fields.password, 'Password') || minLen(fields.password, 8, 'Password');
      if (n) errs.name = n;
      if (e) errs.email = e;
      if (p) errs.password = p;
      if (role === 'super_admin') {
        const s = required(fields.setupKey, 'Setup key');
        if (s) errs.setupKey = s;
      }
    }
    if (step === 1 && role === 'hospital_admin') {
      const hn = required(fields.hospitalName, 'Hospital name');
      const c = required(fields.city, 'City');
      const pin = required(fields.pincode, 'Pincode') || minLen(fields.pincode, 4, 'Pincode');
      const reg = required(fields.hospitalRegistrationNumber, 'Registration number');
      const id = required(fields.adminIdProofUrl, 'Admin ID proof');
      const cert = required(fields.registrationCertificateUrl, 'Registration certificate');
      if (hn) errs.hospitalName = hn;
      if (c) errs.city = c;
      if (pin) errs.pincode = pin;
      if (reg) errs.hospitalRegistrationNumber = reg;
      if (id) errs.adminIdProofUrl = id;
      if (cert) errs.registrationCertificateUrl = cert;
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    gsap.fromTo(formRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.28, ease: 'power2.out' });
    setStep(1);
  };

  const handleBack = () => {
    setFieldErrors({});
    gsap.fromTo(formRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.28, ease: 'power2.out' });
    setStep(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      let result;
      if (mode === 'login') {
        result = await authApi.login({ email: fields.email, password: fields.password });
      } else if (role === 'patient') {
        const body = { name: fields.name, email: fields.email, password: fields.password };
        if (fields.phone.trim()) body.phone = fields.phone.trim();
        result = await authApi.signupPatient(body);
      } else if (role === 'hospital_admin') {
        const body = {
          name: fields.name, email: fields.email, password: fields.password,
          hospitalName: fields.hospitalName, city: fields.city, pincode: fields.pincode,
          hospitalRegistrationNumber: fields.hospitalRegistrationNumber,
          adminIdProofUrl: fields.adminIdProofUrl,
          registrationCertificateUrl: fields.registrationCertificateUrl,
        };
        if (fields.phone.trim()) body.phone = fields.phone.trim();
        if (fields.address.trim()) body.address = fields.address.trim();
        result = await authApi.signupHospitalAdmin(body);
      } else {
        const body = { name: fields.name, email: fields.email, password: fields.password, setupKey: fields.setupKey };
        if (fields.phone.trim()) body.phone = fields.phone.trim();
        result = await authApi.signupSuperAdmin(body);
      }

      /* success animation */
      setSuccess(true);
      if (successRef.current) {
        gsap.fromTo(successRef.current, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)' });
      }

      const msg = result?.message ?? 'Success!';
      setTimeout(() => {
        // result.data = { token, user, hospital?, onboarding? }
        if (onAuthSuccess) onAuthSuccess(result?.data);
      }, 1800);

      showToast('success', msg);
    } catch (err) {
      const msg = err?.message ?? 'Something went wrong. Please try again.';
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const isHospitalAdminSignup = mode === 'signup' && role === 'hospital_admin';
  const totalSteps = isHospitalAdminSignup ? 2 : 1;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/15 p-2 rounded-xl">
            <Syringe size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">VaxBook</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Vaccine care,<br />simplified.
            </h1>
            <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
              Search verified hospitals, compare vaccine availability, and book your slot in seconds.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Real-time slot availability',
              'Morning & afternoon sessions',
              'Instant booking confirmation',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <span className="text-blue-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/15 pt-6">
          <p className="text-blue-200 text-xs">Trusted by 500+ hospitals across India.</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-6">

          {/* Toast */}
          {toast && (
            <div
              ref={toastRef}
              className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border
                ${toast.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
            >
              {toast.type === 'error' ? <AlertCircle size={15} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={15} className="shrink-0 mt-0.5" />}
              {toast.msg}
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Mode toggle */}
            <div className="flex border-b border-slate-100">
              {['login', 'signup'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors capitalize
                    ${mode === m
                      ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/40'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-5" ref={formRef}>
              {/* Role switcher */}
              <RoleSwitcher active={role} onChange={(r) => { setRole(r); setStep(0); }} />

              {/* Success state */}
              {success ? (
                <div ref={successRef} className="flex flex-col items-center gap-3 py-8">
                  <CheckCircle2 size={52} className="text-emerald-500" />
                  <p className="text-slate-700 font-semibold text-center">
                    {mode === 'login' ? 'Welcome back!' : 'Account created!'}
                  </p>
                  <p className="text-xs text-slate-400 text-center">Redirecting you now…</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* step dots for hospital admin */}
                  {isHospitalAdminSignup && <StepDots current={step} total={totalSteps} />}

                  {/* ── LOGIN ── */}
                  {mode === 'login' && (
                    <>
                      <Field label="Email address" name="email" type="email" value={fields.email} onChange={set} error={fieldErrors.email} placeholder="you@example.com" />
                      <Field label="Password" name="password" type="password" value={fields.password} onChange={set} error={fieldErrors.password} placeholder="••••••••" />
                    </>
                  )}

                  {/* ── SIGNUP step 0 — personal info (all roles) ── */}
                  {mode === 'signup' && step === 0 && (
                    <>
                      <Field label="Full name" name="name" value={fields.name} onChange={set} error={fieldErrors.name} placeholder="Jane Doe" />
                      <Field label="Email address" name="email" type="email" value={fields.email} onChange={set} error={fieldErrors.email} placeholder="you@example.com" />
                      <Field label="Phone number" name="phone" type="tel" value={fields.phone} onChange={set} error={fieldErrors.phone} placeholder="+91 98765 43210" optional />
                      <Field label="Password" name="password" type="password" value={fields.password} onChange={set} error={fieldErrors.password} placeholder="Min. 8 characters" />
                      {role === 'super_admin' && (
                        <Field label="Setup key" name="setupKey" type="password" value={fields.setupKey} onChange={set} error={fieldErrors.setupKey} placeholder="Platform setup key" />
                      )}
                    </>
                  )}

                  {/* ── SIGNUP step 1 — hospital info ── */}
                  {mode === 'signup' && step === 1 && role === 'hospital_admin' && (
                    <>
                      <Field label="Hospital name" name="hospitalName" value={fields.hospitalName} onChange={set} error={fieldErrors.hospitalName} placeholder="City General Hospital" />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="City" name="city" value={fields.city} onChange={set} error={fieldErrors.city} placeholder="Mumbai" />
                        <Field label="Pincode" name="pincode" value={fields.pincode} onChange={set} error={fieldErrors.pincode} placeholder="400001" />
                      </div>
                      <Field label="Address" name="address" value={fields.address} onChange={set} error={fieldErrors.address} placeholder="123, Main Road" optional />
                      <Field label="Registration number" name="hospitalRegistrationNumber" value={fields.hospitalRegistrationNumber} onChange={set} error={fieldErrors.hospitalRegistrationNumber} placeholder="MH-HOS-2024-XXXXX" />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Admin ID proof URL" name="adminIdProofUrl" value={fields.adminIdProofUrl} onChange={set} error={fieldErrors.adminIdProofUrl} placeholder="/docs/id.pdf" />
                        <Field label="Reg. certificate URL" name="registrationCertificateUrl" value={fields.registrationCertificateUrl} onChange={set} error={fieldErrors.registrationCertificateUrl} placeholder="/docs/cert.pdf" />
                      </div>
                    </>
                  )}

                  {/* ── Actions ── */}
                  <div className="pt-1 space-y-2">
                    {/* next button (hospital admin step 0) */}
                    {isHospitalAdminSignup && step === 0 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all text-sm"
                      >
                        Continue
                        <ChevronRight size={15} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm"
                      >
                        {loading
                          ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
                          : mode === 'login'
                            ? <><span>Sign In</span><ArrowRight size={15} /></>
                            : <><span>Create Account</span><ArrowRight size={15} /></>
                        }
                      </button>
                    )}

                    {/* back button (hospital admin step 1) */}
                    {isHospitalAdminSignup && step === 1 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 text-sm py-2 transition-colors"
                      >
                        <ArrowLeft size={13} />
                        Back to personal info
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* switch mode */}
          <p className="text-center text-sm text-slate-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>

          <p className="text-center text-xs text-slate-400">
            By continuing you agree to our Terms of Service &amp; Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
