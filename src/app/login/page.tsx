'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { user, login, verifyOtp, loading } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [screen, setScreen] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to /
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSubmitting(true);
    const success = await login(phone);
    setIsSubmitting(false);

    if (success) {
      setScreen(2);
    } else {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 4) {
      setError('OTP must be exactly 4 digits.');
      return;
    }

    setIsSubmitting(true);
    const success = await verifyOtp(phone, otp);
    setIsSubmitting(false);

    if (!success) {
      setError('Invalid OTP code. Use 1234 to log in.');
    }
  };

  const formatPhoneNumber = (num: string) => {
    if (num.length < 5) return num;
    return `XXXXX ${num.slice(-5)}`;
  };

  return (
    <div className="flex flex-col flex-1 bg-slate-50 justify-between p-6 h-full">
      {/* Top Graphic/Brand */}
      <div className="flex flex-col items-center mt-12 mb-6">
        <div className="w-16 h-16 bg-brand-deep rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-950/20 mb-4">
          <span className="text-white text-3xl font-black tracking-wider">आ</span>
        </div>
        <h1 className="text-3xl font-extrabold text-brand-deep tracking-tight">Aaspas</h1>
        <p className="text-slate-500 text-sm mt-1">Your Hyperlocal Community Network</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 transition-all duration-300">
          {screen === 1 ? (
            <div className="transition-opacity duration-300">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to your neighborhood</h2>
              <p className="text-slate-500 text-xs mb-6">
                Verify your mobile number to connect with neighbors, view local feeds, and join local groups.
              </p>

              <form onSubmit={handleGetOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 block">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 text-sm font-medium pr-1 border-r border-slate-200">+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10 digit number"
                      className="block w-full pl-14 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-800 font-medium"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting || phone.length !== 10}
                  className="w-full flex items-center justify-center gap-2 bg-brand-deep hover:bg-brand-accent text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-950/15 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending OTP...' : 'Get OTP'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          ) : (
            <div className="transition-opacity duration-300">
              <h2 className="text-xl font-bold text-slate-800 mb-1">Verify OTP</h2>
              <p className="text-slate-500 text-xs mb-6">
                OTP sent to <span className="font-semibold text-slate-700">+91 {formatPhoneNumber(phone)}</span>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 block">4-Digit Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="text-slate-400" size={16} />
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 4-digit OTP"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-800 tracking-[0.5em] text-center font-bold"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-brand-accent mt-1 block">💡 Enter 1234 to verify instantly</span>
                </div>

                {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScreen(1);
                      setError(null);
                    }}
                    className="w-1/3 border border-slate-200 text-slate-600 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || otp.length !== 4}
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-deep hover:bg-brand-accent text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-950/15 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                    <ShieldCheck size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[10px] text-slate-400 mb-2">
        By continuing, you agree to our Terms of Service & Privacy Policy.
      </div>
    </div>
  );
}
