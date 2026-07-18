import { useState } from 'react';
import { authService } from '../lib/firebase';
import { TargetExam } from '../types';
import { motion } from 'motion/react';
import { Shield, Sparkles, User, Mail, Lock, AlertCircle, Compass } from 'lucide-react';

interface AuthPageProps {
  onSuccess: (uid: string, email: string) => void;
  onBack: () => void;
}

export default function AuthPage({ onSuccess, onBack }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [targetExam, setTargetExam] = useState<TargetExam>('CSS');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password, companion!");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const user = await authService.signUp(email, password, name, targetExam);
        onSuccess(user.uid, user.email);
      } else {
        const user = await authService.signIn(email, password);
        onSuccess(user.uid, user.email);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      // Friendly, encouraging error messaging
      setError(err?.message || "Something went wrong. Let's double check your details and try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#FDFCF9] py-12 relative overflow-hidden">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 text-xs text-[#5C5A55] hover:text-[#4D7C7A] font-medium flex items-center space-x-1.5 transition cursor-pointer"
      >
        <span>← Return to Home</span>
      </button>

      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-[#4D7C7A] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-[#FEF9E7] opacity-40 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-3xl border border-[#E9E5DB] p-8 shadow-xl relative z-10 space-y-6"
      >
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#4D7C7A] flex items-center justify-center text-[#FEF9E7] text-2xl mx-auto shadow-sm">
            <Compass className="w-6 h-6 text-[#FEF9E7]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#2D4F4D]">
            {isSignUp ? "Begin Your Aspirant Profile" : "Welcome Back, Aspirant!"}
          </h2>
          <p className="text-xs text-[#8C8A82]">
            {isSignUp 
              ? "Establish your custom profile to persist study tracks." 
              : "Access your dashboard and resume discussions with Study Buddy."}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-[#FEF9E7] border border-[#F9F0CE] text-[#9A7D0A] text-xs flex items-start space-x-2.5"
          >
            <AlertCircle className="w-4.5 h-4.5 text-[#B7950B] shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C5A55] block" htmlFor="name">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="e.g., Muhammad Ali"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FDFCF9] border border-[#E9E5DB] focus:outline-none focus:ring-1 focus:ring-[#4D7C7A] focus:border-[#4D7C7A] transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C5A55] block" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                id="email"
                type="email"
                required
                placeholder="aspirant@cssmentor.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FDFCF9] border border-[#E9E5DB] focus:outline-none focus:ring-1 focus:ring-[#4D7C7A] focus:border-[#4D7C7A] transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#5C5A55] block" htmlFor="password">
              Security Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FDFCF9] border border-[#E9E5DB] focus:outline-none focus:ring-1 focus:ring-[#4D7C7A] focus:border-[#4D7C7A] transition"
              />
            </div>
          </div>

          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#5C5A55] block">
                Target Commission Examination
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetExam('CSS')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    targetExam === 'CSS'
                      ? 'border-[#4D7C7A] bg-[#E8F1F0] text-[#2D4F4D]'
                      : 'border-[#E9E5DB] bg-white text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-sm font-bold tracking-wider">CSS</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-80">Federal Level</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetExam('PMS')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    targetExam === 'PMS'
                      ? 'border-[#4D7C7A] bg-[#E8F1F0] text-[#2D4F4D]'
                      : 'border-[#E9E5DB] bg-white text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-sm font-bold tracking-wider">PMS</span>
                  <span className="text-[9px] uppercase tracking-wider opacity-80">Provincial Level</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-medium bg-[#4D7C7A] text-[#FDFCF9] hover:bg-[#3B615F] disabled:bg-[#4D7C7A]/50 transition shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FEF9E7]" />
                <span>{isSignUp ? "Create My Profile" : "Authenticate Session"}</span>
              </>
            )}
          </button>
        </form>

        {/* Local Storage Mode Tip */}
        <div className="bg-[#FDFCF9] rounded-xl p-3 border border-[#E9E5DB] text-[10px] text-stone-500 leading-normal">
          <span className="font-semibold text-[#2D4F4D]">💡 Development Tip:</span> Any email address entered acts as a simulated student user profile. Inputting a non-existent email will automatically initialize a brand new study dashboard!
        </div>

        {/* Toggle Mode */}
        <div className="pt-4 border-t border-[#E9E5DB] text-center text-xs text-[#5C5A55]">
          {isSignUp ? (
            <p>
              Already have an aspirant account?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="text-[#4D7C7A] font-semibold hover:underline cursor-pointer"
              >
                Sign In Instead
              </button>
            </p>
          ) : (
            <p>
              New to CSS Mentor?{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="text-[#4D7C7A] font-semibold hover:underline cursor-pointer"
              >
                Create Account Profile
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
