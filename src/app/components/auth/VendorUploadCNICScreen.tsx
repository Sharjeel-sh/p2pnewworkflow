import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Camera } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';

export function VendorUploadCNICScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);

  const state = location.state as any;
  const [cnicFront, setCnicFront] = useState('');
  const [cnicBack, setCnicBack] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (type: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'front') {
        setCnicFront(reader.result as string);
        setErrors(prev => ({ ...prev, front: '' }));
      } else {
        setCnicBack(reader.result as string);
        setErrors(prev => ({ ...prev, back: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const validateImages = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!cnicFront) {
      nextErrors.front = 'CNIC front image is required';
    }

    if (!cnicBack) {
      nextErrors.back = 'CNIC back image is required';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateImages()) return;

    setIsLoading(true);
    try {
      navigate('/vendor/upload-documents', {
        state: {
          ...state,
          cnicFront,
          cnicBack,
        },
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
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
            Upload CNIC Images
          </h2>
          <p className="text-center text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
            Please upload the front and back images of your CNIC.
          </p>

          <div className="space-y-6 sm:space-y-8">
            {/* CNIC Front */}
            <div>
              <label className="block text-gray-900 font-bold mb-3 text-sm sm:text-base">
                CNIC front<span className="text-red-600">*</span>
              </label>
              <input
                ref={fileInputFrontRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('front', e)}
                className="hidden"
              />
              <button
                onClick={() => fileInputFrontRef.current?.click()}
                className={`w-full p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-colors ${
                  errors.front ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
                }`}
              >
                {cnicFront ? (
                  <img src={cnicFront} alt="CNIC Front" className="w-full h-auto rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                    <Camera size={40} className="text-gray-400 mb-2 sm:mb-3" />
                    <p className="text-gray-500 text-sm sm:text-base">Select Photo</p>
                  </div>
                )}
              </button>
              {errors.front && <p className="text-red-600 text-xs mt-1">{errors.front}</p>}
            </div>

            {/* CNIC Back */}
            <div>
              <label className="block text-gray-900 font-bold mb-3 text-sm sm:text-base">
                CNIC back<span className="text-red-600">*</span>
              </label>
              <input
                ref={fileInputBackRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload('back', e)}
                className="hidden"
              />
              <button
                onClick={() => fileInputBackRef.current?.click()}
                className={`w-full p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-colors ${
                  errors.back ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
                }`}
              >
                {cnicBack ? (
                  <img src={cnicBack} alt="CNIC Back" className="w-full h-auto rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                    <Camera size={40} className="text-gray-400 mb-2 sm:mb-3" />
                    <p className="text-gray-500 text-sm sm:text-base">Select Photo</p>
                  </div>
                )}
              </button>
              {errors.back && <p className="text-red-600 text-xs mt-1">{errors.back}</p>}
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
