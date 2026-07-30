'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TechOrbitDisplay, Ripple, Input, Label } from '@/features/auth/components/modern-animated-sign-in';
import { ButtonGlow } from '@/components/ui/ButtonGlow';
import Link from 'next/link';
import { Eye, EyeOff, Wand2 } from 'lucide-react';

const DOMAIN_OPTIONS = ['Real Estate', 'EdTech', 'Automobile'];
const COMPANY_SIZE_OPTIONS = ['1–10', '11–50', '51–200', '201–500', '500+'];
const CALL_VOLUME_OPTIONS = ['Less than 500', '500–2,000', '2,000–10,000', 'More than 10,000'];
const USE_CASE_OPTIONS = ['Lead Qualification', 'Appointment Booking', 'Customer Support', 'Admission Counselling', 'Property Sales', 'Vehicle Sales', 'Follow-up Calls', 'Other'];

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [agreedTOS, setAgreedTOS] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isVerified = searchParams.get('verified') === 'true';
  const [userEmail, setUserEmail] = useState('');
  const [userFullName, setUserFullName] = useState('');

  useEffect(() => {
    if (isVerified) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) setUserEmail(data.user.email);
        if (data.user?.user_metadata?.full_name) {
          setUserFullName(data.user.user_metadata.full_name);
          const nameInput = document.getElementById('full_name') as HTMLInputElement;
          if (nameInput) nameInput.value = data.user.user_metadata.full_name;
        }
      });
    }
  }, [isVerified, supabase]);

  const generateStrongPassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];
    for (let i = password.length; i < length; ++i) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    const result = password.split('').sort(() => 0.5 - Math.random()).join('');
    const passInput = document.getElementById('password') as HTMLInputElement;
    const confirmInput = document.getElementById('confirm_password') as HTMLInputElement;
    if (passInput) passInput.value = result;
    if (confirmInput) confirmInput.value = result;
    setShowPassword(true);
  };

  const handleGoogleVerify = async () => {
    setServerError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback?next=${encodeURIComponent('/register?verified=true')}`,
      },
    });
    if (error) {
      setServerError(error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    if (!agreedTOS || !agreedPrivacy) {
      setServerError('You must agree to both the Terms of Service and Privacy Policy.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string || userEmail;
    const fullName = formData.get('full_name') as string;
    const organizationName = formData.get('organization_name') as string;

    const businessProfile = {
      business_domain: formData.get('business_domain') as string,
      company_website: formData.get('company_website') as string,
      business_contact_number: formData.get('business_contact_number') as string,
      country: formData.get('country') as string,
      state_province: formData.get('state_province') as string,
      city: formData.get('city') as string,
      timezone: formData.get('timezone') as string,
      company_size: formData.get('company_size') as string,
      monthly_call_volume: formData.get('monthly_call_volume') as string,
      primary_use_case: formData.get('primary_use_case') as string,
      business_description: formData.get('business_description') as string,
      additional_requirements: formData.get('additional_requirements') as string,
    };

    if (isVerified) {
      setLoading(true);
      const { createOrgAndProfile } = await import('./actions');
      const result = await createOrgAndProfile(fullName, organizationName, businessProfile);
      setLoading(false);
      if (result.error) {
        setServerError(result.error);
        return;
      }
      router.push('/pending-approval');
      return;
    }

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password !== confirmPassword) {
      setServerError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setServerError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization_name: organizationName,
          business_profile: businessProfile
        },
        emailRedirectTo: `${window.location.origin}/pending-approval`,
      },
    });
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    // For email/password signups with email confirmations enabled, they might need to verify their email.
    // However, they can also go directly to the pending approval page if the app handles it.
    router.push('/pending-approval');
  };

  return (
    <div className="flex w-full h-screen bg-black text-white relative overflow-hidden selection:bg-orange-500/30">
      <div className="z-10 flex w-full h-screen items-stretch justify-center overflow-hidden">
        {/* Left Side: Tech Orbit Display */}
        <div className="hidden lg:flex w-1/2 h-screen relative justify-center items-center overflow-hidden bg-zinc-950 border-r border-zinc-900">
          <Ripple />
          <TechOrbitDisplay iconsArray={[]} text="KantaSwara" />
        </div>

        {/* Right Side: Auth Form */}
        <div className="w-full lg:w-1/2 h-screen flex justify-center p-6 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-2xl relative z-20 py-8">

            <div className="mb-8">
              <h2 className="font-bold text-3xl text-zinc-100">Register as an organization</h2>
              <p className="text-zinc-400 text-sm max-w-xl mt-2">
                Register your organization to start using KantaSwara's enterprise AI Voice agents. Our team will review your application.
              </p>
              {isVerified && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Email verified with Google
                  </div>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push('/register');
                    }}
                    className="text-xs text-red-500 hover:text-red-400 underline decoration-red-900 hover:decoration-red-400 underline-offset-4 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-12">

              {/* SECTION 1: Account Information */}
              <div className="space-y-6 bg-zinc-900/40 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">1. Account Information</h3>

                {!isVerified && (
                  <div className="pb-2">
                    <button
                      type="button"
                      onClick={handleGoogleVerify}
                      className="w-full py-2.5 flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-md transition-colors shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </button>
                    <div className="flex items-center gap-4 mt-6 mb-2">
                      <div className="h-px bg-zinc-800 flex-1"></div>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider">Or register with email</span>
                      <div className="h-px bg-zinc-800 flex-1"></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-zinc-300">Contact Person (Full Name) <span className="text-red-500">*</span></Label>
                    <Input id="full_name" name="full_name" type="text" placeholder="Jane Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-300">Work Email <span className="text-red-500">*</span></Label>
                    <Input id="email" name="email" type="email" placeholder="name@company.com" required={!isVerified} disabled={isVerified} defaultValue={isVerified ? userEmail : undefined} />
                  </div>
                </div>

                {!isVerified && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-zinc-300">Password <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2 text-sm">
                          <button type="button" onClick={generateStrongPassword} className="text-zinc-500 hover:text-zinc-300"><Wand2 className="h-4 w-4" /></button>
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-zinc-500 hover:text-zinc-300">
                            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password" className="text-zinc-300">Confirm Password <span className="text-red-500">*</span></Label>
                      <Input id="confirm_password" name="confirm_password" type={showPassword ? "text" : "password"} placeholder="••••••••" required />
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: Organization Information */}
              <div className="space-y-6 bg-zinc-900/40 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">2. Organization Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organization_name" className="text-zinc-300">Organization Name <span className="text-red-500">*</span></Label>
                    <Input id="organization_name" name="organization_name" type="text" placeholder="Voice Corp" required />
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="business_domain" className="text-zinc-300 mb-1">Business Domain <span className="text-red-500">*</span></Label>
                    <select id="business_domain" name="business_domain" required className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="">Select Domain...</option>
                      {DOMAIN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_website" className="text-zinc-300">Company Website</Label>
                    <Input id="company_website" name="company_website" type="url" placeholder="https://example.in" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_contact_number" className="text-zinc-300">Business Contact Number <span className="text-red-500">*</span></Label>
                    <Input id="business_contact_number" name="business_contact_number" type="tel" placeholder="+91 98765 43210" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-zinc-300">Country <span className="text-red-500">*</span></Label>
                    <Input id="country" name="country" type="text" placeholder="India" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state_province" className="text-zinc-300">State / Province</Label>
                    <Input id="state_province" name="state_province" type="text" placeholder="Karnataka" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-zinc-300">City</Label>
                    <Input id="city" name="city" type="text" placeholder="Bangalore" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-zinc-300">Timezone <span className="text-red-500">*</span></Label>
                    <Input id="timezone" name="timezone" type="text" placeholder="IST (UTC+5:30)" required />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Business Profile */}
              <div className="space-y-6 bg-zinc-900/40 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">3. Business Profile</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="company_size" className="text-zinc-300 mb-1">Company Size <span className="text-red-500">*</span></Label>
                    <select id="company_size" name="company_size" required className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500">
                      <option value="">Select Size...</option>
                      {COMPANY_SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="monthly_call_volume" className="text-zinc-300 mb-1">Estimated Monthly Call Volume <span className="text-red-500">*</span></Label>
                    <select id="monthly_call_volume" name="monthly_call_volume" required className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500">
                      <option value="">Select Volume...</option>
                      {CALL_VOLUME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4: AI Voice Requirements */}
              <div className="space-y-6 bg-zinc-900/40 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-semibold text-white border-b border-zinc-800 pb-2">4. AI Voice Requirements</h3>

                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="primary_use_case" className="text-zinc-300 mb-1">Primary Use Case <span className="text-red-500">*</span></Label>
                  <select id="primary_use_case" name="primary_use_case" required className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500">
                    <option value="">Select Use Case...</option>
                    {USE_CASE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_description" className="text-zinc-300">Business Description</Label>
                  <textarea
                    id="business_description"
                    name="business_description"
                    rows={3}
                    placeholder="Short description of the organization and how AI Voice will be used."
                    className="flex w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional_requirements" className="text-zinc-300">Additional Requirements (Optional)</Label>
                  <textarea
                    id="additional_requirements"
                    name="additional_requirements"
                    rows={3}
                    placeholder="Any specific integrations, compliances, or customized workflows you need?"
                    className="flex w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 resize-none"
                  />
                </div>
              </div>

              {/* SECTION 5: Legal */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="tos" checked={agreedTOS} onChange={(e) => setAgreedTOS(e.target.checked)} className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500 focus:ring-offset-black cursor-pointer" />
                  <Label htmlFor="tos" className="text-sm text-zinc-400 font-normal leading-relaxed cursor-pointer">
                    I agree to the <Link href="/terms" className="text-[#ff6600] hover:underline">Terms of Service</Link>. <span className="text-red-500">*</span>
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" id="privacy" checked={agreedPrivacy} onChange={(e) => setAgreedPrivacy(e.target.checked)} className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500 focus:ring-offset-black cursor-pointer" />
                  <Label htmlFor="privacy" className="text-sm text-zinc-400 font-normal leading-relaxed cursor-pointer">
                    I agree to the <Link href="/privacy" className="text-[#ff6600] hover:underline">Privacy Policy</Link>. <span className="text-red-500">*</span>
                  </Label>
                </div>
              </div>

              {serverError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-md">
                  {serverError}
                </div>
              )}

              <ButtonGlow type="submit" disabled={!agreedTOS || !agreedPrivacy || loading} className="mt-4 w-full" showArrow={false}>
                {loading ? 'Submitting Registration...' : 'Submit Application'}
              </ButtonGlow>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-[#ff6600] hover:underline">
                  Already have an account? Sign In
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
