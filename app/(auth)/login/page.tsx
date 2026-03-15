"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseService";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Email or password is incorrect. Please try again.");
        } else {
          setErrorMsg(error.message);
        }
        return;
      }
      
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        // Check if user is onboarded
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarded")
          .eq("id", session.session.user.id)
          .single();

        if (profile?.onboarded) {
          router.push("/app");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setErrorMsg("Network error: Failed to connect to Supabase. Please check your internet connection and ensure your Supabase URL in .env.local is correct (including https://).");
      } else {
        setErrorMsg("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      setErrorMsg(err.message || "Failed to login with Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#0B3D4A_0%,#1A6B7C_35%,#C4622D_70%,#E47832_100%)] flex">
      {/* ─── LEFT PANEL: BRAND ILLUSTRATION (Desktop Only) ─── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden flex-col justify-between p-12">
        <div className="relative z-10 flex items-center gap-2">
          <span className="text-3xl" role="img" aria-label="Wandra compass logo">
            🧭
          </span>
          <span className="font-serif italic font-semibold text-2xl text-sand-50 tracking-wide">
            Wandra
          </span>
        </div>
        
        {/* Abstract "Wanderer at Golden Hour" SVG Representation */}
        <div className="absolute inset-0 z-0">
          <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-[#041E27] to-transparent" />
          {/* Faux Hills */}
          <svg className="absolute bottom-0 w-[150%] h-[50%] -left-[10%] opacity-40 text-[#062C38]" preserveAspectRatio="none" viewBox="0 0 1000 300" fill="currentColor">
            <path d="M0,300 L1000,300 L1000,100 Q800,200 500,50 Q200,-100 0,200 Z" />
          </svg>
          <svg className="absolute bottom-[-10%] w-[120%] h-[40%] text-[#041E27] opacity-80" preserveAspectRatio="none" viewBox="0 0 1000 300" fill="currentColor">
            <path d="M0,300 L1000,300 L1000,180 Q750,50 300,150 Q100,200 0,100 Z" />
          </svg>
          {/* Sun Glow */}
          <div className="absolute top-[30%] left-[60%] w-64 h-64 rounded-full bg-[#FBBF24] blur-[100px] opacity-40 mix-blend-screen" />
        </div>

        <div className="relative z-10 max-w-lg mb-12">
          <h2 className="font-serif italic text-5xl text-sand-50 mb-6 leading-[1.1]">
            Every mile, remembered.
          </h2>
          <p className="text-sand-200 text-lg leading-relaxed">
            The travel journal that works while you wander. You focus on the moment — Wandra listens, tracks, and writes.
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
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
            <span className="text-3xl" role="img" aria-label="Wandra compass logo">
              🧭
            </span>
            <span className="font-serif italic font-semibold text-3xl text-sand-50 tracking-wide">
              Wandra
            </span>
          </div>

          <div className="rounded-[2rem] bg-white/[0.04] border border-white/[0.08] backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.32)] p-8 md:p-10">
            <div className="mb-8">
              <h1 className="font-serif text-[32px] font-medium text-sand-50 mb-2 leading-tight">
                Welcome back.
              </h1>
              <p className="text-sand-300">Your journeys are waiting.</p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] text-sm font-medium flex items-center gap-2">
                <span className="flex-shrink-0">⚠️</span>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-4 text-sand-50 placeholder:text-sand-500/50 focus:border-[#35CAAB] focus:bg-white/[0.08] focus:shadow-[0_0_0_2px_rgba(53,202,171,0.2)] transition-all outline-none text-[16px]"
                  />
                </div>
                {errors.email && (
                  <p className="text-[13px] text-[#C0392B] ml-1 mt-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between ml-1 mr-1">
                  <label className="text-[13px] font-medium text-sand-200 tracking-[0.02em]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[13px] font-medium text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sand-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-12 text-sand-50 placeholder:text-sand-500/50 focus:border-[#35CAAB] focus:bg-white/[0.08] focus:shadow-[0_0_0_2px_rgba(53,202,171,0.2)] transition-all outline-none text-[16px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-sand-400 hover:text-sand-200 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[13px] text-[#C0392B] ml-1 mt-1 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Login CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-12 flex items-center justify-center rounded-xl bg-[#0F7490] hover:bg-[#0C5E75] text-white font-semibold shadow-[0_4px_16px_rgba(15,116,144,0.32)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Logging in...</>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[13px] font-medium text-sand-400 uppercase tracking-widest">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google OAuth */}
            <button
              onClick={handleGoogleLogin}
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
                    <path fill="transparent" d="M1 1h22v22H1z" />
                  </svg>
                  Google
                </>
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sand-300 text-sm">
              New to Wandra?{" "}
              <Link href="/signup" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
