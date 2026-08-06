import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { z } from 'zod';
import DocumentPreviewModal from '../../components/DocumentPreviewModal';
import { UserPlus, Mail, Lock, User, Phone, Loader2, Eye , CheckCircle2, FileUp, Camera, Crop as CropIcon, X, Printer, ArrowLeft } from 'lucide-react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


const applicantSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  profilePicture: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, "You must accept the terms and privacy policy"),
});

export default function ApplicantRegisterPage() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('applicantFormData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      firstName: '',
      middleName: '',
      lastName: '',
      phone: '',
      email: '',
      username: '',
      password: '',
      profilePicture: '',
      termsAccepted: false,
    };
  });

  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{url: string, title: string} | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Profile Picture Crop States
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setIsCropModalOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      ctx.save();
      ctx.translate(-cropX, -cropY);
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight
      );
      ctx.restore();

      const base64Image = canvas.toDataURL('image/jpeg');
      setFormData({ ...formData, profilePicture: base64Image });
      setIsCropModalOpen(false);
    }
  };

  const { signUp } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();

  const handleSaveDraft = () => {
    localStorage.setItem('applicantFormData', JSON.stringify(formData));
    notify({
      title: 'Draft Saved',
      message: 'Your registration progress has been saved locally.',
      type: 'success',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormErrors({});

    try {
      applicantSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.issues?.forEach((e) => {
          if (e.path[0]) {
            errors[e.path[0].toString()] = e.message;
          }
        });
        setFormErrors(errors);
        setError('Please fix the validation errors below.');
        notify({
          title: 'Validation Error',
          message: 'Please fix the highlighted fields in the form.',
          type: 'error',
        });
        return;
      }
    }

    if (!isReviewMode) {
      setIsReviewMode(true);
      return;
    }

    setIsLoading(true);

    try {
      await signUp(formData);
      localStorage.removeItem('applicantFormData');
      notify({
        title: 'Registration Successful',
        message: 'Your applicant account has been created successfully.',
        type: 'success',
      });
      navigate('/dashboard/application', { replace: true });
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      notify({
        title: 'Registration Failed',
        message: errorMessage,
        type: 'error',
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <Link to="/" className="flex justify-center items-center gap-3 mb-6">
          <img src="https://i.ibb.co/4Zh1jQWL/SMART-COLL-OF-TECH-LOGO.jpg" alt="Smart Global Logo" className="w-36 h-36 object-contain" />
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-emerald-900 leading-none">SMART GLOBAL</span>
            <span className="text-[10px] text-purple-600 tracking-[0.2em] font-bold uppercase">College of Technology</span>
          </div>
        </Link>
        <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
          {isReviewMode ? 'Review Your Information' : 'Create Applicant Account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {isReviewMode ? 'Please verify your details before submitting' : 'Begin your journey with Smart Global University'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-emerald-900/5 sm:rounded-3xl sm:px-10 border border-slate-100">
          {isReviewMode ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <button
                  type="button"
                  onClick={() => setIsReviewMode(false)}
                  className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </div>

              <div id="print-area" className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center">
                    {formData.profilePicture ? (
                      <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                    <p className="text-slate-900 font-medium">{formData.firstName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Middle Name</label>
                    <p className="text-slate-900 font-medium">{formData.middleName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                    <p className="text-slate-900 font-medium">{formData.lastName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <p className="text-slate-900 font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <p className="text-slate-900 font-medium">{formData.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                    <p className="text-slate-900 font-medium">{formData.username}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-200 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-purple-700 hover:opacity-90 transition-opacity uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Confirm & Submit Application'
                  )}
                </button>
              </div>
            </div>
          ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            
            <div className="flex flex-col items-center mb-6">
              <div className="relative group cursor-pointer">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 bg-slate-100 flex items-center justify-center ${formErrors.profilePicture ? 'border-red-300' : 'border-emerald-100'}`}>
                  {formData.profilePicture ? (
                    <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs font-bold">Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleSelectImage}
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">Profile Picture (Optional)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={`w-full p-3 border rounded-xl focus:ring-2 font-medium ${formErrors.firstName ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'}`}
                  placeholder="First Name"
                />
                {formErrors.firstName && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                  className={`w-full p-3 border rounded-xl focus:ring-2 font-medium ${formErrors.middleName ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'}`}
                  placeholder="Middle Name (Optional)"
                />
                {formErrors.middleName && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.middleName}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Surname</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={`w-full p-3 border rounded-xl focus:ring-2 font-medium ${formErrors.lastName ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'}`}
                  placeholder="Surname"
                />
                {formErrors.lastName && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full p-3 border rounded-xl focus:ring-2 font-medium ${formErrors.phone ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'}`}
                  placeholder="Phone Number"
                />
                {formErrors.phone && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Username</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className={`w-full p-3 border rounded-xl focus:ring-2 font-medium ${formErrors.username ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'}`}
                placeholder="Choose a username"
              />
              {formErrors.username && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.username}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full p-3 border rounded-xl focus:ring-2 font-medium ${formErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'}`}
                placeholder="email@example.com"
              />
              {formErrors.email && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={`w-full p-3 border rounded-xl focus:ring-2 font-medium ${formErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'}`}
                placeholder="••••••••"
              />
              {formErrors.password && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.password}</p>}
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                  className="w-5 h-5 border-slate-300 rounded text-emerald-600 focus:ring-emerald-600"
                />
              </div>
              <div className="text-sm">
                <label htmlFor="terms" className="font-medium text-slate-700">
                  I accept the <button type="button" onClick={() => setIsPrivacyModalOpen(true)} className="text-emerald-600 hover:text-emerald-500 hover:underline">Terms of Service and Privacy Policy</button>
                </label>
                {formErrors.termsAccepted && <p className="text-red-500 text-xs font-medium mt-1">{formErrors.termsAccepted}</p>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="w-full sm:w-1/3 flex items-center justify-center gap-2 py-4 px-4 border-2 border-emerald-600 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Draft
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-2/3 flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-200 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-purple-700 hover:opacity-90 transition-opacity uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account? <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-500 hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
      
      <DocumentPreviewModal
 
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documentUrl={previewDoc?.url || ''}
        title={previewDoc?.title || ''}
      />

      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900">Privacy Policy</h3>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="prose prose-slate prose-sm max-w-none">
                <h4>1. Introduction</h4>
                <p>Smart Global University respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our application portal.</p>
                <h4>2. The data we collect about you</h4>
                <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                <ul>
                  <li><strong>Identity Data</strong> includes first name, maiden name, last name, username or similar identifier, marital status, title, date of birth and gender.</li>
                  <li><strong>Contact Data</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                  <li><strong>Academic Data</strong> includes your academic transcripts, previous schools attended, and grades.</li>
                </ul>
                <h4>3. How we use your personal data</h4>
                <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                <ul>
                  <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g. processing your application).</li>
                  <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                  <li>Where we need to comply with a legal obligation.</li>
                </ul>
                <h4>4. Data security</h4>
                <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed.</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setIsPrivacyModalOpen(false)}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isCropModalOpen && !!imgSrc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CropIcon className="w-5 h-5 text-emerald-600" />
                Crop Profile Picture
              </h3>
              <button onClick={() => setIsCropModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex items-center justify-center bg-slate-100">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-[50vh]"
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop me"
                  style={{ maxHeight: '50vh', width: 'auto' }}
                  onLoad={(e) => {
                    const { naturalWidth, naturalHeight } = e.currentTarget;
                    const minDim = Math.min(naturalWidth, naturalHeight);
                    const defaultCrop: PixelCrop = {
                      unit: 'px',
                      width: minDim,
                      height: minDim,
                      x: (naturalWidth - minDim) / 2,
                      y: (naturalHeight - minDim) / 2
                    };
                    setCrop(defaultCrop);
                    setCompletedCrop(defaultCrop);
                  }}
                />
              </ReactCrop>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setIsCropModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCropComplete}
                className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Apply Crop
              </button>
            </div>
            {/* Hidden canvas for image generation */}
            {!!completedCrop && (
              <canvas
                ref={previewCanvasRef}
                style={{
                  display: 'none',
                  width: completedCrop.width,
                  height: completedCrop.height,
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
