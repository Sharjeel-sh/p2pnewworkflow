import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, ArrowLeft } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';

interface FormErrors {
  fullName?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export function VendorRegistrationScreen() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneInput = (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 10);
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = 'Full name is required';
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits) {
      nextErrors.phone = 'Phone number is required';
    } else if (phoneDigits.length !== 10) {
      nextErrors.phone = 'Phone number must be 10 digits';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Extract only digits from phone for API submission
      const phoneDigits = phone.replace(/\D/g, '');
      console.log('Register vendor:', { fullName, phone: phoneDigits, password });
      // Navigate to OTP verification with phone number
      navigate('/vendor/otp-verify', { 
        state: { 
          phone: `+92 ${phoneDigits}`,
          fullName,
          email: '',
        } 
      });
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <MobileLayout>
      <div className="flex-1 overflow-y-auto bg-white">
        {/* Header */}
        <div className="sticky top-0 bg-red-700 text-white px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-xl font-bold">P2P</h1>
          <div className="w-12" />
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <h2 className="text-3xl font-bold text-red-700 text-center mb-3">
            Restaurant Registration
          </h2>
          <p className="text-center text-gray-700 mb-8" style={{ fontSize: '1rem' }}>
            Complete the form below to sign up as a vendor!
          </p>

          <div className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label className="block text-gray-900 font-bold mb-2" style={{ fontSize: '0.95rem' }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearError('fullName');
                }}
                placeholder="Full Name"
                className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none transition-colors ${
                  errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-red-700'
                }`}
                style={{ fontSize: '0.95rem' }}
              />
              {errors.fullName && (
                <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-gray-900 font-bold mb-2" style={{ fontSize: '0.95rem' }}>
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(formatPhoneInput(e.target.value));
                  clearError('phone');
                }}
                placeholder="3001234567"
                inputMode="numeric"
                minLength={10}
                maxLength={10}
                className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none transition-colors ${
                  errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-red-700'
                }`}
                style={{ fontSize: '0.95rem' }}
              />
              <p className="text-gray-500 text-xs mt-1">Phone number must be 10 digits</p>
              {errors.phone && (
                <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-900 font-bold mb-2" style={{ fontSize: '0.95rem' }}>
                Password
              </label>
              <div className={`flex items-center px-4 py-3 rounded-2xl border-2 focus-within:border-red-700 transition-colors ${
                errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}>
                <Lock size={18} className="text-gray-400 flex-shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError('password');
                  }}
                  placeholder="Password"
                  className="flex-1 ml-3 bg-transparent focus:outline-none"
                  style={{ fontSize: '0.95rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-red-600 font-semibold text-sm hover:text-red-700 flex-shrink-0"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-gray-900 font-bold mb-2" style={{ fontSize: '0.95rem' }}>
                Confirm Password
              </label>
              <div className={`flex items-center px-4 py-3 rounded-2xl border-2 focus-within:border-red-700 transition-colors ${
                errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}>
                <Lock size={18} className="text-gray-400 flex-shrink-0" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError('confirmPassword');
                  }}
                  placeholder="Confirm Password"
                  className="flex-1 ml-3 bg-transparent focus:outline-none"
                  style={{ fontSize: '0.95rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-red-600 font-semibold text-sm hover:text-red-700 flex-shrink-0"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Register Button */}
      <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-gray-200">
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className={`w-full py-4 rounded-full font-bold text-white text-lg transition-all active:scale-95 ${
            isLoading ? 'bg-red-500' : 'bg-red-700 hover:bg-red-800'
          }`}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-center mt-4" style={{ fontSize: '0.95rem' }}>
          Already have an account?{' '}
          <button
            onClick={() => navigate('/vendor/login')}
            className="text-red-700 font-bold hover:text-red-800"
          >
            Sign In
          </button>
        </p>
      </div>
    </MobileLayout>
  );
}
