"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/services/supabaseService";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }
      
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#0B3D4A_0%,#1A6B7C_35%,#C4622D_70%,#E47832_100%)] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* ─── AMBIENT BACKGROUND EFFECTS ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-[20%] left-[20%] w-[30rem] h-[30rem] rounded-full bg-teal-500/20 blur-[120px] mix-blend-screen" />
         <div className="absolute bottom-[20%] right-[20%] w-[25rem] h-[25rem] rounded-full bg-amber-500/20 blur-[100px] mix-blend-screen" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-sand-300 hover:text-sand-50 transition-colors mb-6 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="rounded-[2rem] bg-white/[0.04] border border-white/[0.08] backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.32)] p-8 md:p-10 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="mb-8">
                  <h1 className="font-serif text-[32px] font-medium text-sand-50 mb-2 leading-tight">
                    Reset password
                  </h1>
                  <p className="text-sand-300">Enter your email and we'll send you a link to get back into your account.</p>
                </div>

                {errorMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] text-sm font-medium flex items-center gap-2">
                    <span className="flex-shrink-0">⚠️</span>
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                        className="w-full h-12 bg-white/[0.05] border border-white/10 rounded-xl pl-11 pr-4 text-sand-50 placeholder:text-sand-500/50 focus:border-[#35CAAB] focus:bg-white/[0.08] focus:shadow-[0_0_0_2px_rgba(53,202,171,0.2)] transition-all outline-none text-[16px]"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[13px] text-[#C0392B] ml-1 mt-1 font-medium">{errors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 flex items-center justify-center rounded-xl bg-[#0F7490] hover:bg-[#0C5E75] text-white font-semibold shadow-[0_4px_16px_rgba(15,116,144,0.32)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...</>
                    ) : (
                      "Send reset link"
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-[#14B8A6]/20 mx-auto flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-[#14B8A6]" />
                </div>
                <h2 className="font-serif text-3xl font-medium text-sand-50 mb-3">
                  Check your inbox
                </h2>
                <p className="text-sand-300 mb-8">
                  We've sent a password reset link to your email address. It may take a few minutes to arrive.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/20 text-white font-medium transition-all"
                >
                  Return to login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
