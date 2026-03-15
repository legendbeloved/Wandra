import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/Button';
import { SupabaseService } from '../services/supabaseService';

interface AuthViewProps {
  onSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

export const AuthView = ({ onSuccess }: AuthViewProps) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        await SupabaseService.signIn(email, password);
        onSuccess();
      } else if (mode === 'signup') {
        await SupabaseService.signUp(email, password);
        setSuccess('Check your email for a confirmation link.');
      } else {
        await SupabaseService.resetPassword(email);
        setSuccess('Password reset email sent.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const titles = {
    login: { heading: 'Welcome back', sub: 'Your stories are waiting.' },
    signup: { heading: 'Begin your story', sub: 'Create an account and start wandering.' },
    forgot: { heading: 'Reset password', sub: 'We\'ll send you a reset link.' },
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-serif font-medium tracking-tight text-teal-400">Wandra</h1>
        <p className="text-sand-400 font-medium tracking-[0.3em] uppercase text-[10px] mt-2">
          Your journey, written for you
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-medium text-sand-100">{titles[mode].heading}</h2>
            <p className="text-sand-400 text-sm font-medium italic">{titles[mode].sub}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-sand-400 group-focus-within:text-teal-400 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all text-base font-medium placeholder:text-sand-400/50 text-sand-100"
                />
              </div>
            )}

            {mode !== 'forgot' && (
              <>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-sand-400 group-focus-within:text-teal-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all text-base font-medium placeholder:text-sand-400/50 text-sand-100"
                    required
                  />
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-sand-400 group-focus-within:text-teal-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-14 pr-14 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all text-base font-medium placeholder:text-sand-400/50 text-sand-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-5 flex items-center text-sand-400 hover:text-sand-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </>
            )}

            {mode === 'forgot' && (
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-sand-400 group-focus-within:text-teal-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all text-base font-medium placeholder:text-sand-400/50 text-sand-100"
                  required
                />
              </div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center font-medium bg-red-500/10 rounded-xl p-3 border border-red-500/20"
              >
                {error}
              </motion.p>
            )}

            {success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-teal-400 text-sm text-center font-medium bg-teal-500/10 rounded-xl p-3 border border-teal-500/20"
              >
                {success}
              </motion.p>
            )}

            <Button
              type="submit"
              className="w-full py-5 text-lg rounded-2xl gap-2"
              isLoading={isLoading}
              size="lg"
            >
              {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              {!isLoading && <ArrowRight size={20} />}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="space-y-4 text-center">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                  className="text-sand-400 text-xs font-bold uppercase tracking-widest hover:text-teal-400 transition-colors block mx-auto"
                >
                  Forgot Password?
                </button>
                <p className="text-sand-400 text-sm">
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                    className="text-teal-400 font-bold hover:text-teal-300 transition-colors"
                  >
                    Sign Up
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-sand-400 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className="text-teal-400 font-bold hover:text-teal-300 transition-colors"
                >
                  Sign In
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="text-teal-400 text-sm font-bold hover:text-teal-300 transition-colors"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
