import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';

const OTP_RESEND_SECONDS = 30;

export function VendorOTPVerificationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(OTP_RESEND_SECONDS);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get phone number from navigation state
  const phone = (location.state as any)?.phone || '+92 3888888888';

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timerId = window.setInterval(() => {
      setResendCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [resendCountdown]);

  const handleOtpChange = (index: number, value: string) => {
    // Only accept digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    // Auto-focus next field
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    try {
      // TODO: Add OTP verification API call here
      console.log('Verify OTP:', otpCode);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Navigate to organization registration
      navigate('/vendor/organization-register', { state: { phone } });
    } catch (err) {
      setError('Invalid OTP code');
      console.error('OTP verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (resendCountdown > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    setResendCountdown(OTP_RESEND_SECONDS);
    // TODO: Add resend OTP API call here
    console.log('Resend OTP to:', phone);
  };

  return (
    <MobileLayout>
      <div className="flex-1 overflow-y-auto bg-white flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-red-700 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-white sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold flex-1 text-center">P2P</h1>
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-8 w-full">
          <h2 className="text-3xl sm:text-4xl font-bold text-red-700 text-center mb-4 sm:mb-6">
            OTP Verification
          </h2>

          <p className="text-center text-gray-800 text-sm sm:text-base mb-8 sm:mb-10 max-w-2xl leading-relaxed">
            Enter the verification code we just sent to your{' '}
            <span className="font-semibold">{phone}</span>
          </p>

          {/* OTP Input Boxes */}
          <div className="flex gap-1 sm:gap-2 justify-center mb-6 sm:mb-8 w-full flex-wrap">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                placeholder=""
                inputMode="numeric"
                maxLength={1}
                className="w-10 h-10 sm:w-14 sm:h-16 md:w-14 md:h-20 border-2 border-gray-700 rounded-xl sm:rounded-2xl text-center text-xl sm:text-2xl md:text-3xl font-bold focus:outline-none focus:border-red-700 focus:bg-red-50 transition-colors"
              />
            ))}
          </div>

          {error && (
            <p className="text-red-600 text-xs sm:text-sm mb-4 text-center">{error}</p>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className={`w-full sm:w-80 py-3 sm:py-4 rounded-full font-bold text-white text-base sm:text-lg transition-all mb-4 sm:mb-6 ${
              isVerifying ? 'bg-red-500' : 'bg-red-700 hover:bg-red-800'
            }`}
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>

          {/* Resend Code */}
          <p className="text-center text-gray-700 text-sm sm:text-base">
            Didn't receive code?{' '}
            <button
              onClick={handleResend}
              disabled={resendCountdown > 0}
              className={`font-bold transition-colors ${
                resendCountdown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-red-700 hover:text-red-800'
              }`}
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend'}
            </button>
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
