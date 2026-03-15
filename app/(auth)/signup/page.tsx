"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseService";
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle2 } from "lucide-react";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms of Service.",
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const passwordValue = watch("password", "");

  // Strength calculation
  const getStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, text: "", color: "bg-white/10" };
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score < 2) return { score: 1, text: "Weak", color: "bg-[#C0392B]" };
    if (score < 4) return { score: 2, text: "Fair", color: "bg-[#F59E0B]" };
    return { score: 3, text: "Strong", color: "bg-[#2E7D4F]" };
  };

  const strengthInfo = getStrength(passwordValue);

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          }
        }
      });

      if (authError) {
        setErrorMsg(authError.message);
        return;
      }
      
      // Auto-create profile record in supabase if signUp config wasn't enough
      if (authData.user) {
         await supabase.from("profiles").upsert({
            id: authData.user.id,
            display_name: data.fullName,
            onboarded: false,
            created_at: new Date().toISOString()
         });
         
         router.push("/onboarding");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to signup with Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#0B3D4A_0%,#1A6B7C_35%,#C4622D_70%,#E47832_100%)] flex">
      {/* ─── LEFT PANEL (Hidden on Mobile) ─── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden flex-col justify-between p-12">
        <div className="relative z-10 flex items-center gap-2">
          <span className="text-3xl">🧭</span>
          <span className="font-serif italic font-semibold text-2xl text-sand-50 tracking-wide">
            Wandra
          </span>
        </div>
        
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-[#041E27] to-transparent" />
          <svg className="absolute bottom-0 w-[150%] h-[50%] -left-[10%] opacity-40 text-[#062C38]" preserveAspectRatio="none" viewBox="0 0 1000 300" fill="currentColor">
            <path d="M0,300 L1000,300 L1000,100 Q800,200 500,50 Q200,-100 0,200 Z" />
          </svg>
          <svg className="absolute bottom-[-10%] w-[120%] h-[40%] text-[#041E27] opacity-80" preserveAspectRatio="none" viewBox="0 0 1000 300" fill="currentColor">
            <path d="M0,300 L1000,300 L1000,180 Q750,50 300,150 Q100,200 0,100 Z" />
          </svg>
          <div className="absolute top-[30%] left-[60%] w-64 h-64 rounded-full bg-[#FBBF24] blur-[100px] opacity-40 mix-blend-screen" />
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h2 className="font-serif italic text-5xl text-sand-50 mb-6 leading-[1.1]">
            A world worth capturing.
          </h2>
          <p className="text-sand-200 text-lg leading-relaxed">
            Join thousands of travelers documenting their adventures automatically and reliving them through beautiful storytelling.
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL: AUTH FORM ─── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <span className="text-3xl">🧭</span>
            <span className="font-serif italic font-semibold text-3xl text-sand-50 tracking-wide">
              Wandra
            </span>
          </div>

          <div className="rounded-[2rem] bg-white/[0.04] border border-white/[0.08] backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.32)] p-8 md:p-10">
            <div className="mb-6">
              <h1 className="font-serif text-[32px] font-medium text-sand-50 mb-2 leading-tight">
                Start your story.
              </h1>
              <p className="text-sand-300">Create an account to begin tracking your journeys.</p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] text-sm font-medium flex items-center gap-2">
                <span className="flex-shrink-0">⚠️</span>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-1.5 ">
                <label className="text-[13px] font-medium text-sand-200 tracking-[0.02em] ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sand-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    {...register("fullName")}
                    type="text"
                    placeholder="Jane Doe"
                    autoComplete="name"
                    className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-4 text-sand-50 placeholder:text-sand-500/50 focus:border-[#C4622D] focus:bg-white/[0.08] focus:shadow-[0_0_0_2px_rgba(196,98,45,0.2)] transition-all outline-none text-[16px]"
                  />
                </div>
                {errors.fullName && <p className="text-[13px] text-[#C0392B] ml-1 font-medium">{errors.fullName.message}</p>}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-sand-200 tracking-[0.02em] ml-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sand-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-4 text-sand-50 placeholder:text-sand-500/50 focus:border-[#C4622D] focus:bg-white/[0.08] focus:shadow-[0_0_0_2px_rgba(196,98,45,0.2)] transition-all outline-none text-[16px]"
                  />
                </div>
                {errors.email && <p className="text-[13px] text-[#C0392B] ml-1 font-medium">{errors.email.message}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-sand-200 tracking-[0.02em] ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sand-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-12 text-sand-50 placeholder:text-sand-500/50 focus:border-[#C4622D] focus:bg-white/[0.08] focus:shadow-[0_0_0_2px_rgba(196,98,45,0.2)] transition-all outline-none text-[16px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-sand-400 hover:text-sand-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {passwordValue.length > 0 && (
                  <div className="px-1 pt-1 mb-2">
                    <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-white/5">
                      <div className={`flex-1 transition-all ${strengthInfo.score >= 1 ? strengthInfo.color : "bg-transparent"}`} />
                      <div className={`flex-1 transition-all ${strengthInfo.score >= 2 ? strengthInfo.color : "bg-transparent"}`} />
                      <div className={`flex-1 transition-all ${strengthInfo.score >= 3 ? strengthInfo.color : "bg-transparent"}`} />
                    </div>
                    <p className="text-xs text-sand-400 mt-1.5 text-right font-medium">{strengthInfo.text}</p>
                  </div>
                )}
                
                {errors.password && <p className="text-[13px] text-[#C0392B] ml-1 font-medium">{errors.password.message}</p>}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 py-2 px-1">
                <div className="relative flex items-center mt-0.5">
                  <input
                    {...register("acceptTerms")}
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-white/20 rounded-md bg-white/5 checked:bg-[#C4622D] checked:border-[#C4622D] focus:outline-none focus:ring-2 focus:ring-[#C4622D]/40 transition-all cursor-pointer"
                  />
                  <CheckCircle2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <label className="text-sm text-sand-300 leading-snug cursor-pointer">
                  I agree to the <Link href="#" className="underline hover:text-white">Terms of Service</Link> and <Link href="#" className="underline hover:text-white">Privacy Policy</Link>.
                </label>
              </div>
              {errors.acceptTerms && <p className="text-[13px] text-[#C0392B] ml-1 -mt-2 font-medium">{errors.acceptTerms.message}</p>}

              {/* Signup CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-12 flex items-center justify-center rounded-xl bg-[#C4622D] hover:bg-[#A44F24] text-white font-semibold shadow-[0_4px_16px_rgba(196,98,45,0.32)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating account...</> : "Create Account"}
                </button>
              </div>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[13px] font-medium text-sand-400 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={isLoading || isGoogleLoading}
              className="w-full h-12 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/20 text-white font-medium transition-all"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 24c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 21.53 7.7 24 12 24z" />
                    <path fill="#FBBC05" d="M5.84 15.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V8.06H2.18C1.43 9.55 1 11.22 1 13s.43 3.45 1.18 4.94l2.53-1.96.13-.88z" />
                    <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.18 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.06l3.66 2.84c.87-2.6 3.3-4.15 6.16-4.15z" />
                  </svg>
                  Sign up with Google
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sand-300 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
