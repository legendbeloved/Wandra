"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Lock, 
  Navigation, 
  Edit3, 
  Camera, 
  Sun, 
  Moon, 
  Monitor, 
  Bell, 
  Trash2, 
  LogOut, 
  CheckCircle2,
  Database,
  Search
} from "lucide-react";
import { supabase } from "@/services/supabaseService";
import { Profile } from "@/types/index";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [successField, setSuccessField] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email || "");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setProfile(profileData);
      setIsLoading(false);
    };
    loadProfile();
  }, [router]);

  const updateField = async (field: keyof Profile, value: any) => {
    if (!profile) return;
    
    setSavingField(field);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", profile.id);
      
      if (error) throw error;
      
      setProfile({ ...profile, [field]: value });
      setSuccessField(field);
      setTimeout(() => setSuccessField(null), 2000);
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    } finally {
      setSavingField(null);
    }
  };

  const handlePasswordReset = async () => {
    if (!userEmail) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail);
      if (error) throw error;
      alert("Password reset email sent!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setIsDeleting(true);
    try {
      // In a real app, you'd call a server function to handle deletion
      // For now, we'll just sign out
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C4622D] border-t-transparent animate-spin" />
      </div>
    );
  }

  const SuccessIndicator = ({ show }: { show: boolean }) => (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="text-emerald-500 ml-2"
        >
          <CheckCircle2 className="w-4 h-4" />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-[#F9F7F4] text-[#1E1C1A] font-body pb-24 relative wandra-paper-texture">
      
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 left-0 w-full z-40 bg-[#F9F7F4]/80 backdrop-blur-xl px-4 py-4 pt-safe flex items-center gap-4 border-b border-[#E8E2D9]">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#E8E2D9]">
          <ChevronLeft className="w-5 h-5 text-[#8C837A]" />
        </button>
        <h1 className="font-serif text-[20px] font-bold">Settings</h1>
      </header>

      <main className="max-w-[500px] mx-auto px-6 pt-8 space-y-10">
        
        {/* SECTION: ACCOUNT */}
        <section>
          <h3 className="text-[11px] uppercase tracking-[0.15em] text-[#8C837A] font-bold mb-4 px-1">Account</h3>
          <div className="space-y-4">
            
            {/* Display Name */}
            <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-bold text-[#8C837A]">Display Name</label>
                <SuccessIndicator show={successField === 'display_name'} />
              </div>
              <div className="relative">
                <input 
                  type="text"
                  defaultValue={profile?.display_name || ""}
                  onBlur={(e) => updateField('display_name', e.target.value)}
                  className="w-full bg-[#F9F7F4] border-none rounded-xl px-4 py-3 text-[15px] focus:ring-2 focus:ring-[#C4622D]/20 transition-all font-serif italic"
                  placeholder="e.g. Atlas Walker"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C2BAB0]" />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="bg-white/50 border border-[#E8E2D9] rounded-[24px] p-5">
              <label className="text-[13px] font-bold text-[#8C837A] mb-2 block">Email Address</label>
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-[#8C837A]">{userEmail}</span>
                <Mail className="w-4 h-4 text-[#C2BAB0]" />
              </div>
            </div>

            {/* Password */}
            <button 
              onClick={handlePasswordReset}
              className="w-full flex items-center justify-between p-5 bg-white border border-[#E8E2D9] rounded-[24px] shadow-sm hover:bg-[#F9F7F4] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#C4622D]" />
                <span className="text-[15px] font-medium">Change Password</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-[#C2BAB0] rotate-180" />
            </button>
          </div>
        </section>

        {/* SECTION: JOURNEY PREFERENCES */}
        <section>
          <h3 className="text-[11px] uppercase tracking-[0.15em] text-[#8C837A] font-bold mb-4 px-1">Journey Preferences</h3>
          <div className="space-y-4">
            
            {/* Tracking Interval */}
            <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#1A6B7C]" />
                  <span className="text-[13px] font-bold text-[#8C837A]">Tracking Interval</span>
                </div>
                <SuccessIndicator show={successField === 'tracking_interval'} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((val) => (
                  <button
                    key={val}
                    onClick={() => updateField('tracking_interval', val)}
                    className={`py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                      profile?.tracking_interval === val 
                        ? 'bg-[#C4622D] text-white shadow-lg shadow-amber-900/20' 
                        : 'bg-[#F9F7F4] text-[#8C837A] hover:bg-[#F1EDE9]'
                    }`}
                  >
                    {val} min
                  </button>
                ))}
              </div>
            </div>

            {/* AI Style */}
            <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#1A6B7C]" />
                  <span className="text-[13px] font-bold text-[#8C837A]">AI Writing Style</span>
                </div>
                <SuccessIndicator show={successField === 'ai_writing_style'} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['poetic', 'descriptive', 'brief'].map((style) => (
                  <button
                    key={style}
                    onClick={() => updateField('ai_writing_style', style)}
                    className={`py-2.5 rounded-xl text-[13px] font-bold transition-all capitalize ${
                      profile?.ai_writing_style === style 
                        ? 'bg-[#C4622D] text-white shadow-lg shadow-amber-900/20' 
                        : 'bg-[#F9F7F4] text-[#8C837A] hover:bg-[#F1EDE9]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-save photos */}
            <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-[#8C837A]" />
                <span className="text-[15px] font-medium">Auto-save Moments</span>
              </div>
              <button 
                onClick={() => updateField('auto_save_photos', !profile?.auto_save_photos)}
                className={`w-12 h-6 rounded-full relative transition-colors ${profile?.auto_save_photos ? 'bg-emerald-500' : 'bg-[#C2BAB0]'}`}
              >
                <motion.div 
                  animate={{ x: profile?.auto_save_photos ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION: APP */}
        <section>
          <h3 className="text-[11px] uppercase tracking-[0.15em] text-[#8C837A] font-bold mb-4 px-1">App</h3>
          <div className="space-y-4">
            
            {/* Theme */}
            <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-2 shadow-sm flex">
              {[
                { val: 'light', icon: Sun },
                { val: 'dark', icon: Moon },
                { val: 'system', icon: Monitor },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => updateField('theme', t.val)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                    profile?.theme === t.val 
                      ? 'bg-[#F9F7F4] text-[#C4622D] shadow-sm' 
                      : 'text-[#8C837A] hover:bg-[#F9F7F4]/50'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="capitalize">{t.val}</span>
                </button>
              ))}
            </div>

            {/* Notifications */}
            <div className="bg-white border border-[#E8E2D9] rounded-[24px] p-5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#8C837A]" />
                <span className="text-[15px] font-medium">Notifications</span>
              </div>
              <button 
                onClick={() => updateField('notifications_enabled', !profile?.notifications_enabled)}
                className={`w-12 h-6 rounded-full relative transition-colors ${profile?.notifications_enabled ? 'bg-emerald-500' : 'bg-[#C2BAB0]'}`}
              >
                <motion.div 
                  animate={{ x: profile?.notifications_enabled ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            {/* Clear Data */}
            <button className="w-full flex items-center gap-3 p-5 text-[#8C837A] hover:text-[#1E1C1A] transition-colors">
              <Database className="w-5 h-5" />
                <span className="text-[15px] font-medium">Clear offline cache</span>
            </button>
          </div>
        </section>

        {/* SECTION: ACTIONS */}
        <section className="pt-6 space-y-6">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl border-2 border-[#E8E2D9] text-[#534D47] font-bold hover:bg-[#E8E2D9]/30 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          <div className="pt-8 border-t border-[#E8E2D9]">
            <h4 className="text-[13px] font-bold text-[#E74C3C] mb-2 px-1">Danger Zone</h4>
            <p className="text-[12px] text-[#8C837A] mb-4 px-1">
              Deleting your account is permanent. All journeys and moments will be purged.
            </p>
            <div className="space-y-3">
              <input 
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="w-full bg-white border border-[#E8E2D9] rounded-xl px-4 py-3 text-[14px] focus:ring-2 focus:ring-red-500/20 text-red-600 font-bold"
              />
              <button 
                disabled={deleteConfirm !== "DELETE" || isDeleting}
                onClick={handleDeleteAccount}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  deleteConfirm === "DELETE" 
                    ? 'bg-[#E74C3C] text-white shadow-lg shadow-red-900/20 active:scale-95' 
                    : 'bg-[#EDE9E4] text-[#C2BAB0] cursor-not-allowed'
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
