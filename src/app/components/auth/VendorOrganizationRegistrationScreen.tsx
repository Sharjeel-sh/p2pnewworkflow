import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Camera } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';

interface FormData {
  name: string;
  organizationType: 'HomeShef' | 'Restaurant';
  email: string;
  phone: string;
  cnic: string;
  address: string;
}

interface FormErrors {
  name?: string;
  organizationType?: string;
  email?: string;
  phone?: string;
  cnic?: string;
  address?: string;
}

export function VendorOrganizationRegistrationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    organizationType: 'Restaurant',
    email: '',
    phone: '',
    cnic: '',
    address: '',
  });

  const [orgImage, setOrgImage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const phone = (location.state as any)?.phone || '';

  const formatCNIC = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '').slice(0, 13);
    
    // Format as XXXXX-XXXXXXX-X
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Organization name is required';
    }

    if (!formData.organizationType) {
      nextErrors.organizationType = 'Please select organization type';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    }

    if (!formData.cnic.trim()) {
      nextErrors.cnic = 'CNIC is required';
    } else if (!/^\d{5}-\d{7}-\d{1}$/.test(formData.cnic)) {
      nextErrors.cnic = 'Please enter valid CNIC format (e.g., 12345-1234567-1)';
    }

    if (!formData.address.trim()) {
      nextErrors.address = 'Address is required';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    return true;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setOrgImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Navigate to CNIC upload screen
      navigate('/vendor/upload-cnic', {
        state: {
          formData,
          orgImage,
          phone,
        },
      });
    } catch (error) {
      console.error('Error:', error);
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
        <div className="sticky top-0 bg-red-700 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold flex-1 text-center">P2P</h1>
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-red-700 text-center mb-2">
            Organization Registration
          </h2>
          <p className="text-center text-gray-600 text-sm sm:text-base mb-6">
            Complete the form below to register as an organization!
          </p>

          {/* Organization Image Upload */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              className="relative"
            >
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-red-700 bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors overflow-hidden">
                {orgImage ? (
                  <img src={orgImage} alt="Organization" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6h6m0 0v6m0-6h6" />
                  </svg>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  imageInputRef.current?.click();
                }}
                className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-red-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Camera size={18} className="text-red-700" />
              </button>
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 sm:space-y-5">
            {/* Name */}
            <div>
              <label className="block text-gray-900 font-bold mb-2 text-sm sm:text-base">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }));
                  clearError('name');
                }}
                placeholder="Enter organization name"
                className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:outline-none transition-colors text-sm sm:text-base ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-red-700'
                }`}
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Organization Type */}
            <div>
              <label className="block text-gray-900 font-bold mb-2 text-sm sm:text-base">Organization Type *</label>
              <div className="flex gap-3">
                {(['Restaurant', 'HomeShef'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, organizationType: type }));
                      clearError('organizationType');
                    }}
                    className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl border-2 transition-colors text-sm sm:text-base font-medium ${
                      formData.organizationType === type
                        ? 'border-red-700 bg-red-50 text-red-700'
                        : 'border-gray-300 text-gray-700 hover:border-red-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orgType"
                      value={type}
                      checked={formData.organizationType === type}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    {type}
                  </button>
                ))}
              </div>
              {errors.organizationType && <p className="text-red-600 text-xs mt-1">{errors.organizationType}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-900 font-bold mb-2 text-sm sm:text-base">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  clearError('email');
                }}
                placeholder="Enter your email"
                className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:outline-none transition-colors text-sm sm:text-base ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-red-700'
                }`}
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-900 font-bold mb-2 text-sm sm:text-base">Phone number *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, phone: e.target.value }));
                  clearError('phone');
                }}
                placeholder="3001234567"
                inputMode="numeric"
                maxLength={10}
                className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:outline-none transition-colors text-sm sm:text-base ${
                  errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-red-700'
                }`}
              />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* CNIC */}
            <div>
              <label className="block text-gray-900 font-bold mb-2 text-sm sm:text-base">CNIC *</label>
              <input
                type="text"
                value={formData.cnic}
                onChange={(e) => {
                  const formatted = formatCNIC(e.target.value);
                  setFormData(prev => ({ ...prev, cnic: formatted }));
                  clearError('cnic');
                }}
                placeholder="e.g., 12345-1234567-1"
                className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:outline-none transition-colors text-sm sm:text-base ${
                  errors.cnic ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-red-700'
                }`}
              />
              {errors.cnic && <p className="text-red-600 text-xs mt-1">{errors.cnic}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-900 font-bold mb-2 text-sm sm:text-base">Address *</label>
              <textarea
                value={formData.address}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, address: e.target.value }));
                  clearError('address');
                }}
                placeholder="Enter your address"
                rows={3}
                className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border-2 focus:outline-none transition-colors text-sm sm:text-base resize-none ${
                  errors.address ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-red-700'
                }`}
              />
              {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="sticky bottom-0 px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-200">
        <button
          onClick={handleNext}
          disabled={isLoading}
          className={`w-full py-3 sm:py-4 rounded-full font-bold text-white text-base sm:text-lg transition-all ${
            isLoading ? 'bg-red-500' : 'bg-red-700 hover:bg-red-800'
          }`}
        >
          {isLoading ? 'Loading...' : 'Next'}
        </button>
      </div>
    </MobileLayout>
  );
}
