import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Camera, CheckCircle2 } from 'lucide-react';
import { MobileLayout } from '../shared/MobileLayout';
import { useApp } from '../../context/AppContext';
import type { OrgType } from '../../context/AppContext';

export function VendorUploadDocumentsScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { registerOrganization, setCurrentUser } = useApp();

  const state = location.state as any;
  const [businessDocument, setBusinessDocument] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBusinessDocument(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      // TODO: Submit all registration data to backend
      console.log('Complete registration with:', {
        ...state,
        businessDocument,
      });

      // Show success screen
      setSuccess(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToDashboard = () => {
    // Vendor flow currently works locally (no backend).
    // Create an org in app state and sign in, so kitchen screens have org context.
    const formData = state?.formData as
      | { name?: string; organizationType?: 'HomeShef' | 'Restaurant' | ''; email?: string; phone?: string; cnic?: string; address?: string }
      | undefined;

    const ownerName = (state?.fullName as string | undefined) || 'Vendor';
    const orgName = formData?.name?.trim() || 'New Organization';
    const ownerEmail = formData?.email?.trim() || undefined;
    const phone = (formData?.phone || state?.phone || '').trim();
    const address = formData?.address?.trim() || '';
    const cnic = formData?.cnic?.trim() || undefined;

    const type: OrgType =
      formData?.organizationType === 'HomeShef' ? 'homemade' : 'restaurant';

    const org = registerOrganization({
      ownerName,
      ownerEmail,
      ownerPassword: (state?.password as string | undefined)?.trim() || undefined,
      orgName,
      phone,
      address,
      type,
      verificationStatus: 'pending',
      cnic,
      // Save uploaded images/docs (base64) so they can be previewed later if needed
      cnicFrontPhoto: state?.cnicFront || undefined,
      cnicBackPhoto: state?.cnicBack || undefined,
      legalAgreementDoc: businessDocument || undefined,
      profilePicture: state?.orgImage || undefined,
      notificationsEnabled: true,
      verified: undefined,
    });

    setCurrentUser({ role: 'kitchen', orgId: org.id });
    navigate('/kitchen');
  };

  return (
    <MobileLayout>
      {/* Success State */}
      {success ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <CheckCircle2 size={48} className="text-green-600" />
          </div>
          <div className="text-center">
            <h2 className="text-stone-800 mb-2" style={{ fontWeight: 700, fontSize: '1.3rem' }}>
              Registration Successful!
            </h2>
            <p className="text-stone-500" style={{ fontSize: '0.87rem' }}>
              Your vendor registration has been submitted successfully.
            </p>
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <p className="text-amber-700" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Verification: Pending
              </p>
              <p className="text-amber-600 mt-0.5" style={{ fontSize: '0.75rem' }}>
                Your documents have been submitted for verification.
              </p>
            </div>
            <p className="text-stone-400 mt-2" style={{ fontSize: '0.76rem' }}>
              Next step: Continue to your vendor dashboard.
            </p>
          </div>
          <div className="w-full mt-3">
            <button
              onClick={handleContinueToDashboard}
              className="w-full bg-red-700 text-white py-3 rounded-xl hover:bg-red-800 transition-colors"
              style={{ fontWeight: 700, fontSize: '0.9rem' }}
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
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
            Upload Business Document Images
          </h2>
          <p className="text-center text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
            Business document is optional. If you want to upload, you can, otherwise register the organization.
          </p>

          <div className="space-y-6 sm:space-y-8">
            {/* Business Document */}
            <div>
              <label className="block text-gray-900 font-bold mb-3 text-sm sm:text-base">
                Business Document
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 sm:p-8 rounded-2xl border-2 border-dashed border-gray-300 hover:border-red-400 hover:bg-gray-50 transition-colors"
              >
                {businessDocument ? (
                  <img src={businessDocument} alt="Business Document" className="w-full h-auto rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8">
                    <Camera size={40} className="text-gray-400 mb-2 sm:mb-3" />
                    <p className="text-gray-500 text-sm sm:text-base">Select Photo</p>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="sticky bottom-0 px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-200">
        <button
          onClick={handleRegister}
          disabled={isLoading}
          className={`w-full py-3 sm:py-4 rounded-full font-bold text-white text-base sm:text-lg transition-all ${
            isLoading ? 'bg-red-500' : 'bg-red-700 hover:bg-red-800'
          }`}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </div>
        </>
      )}
    </MobileLayout>
  );
}
