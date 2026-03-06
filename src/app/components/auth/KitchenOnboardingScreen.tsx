import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Camera, CheckCircle2, ShieldCheck, Smartphone, User, UserCircle2 } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { TopBar } from '../shared/TopBar';

type Step = 1 | 2 | 3;
const OTP_RESEND_SECONDS = 30;

function toDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function formatPhoneInput(value: string): string {
  const digits = toDigits(value).slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

function normalizePhone(value: string): string {
  return toDigits(value).slice(0, 11);
}

function generateOtpCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function KitchenOnboardingScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerPhoto, setOwnerPhoto] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ownerPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timerId = window.setInterval(() => {
      setResendCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [resendCountdown]);

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateStep1 = () => {
    const next: Record<string, string> = {};
    const cleaned = normalizePhone(phone);
    if (!cleaned) {
      next.phone = 'Phone number is required';
    }
    return next;
  };

  const validateStep2 = () => {
    const next: Record<string, string> = {};
    const otpDigits = toDigits(otp).slice(0, 4);
    if (!otpDigits) {
      next.otp = 'Verification code is required';
    } else if (!/^\d{4}$/.test(otpDigits)) {
      next.otp = 'Enter a 4-digit verification code';
    } else if (generatedOtp && otpDigits !== generatedOtp) {
      next.otp = 'Invalid verification code';
    }
    return next;
  };

  const validateStep3 = () => {
    const next: Record<string, string> = {};
    if (!ownerName.trim()) next.ownerName = 'Owner name is required';
    if (!ownerEmail.trim()) next.ownerEmail = 'Email is required';
    if (!password.trim()) next.password = 'Password is required';
    if (!confirmPassword.trim()) next.confirmPassword = 'Confirm password is required';
    if (password.trim() && confirmPassword.trim() && password !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    return next;
  };

  const handleNext = () => {
    let nextErrors: Record<string, string> = {};
    if (step === 1) nextErrors = validateStep1();
    if (step === 2) nextErrors = validateStep2();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    if (step === 1) {
      setPhone(formatPhoneInput(phone));
      setOtp('');
      setGeneratedOtp(generateOtpCode());
      setResendCountdown(OTP_RESEND_SECONDS);
    }
    setErrors({});
    setStep((step + 1) as Step);
  };

  const resendOtpCode = () => {
    if (resendCountdown > 0) return;
    setGeneratedOtp(generateOtpCode());
    setOtp('');
    setErrors(prev => ({ ...prev, otp: '' }));
    setResendCountdown(OTP_RESEND_SECONDS);
  };

  const handleContinueToOrganization = () => {
    const nextErrors = validateStep3();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    navigate('/kitchen/register', {
      state: {
        prefill: {
          ownerName: ownerName.trim(),
          phone: phone.trim(),
          ownerEmail: ownerEmail.trim(),
          ownerPassword: password.trim(),
        },
      },
    });
  };

  const handleOwnerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setOwnerPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <MobileLayout>
      <TopBar title="Kitchen Screen" backTo="/signup" bgColor="bg-orange-500" />



      <div className="flex-1 px-6 py-7 overflow-y-auto">
        {step === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Smartphone size={22} className="text-teal-700" />
              </div>
              <div>
                <h2 className="text-slate-900" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Phone Number Registration
                </h2>
                <p className="text-slate-500 mt-1" style={{ fontSize: '0.84rem', lineHeight: 1.5 }}>
                  Enter your phone number to receive an OTP and continue onboarding.
                </p>
              </div>
            </div>

            <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              Phone Number
            </label>
            <div className={`rounded-xl border-2 bg-slate-50 ${errors.phone ? 'border-red-300' : 'border-slate-200 focus-within:border-teal-500'}`}>
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(formatPhoneInput(e.target.value)); clearError('phone'); }}
                placeholder="03XX-XXXXXXX"
                className="w-full bg-transparent px-4 py-3.5 focus:outline-none text-slate-800"
                style={{ fontSize: '0.95rem', fontWeight: 500 }}
              />
            </div>
            <p className="text-slate-400 mt-1.5" style={{ fontSize: '0.73rem' }}>
              Use the same number you will use for sign in.
            </p>
            {errors.phone && <p className="text-red-600 text-xs mt-1.5">{errors.phone}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={22} className="text-cyan-700" />
              </div>
              <div>
                <h2 className="text-slate-900" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  OTP Verification
                </h2>
                <p className="text-slate-500 mt-1" style={{ fontSize: '0.84rem', lineHeight: 1.5 }}>
                  Enter the verification code sent to {formatPhoneInput(phone) || 'your phone number'}.
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2">
              <p className="text-cyan-700" style={{ fontSize: '0.76rem', fontWeight: 700 }}>
                Demo code: {generatedOtp || '----'}
              </p>
            </div>

            <label className="block text-slate-700 mb-1.5" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
              Verification Code
            </label>
            <div className={`rounded-xl border-2 bg-slate-50 ${errors.otp ? 'border-red-300' : 'border-slate-200 focus-within:border-teal-500'}`}>
              <input
                type="text"
                value={otp}
                onChange={e => { setOtp(toDigits(e.target.value).slice(0, 4)); clearError('otp'); }}
                placeholder="Enter 4-digit code"
                inputMode="numeric"
                maxLength={4}
                className="w-full bg-transparent px-4 py-3.5 focus:outline-none text-slate-800 tracking-[0.15em]"
                style={{ fontSize: '0.95rem', fontWeight: 600 }}
              />
            </div>
            {errors.otp && <p className="text-red-600 text-xs mt-1.5">{errors.otp}</p>}

            <button
              type="button"
              onClick={resendOtpCode}
              disabled={resendCountdown > 0}
              className="mt-3 text-teal-700 disabled:text-slate-400"
              style={{ fontSize: '0.79rem', fontWeight: 600 }}
            >
              {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend code'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-center text-xl font-bold text-slate-900 mb-4">
              Organization Owner Account
            </h2>
            <input
              ref={ownerPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleOwnerPhotoChange}
              className="hidden"
            />

            <div className="flex justify-center mb-6">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => ownerPhotoInputRef.current?.click()}
                  className="w-56 h-56 rounded-full border-4 border-red-500 bg-slate-300 overflow-hidden flex items-center justify-center"
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
                  className="absolute bottom-3 right-0 w-14 h-14 rounded-full border-2 border-black bg-white flex items-center justify-center"
                >
                  <Camera size={24} className="text-black" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-600 mb-1.5" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={e => { setOwnerName(e.target.value); clearError('ownerName'); }}
                  placeholder="e.g. Ahmed Khan"
                  className={`w-full border-2 rounded-xl px-4 py-3.5 bg-slate-50 focus:outline-none ${errors.ownerName ? 'border-red-300' : 'border-slate-200 focus:border-teal-500'}`}
                />
                {errors.ownerName && <p className="text-red-600 text-xs mt-1">{errors.ownerName}</p>}
              </div>
              <div>
                <label className="block text-slate-600 mb-1.5" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email</label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={e => { setOwnerEmail(e.target.value); clearError('ownerEmail'); }}
                  placeholder="owner@email.com"
                  className={`w-full border-2 rounded-xl px-4 py-3.5 bg-slate-50 focus:outline-none ${errors.ownerEmail ? 'border-red-300' : 'border-slate-200 focus:border-teal-500'}`}
                />
                {errors.ownerEmail && <p className="text-red-600 text-xs mt-1">{errors.ownerEmail}</p>}
              </div>
              <div>
                <label className="block text-slate-600 mb-1.5" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError('password'); }}
                  placeholder="Create password"
                  className={`w-full border-2 rounded-xl px-4 py-3.5 bg-slate-50 focus:outline-none ${errors.password ? 'border-red-300' : 'border-slate-200 focus:border-teal-500'}`}
                />
                {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-slate-600 mb-1.5" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
                  placeholder="Confirm password"
                  className={`w-full border-2 rounded-xl px-4 py-3.5 bg-slate-50 focus:outline-none ${errors.confirmPassword ? 'border-red-300' : 'border-slate-200 focus:border-teal-500'}`}
                />
                {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
              <CheckCircle2 size={15} className="text-emerald-700 mt-0.5" />
              <p className="text-emerald-700" style={{ fontSize: '0.76rem' }}>
                Next, you will complete organization registration details.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 p-5 border-t border-slate-200 bg-white">
        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 rounded-xl bg-teal-700 text-white font-semibold text-[0.95rem] hover:bg-teal-800 active:scale-[0.99] transition-all shadow-md shadow-teal-900/15"
          >
            {step === 1 ? 'Continue to Verification' : 'Verify and Continue'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleContinueToOrganization}
            className="w-full py-3.5 rounded-xl bg-teal-700 text-white font-semibold text-[0.95rem] hover:bg-teal-800 active:scale-[0.99] transition-all shadow-md shadow-teal-900/15"
          >
            Continue to Organization Registration
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate('/kitchen/login')}
          className="w-full mt-3 border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          style={{ fontSize: '0.82rem', fontWeight: 600 }}
        >
          Sign in now with phone number and password
        </button>
      </div>
    </MobileLayout>
  );
}
