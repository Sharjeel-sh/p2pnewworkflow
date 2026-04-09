import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router';
import {
  Building2, Home, AlertCircle, CheckCircle2,
  Upload, X, FileText, Image, User, Phone, MapPin, CreditCard, Hash,
  ChevronRight, ChevronLeft, Shield, Camera,
} from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';
import { useApp } from '../../context/AppContext';
import type { OrgType } from '../../context/AppContext';

interface FileUploadState {
  fileName: string;
  fileSize: string;
  dataUrl: string;
}

interface FormData {
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  orgName: string;
  phone: string;
  address: string;
  type: OrgType;
  cnic: string;
  ntn: string;
  cnicFront: FileUploadState | null;
  cnicBack: FileUploadState | null;
  legalDoc: FileUploadState | null;
}

const EMPTY_FORM: FormData = {
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
  orgName: '',
  phone: '',
  address: '',
  type: 'restaurant',
  cnic: '',
  ntn: '',
  cnicFront: null,
  cnicBack: null,
  legalDoc: null,
};

type Step = 1 | 2 | 3;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileUploadBoxProps {
  label: string;
  sublabel?: string;
  accept: string;
  icon: 'image' | 'document';
  value: FileUploadState | null;
  onChange: (val: FileUploadState | null) => void;
  required?: boolean;
  error?: string;
}

function FileUploadBox({ label, sublabel, accept, icon, value, onChange, required, error }: FileUploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const isImage = icon === 'image';
  const isPreviewable = value && value.dataUrl && (
    value.fileName.match(/\.(png|jpg|jpeg|gif|webp)$/i)
  );

  return (
    <div>
      <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
        {label} {required && <span className="text-red-600">*</span>}
        {!required && <span className="text-stone-400 ml-1">(Optional)</span>}
      </label>
      {sublabel && (
        <p className="text-stone-400 mb-2" style={{ fontSize: '0.75rem' }}>{sublabel}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-xl py-5 px-4 flex flex-col items-center justify-center gap-2 transition-all ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${error ? 'bg-red-100' : 'bg-gray-100'}`}>
            {isImage
              ? <Image size={22} className={error ? 'text-red-600' : 'text-gray-400'} />
              : <FileText size={22} className={error ? 'text-red-600' : 'text-gray-400'} />
            }
          </div>
          <div className="text-center">
            <p className={`${error ? 'text-red-700' : 'text-stone-500'}`} style={{ fontSize: '0.82rem', fontWeight: 500 }}>
              <Upload size={12} className="inline mr-1" />
              Tap to upload
            </p>
            <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>
              {isImage ? 'JPG, PNG, WEBP' : 'PDF, JPG, PNG'} · Max 5MB
            </p>
          </div>
        </button>
      ) : (
        <div className={`border-2 rounded-xl overflow-hidden ${error ? 'border-red-200' : 'border-red-200'}`}>
          {isPreviewable ? (
            <div className="relative">
              <img
                src={value.dataUrl}
                alt={label}
                className="w-full object-cover"
                style={{ maxHeight: '140px' }}
              />
              <button
                type="button"
                onClick={() => onChange(null)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
              >
                <X size={14} color="white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-red-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-stone-700 truncate" style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                  {value.fileName}
                </p>
                <p className="text-stone-400" style={{ fontSize: '0.72rem' }}>{value.fileSize}</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0"
              >
                <X size={14} className="text-red-700" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border-t border-red-100">
            <CheckCircle2 size={13} className="text-red-600" />
            <span className="text-red-700" style={{ fontSize: '0.72rem', fontWeight: 500 }}>
              {value.fileName} uploaded successfully
            </span>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="ml-auto text-red-700"
              style={{ fontSize: '0.72rem', fontWeight: 500 }}
            >
              Change
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="text-red-700 mt-1 flex items-center gap-1" style={{ fontSize: '0.75rem' }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  type?: string;
  required?: boolean;
}

function FormField({ label, icon, value, onChange, placeholder, error, type = 'text', required }: FieldProps) {
  return (
    <div>
      <label className="block text-stone-600 mb-1.5" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border-2 rounded-xl pl-10 pr-4 py-3 focus:outline-none bg-gray-50 transition-colors ${
            error ? 'border-red-300 focus:border-red-600' : 'border-gray-200 focus:border-red-600'
          }`}
          style={{ fontSize: '0.93rem' }}
        />
      </div>
      {error && (
        <p className="text-red-700 mt-1 flex items-center gap-1" style={{ fontSize: '0.75rem' }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

export function OrgRegistration() {
  const location = useLocation();
  const prefill = (
    location.state as {
      prefill?: { ownerName?: string; ownerEmail?: string; ownerPassword?: string; phone?: string };
    } | null
  )?.prefill;
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(() => ({
    ...EMPTY_FORM,
    ownerName: prefill?.ownerName ?? '',
    ownerEmail: prefill?.ownerEmail ?? '',
    ownerPassword: prefill?.ownerPassword ?? '',
    phone: prefill?.phone ?? '',
  }));
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ownerPhoto, setOwnerPhoto] = useState('');
  const ownerPhotoInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { registerOrganization, setCurrentUser } = useApp();

  const handleOwnerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setOwnerPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as string]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateStep1 = () => {
    // Step 1 is just type selection, always valid
    return {};
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.ownerName.trim()) e.ownerName = 'Owner name is required';
    if (!form.orgName.trim()) e.orgName = 'Organization name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.address.trim()) e.address = 'Address is required';
    return e;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (form.type === 'homemade') {
      if (!form.cnic.trim()) e.cnic = 'CNIC number is required';
      if (!form.cnicFront) e.cnicFront = 'CNIC front photo is required';
      if (!form.cnicBack) e.cnicBack = 'CNIC back photo is required';
    } else {
      if (!form.ntn.trim()) e.ntn = 'NTN number is required';
      if (!form.cnic.trim()) e.cnic = 'CNIC number is required for Restaurant';
      if (!form.legalDoc) e.legalDoc = 'Legal agreement document is required for Restaurants';
    }
    return e;
  };

  const handleNext = () => {
    let errs: Record<string, string> = {};
    if (step === 1) errs = validateStep1();
    if (step === 2) errs = validateStep2();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((step + 1) as Step);
  };

  const handleBack = () => {
    setErrors({});
    setStep((step - 1) as Step);
  };

  const handleRegister = async () => {
    const errs = validateStep3();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const org = registerOrganization({
      ownerName: form.ownerName.trim(),
      ownerEmail: form.ownerEmail.trim() || undefined,
      ownerPassword: form.ownerPassword.trim() || undefined,
      orgName: form.orgName.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      type: form.type,
      verificationStatus: 'pending',
      ...(form.type === 'homemade'
        ? {
          cnic: form.cnic.trim(),
          cnicFrontPhoto: form.cnicFront?.fileName,
          cnicBackPhoto: form.cnicBack?.fileName,
          legalAgreementDoc: form.legalDoc?.fileName,
        }
        : {
          cnic: form.cnic.trim(),
          ntn: form.ntn.trim(),
          legalAgreementDoc: form.legalDoc?.fileName,
        }
      ),
      verified: undefined
    });
    // immediately sign in so the kitchen screens have context
    if (org) {
      setCurrentUser({ role: 'kitchen', orgId: org.id });
    }
    setLoading(false);
    setSuccess(true);
  };

  // ─── Success State ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <MobileLayout>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <div className="text-center">
            <h2 className="text-stone-800 mb-2" style={{ fontWeight: 700, fontSize: '1.3rem' }}>
              Registration Successful!
            </h2>
            <p className="text-stone-500" style={{ fontSize: '0.87rem' }}>
              Your organization registration has been submitted successfully.
            </p>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <p className="text-amber-700" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Organization Verification: Pending
              </p>
              <p className="text-amber-600 mt-0.5" style={{ fontSize: '0.75rem' }}>
                Your documents have been submitted for government verification.
              </p>
            </div>
            <p className="text-stone-400 mt-2" style={{ fontSize: '0.76rem' }}>
              Next step: Continue to your kitchen dashboard.
            </p>
          </div>
          <div className="w-full mt-3">
            <button
              onClick={() => navigate('/kitchen')}
              className="w-full bg-red-700 text-white py-3 rounded-xl hover:bg-red-800 transition-colors"
              style={{ fontWeight: 700, fontSize: '0.9rem' }}
            >
              Continue to Kitchen
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // ─── Step Indicator ──────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 py-4 px-5">
      {[1, 2, 3].flatMap((num, i) => {
        const isActive = step === num;
        const isDone = step > num;
        const circle = (
          <div
            key={`step-${num}`}
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              isDone ? 'bg-red-600' : isActive ? 'bg-red-700' : 'bg-gray-200'
            }`}
            style={{ fontSize: '0.82rem', fontWeight: 700, color: isDone || isActive ? 'white' : '#9ca3af' }}
          >
            {isDone ? <CheckCircle2 size={16} /> : num}
          </div>
        );
        if (i < 2) {
          return [
            circle,
            <div
              key={`line-${num}`}
              className={`flex-1 h-0.5 rounded-full transition-all ${isDone ? 'bg-red-500' : 'bg-gray-200'}`}
            />,
          ];
        }
        return [circle];
      })}
    </div>
  );

  const stepTitles = ['Organization Type', 'Basic Information', 'Legal Documents'];

  return (
    <MobileLayout>
      <TopBar title="Organization Registration" backTo="/signup" />

      <input
        ref={ownerPhotoInputRef}
        type="file"
        accept="image/*"
        onChange={handleOwnerPhotoChange}
        className="hidden"
      />

      <StepIndicator />

      <div className="px-5 mb-4">
        <p className="text-stone-400" style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Step {step} of 3
        </p>
        <h3 className="text-stone-800 mt-0.5" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
          {stepTitles[step - 1]}
        </h3>
      </div>

      <div className="flex-1 px-5 pb-6 overflow-y-auto">

        {/* ── STEP 1: Organization Type ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-stone-500" style={{ fontSize: '0.87rem', lineHeight: 1.55 }}>
              Choose the type that best describes your food business.
            </p>
            <button
              onClick={() => update('type', 'restaurant')}
              className={`w-full rounded-2xl p-4 border text-left transition-all ${
                form.type === 'restaurant'
                  ? 'bg-white border-red-600 ring-2 ring-red-100 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-red-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  form.type === 'restaurant' ? 'bg-red-700' : 'bg-gray-100'
                }`}>
                  <Building2 size={22} color={form.type === 'restaurant' ? 'white' : '#9ca3af'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={form.type === 'restaurant' ? 'text-red-900' : 'text-stone-800'} style={{ fontWeight: 700, fontSize: '1rem' }}>
                      Organization as a Restaurant
                    </p>
                    {form.type === 'restaurant' && (
                      <span className="bg-red-700 text-white px-2 py-0.5 rounded-full" style={{ fontSize: '0.64rem', fontWeight: 600 }}>
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500" style={{ fontSize: '0.8rem', lineHeight: 1.55 }}>
                    Formal food business with NTN, owner CNIC, and legal documents for verification.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {['NTN Required', 'Owner CNIC Required', 'Legal Docs Required'].map(tag => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-full ${
                          form.type === 'restaurant' ? 'bg-red-100 text-red-900' : 'bg-gray-100 text-stone-500'
                        }`}
                        style={{ fontSize: '0.68rem', fontWeight: 600 }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {form.type === 'restaurant' ? (
                  <CheckCircle2 size={18} className="text-red-700 mt-0.5 flex-shrink-0" />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 mt-0.5 flex-shrink-0" />
                )}
              </div>
            </button>

            <button
              onClick={() => update('type', 'homemade')}
              className={`w-full rounded-2xl p-4 border text-left transition-all ${
                form.type === 'homemade'
                  ? 'bg-white border-red-600 ring-2 ring-red-100 shadow-sm'
                  : 'bg-white border-gray-200 hover:border-red-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  form.type === 'homemade' ? 'bg-red-700' : 'bg-gray-100'
                }`}>
                  <Home size={22} color={form.type === 'homemade' ? 'white' : '#9ca3af'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={form.type === 'homemade' ? 'text-red-900' : 'text-stone-800'} style={{ fontWeight: 700, fontSize: '1rem' }}>
                      Organization as a Home Chef
                    </p>
                    {form.type === 'homemade' && (
                      <span className="bg-red-700 text-white px-2 py-0.5 rounded-full" style={{ fontSize: '0.64rem', fontWeight: 600 }}>
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500" style={{ fontSize: '0.8rem', lineHeight: 1.55 }}>
                    Home-based kitchen verified with CNIC and supporting documents (legal docs optional when applicable).
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {['CNIC Required', 'CNIC Photos Required', 'Legal Docs Optional'].map(tag => (
                      <span
                        key={tag}
                        className={`px-2 py-0.5 rounded-full ${
                          form.type === 'homemade' ? 'bg-red-100 text-red-900' : 'bg-gray-100 text-stone-500'
                        }`}
                        style={{ fontSize: '0.68rem', fontWeight: 600 }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {form.type === 'homemade' ? (
                  <CheckCircle2 size={18} className="text-red-700 mt-0.5 flex-shrink-0" />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 mt-0.5 flex-shrink-0" />
                )}
              </div>
            </button>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-2.5">
              <Shield size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-blue-600" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                Your documents are used for verification only and kept private. QuickBite does not share your information with third parties.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Basic Information ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">

            <div className="flex justify-center mb-6">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => ownerPhotoInputRef.current?.click()}
                  className="w-40 h-40 rounded-full border-4 border-red-700 bg-slate-300 overflow-hidden flex items-center justify-center"
                >
                  {ownerPhoto ? (
                    <img src={ownerPhoto} alt="Owner profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={86} className="text-slate-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => ownerPhotoInputRef.current?.click()}
                  className="absolute bottom-3 right-0 w-12 h-12 rounded-full border-2 border-black bg-white flex items-center justify-center"
                >
                  <Camera size={20} className="text-black" />
                </button>
              </div>
            </div>

            <FormField
              label="Owner / Registrar Name"
              icon={<User size={16} />}
              value={form.ownerName}
              onChange={v => update('ownerName', v)}
              placeholder="e.g. Ahmed Khan"
              error={errors.ownerName}
              required
            />
            <FormField
              label="Organization Name"
              icon={form.type === 'restaurant' ? <Building2 size={16} /> : <Home size={16} />}
              value={form.orgName}
              onChange={v => update('orgName', v)}
              placeholder={form.type === 'restaurant' ? 'e.g. Karachi Grills' : "e.g. Mama's Kitchen"}
              error={errors.orgName}
              required
            />
            <FormField
              label="Organization Phone Number"
              icon={<Phone size={16} />}
              value={form.phone}
              onChange={v => update('phone', v)}
              placeholder="03XX-XXXXXXX"
              type="tel"
              error={errors.phone}
              required
            />
            <FormField
              label="Complete Address"
              icon={<MapPin size={16} />}
              value={form.address}
              onChange={v => update('address', v)}
              placeholder="Street, Block, Area, City"
              error={errors.address}
              required
            />
          </div>
        )}

        {/* ── STEP 3: Legal Documents ───────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            {form.type === 'homemade' ? (
              <>
                {/* CNIC Number */}
                <FormField
                  label="CNIC Number"
                  icon={<CreditCard size={16} />}
                  value={form.cnic}
                  onChange={v => update('cnic', v)}
                  placeholder="XXXXX-XXXXXXX-X"
                  error={errors.cnic}
                  required
                />

                {/* CNIC Front Photo */}
                <FileUploadBox
                  label="CNIC Front Photo"
                  sublabel="Upload a clear photo of the front side of your CNIC"
                  accept="image/*"
                  icon="image"
                  value={form.cnicFront}
                  onChange={v => { update('cnicFront', v); if (v) setErrors(p => ({ ...p, cnicFront: '' })); }}
                  required
                  error={errors.cnicFront}
                />

                {/* CNIC Back Photo */}
                <FileUploadBox
                  label="CNIC Back Photo"
                  sublabel="Upload a clear photo of the back side of your CNIC"
                  accept="image/*"
                  icon="image"
                  value={form.cnicBack}
                  onChange={v => { update('cnicBack', v); if (v) setErrors(p => ({ ...p, cnicBack: '' })); }}
                  required
                  error={errors.cnicBack}
                />

                {/* Legal Agreement — Optional for Homemade */}
                <div className="border-t border-dashed border-gray-200 pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-stone-400" />
                    <p className="text-stone-600" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                      Legal Agreement
                    </p>
                    <span className="bg-gray-100 text-stone-400 px-2 py-0.5 rounded-full" style={{ fontSize: '0.68rem', fontWeight: 500 }}>
                      OPTIONAL
                    </span>
                  </div>
                  <FileUploadBox
                    label="Legal Agreement Document"
                    sublabel="Upload any partnership or food safety agreement if available"
                    accept=".pdf,image/*"
                    icon="document"
                    value={form.legalDoc}
                    onChange={v => update('legalDoc', v)}
                    required={false}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Restaurant Owner CNIC Number */}
                <FormField
                  label="Restaurant Owner CNIC Number"
                  icon={<CreditCard size={16} />}
                  value={form.cnic}
                  onChange={v => update('cnic', v)}
                  placeholder="XXXXX-XXXXXXX-X"
                  error={errors.cnic}
                  required
                />

                {/* NTN Number */}
                <FormField
                  label="NTN Number"
                  icon={<Hash size={16} />}
                  value={form.ntn}
                  onChange={v => update('ntn', v)}
                  placeholder="XXXXXXX-X"
                  error={errors.ntn}
                  required
                />

                {/* Legal Agreement — Required for Restaurant */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-red-700" />
                    <p className="text-stone-600" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                      Legal Agreement Document
                    </p>
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full" style={{ fontSize: '0.68rem', fontWeight: 600 }}>
                      REQUIRED
                    </span>
                  </div>
                  <p className="text-stone-400 mb-3" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                    As a registered restaurant, you must upload your legal agreement or business license document.
                  </p>
                  <FileUploadBox
                    label="Legal Agreement / Business License"
                    sublabel="PDF or image of your business registration, trade license, or legal agreement"
                    accept=".pdf,image/*"
                    icon="document"
                    value={form.legalDoc}
                    onChange={v => { update('legalDoc', v); if (v) setErrors(p => ({ ...p, legalDoc: '' })); }}
                    required
                    error={errors.legalDoc}
                  />
                </div>
              </>
            )}

          </div>
        )}

        {/* ── Navigation Buttons ────────────────────────────────────────────── */}
        <div className={`flex gap-3 mt-8 ${step > 1 ? '' : ''}`}>
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 border-2 border-gray-200 text-stone-600 py-4 rounded-2xl flex items-center justify-center gap-2 hover:border-gray-300 active:scale-95 transition-all"
              style={{ fontWeight: 600, fontSize: '0.95rem' }}
            >
              <ChevronLeft size={18} />
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-red-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-800 active:scale-95 transition-all shadow-lg shadow-red-200"
              style={{ fontWeight: 700, fontSize: '0.95rem' }}
            >
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleRegister}
              disabled={loading}
              className="flex-1 bg-red-700 text-white py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-800 active:scale-95 transition-all shadow-lg shadow-red-200 disabled:opacity-60"
              style={{ fontWeight: 700, fontSize: '0.95rem' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Complete Registration
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
