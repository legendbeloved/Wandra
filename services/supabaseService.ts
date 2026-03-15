import { createClient } from '@supabase/supabase-js';
import { Journey, Moment } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.warn("Wandra: NEXT_PUBLIC_SUPABASE_URL is not set or invalid. Supabase features will be disabled.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

export const SupabaseService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async getJourneys() {
    const { data, error } = await supabase
      .from('journeys')
      .select('*, moments(*)')
      .order('started_at', { ascending: false });
    if (error) throw error;
    return data as Journey[];
  },

  async createJourney(journey: Partial<Journey>) {
    const { data, error } = await supabase
      .from('journeys')
      .insert(journey)
      .select()
      .single();
    if (error) throw error;
    return data as Journey;
  },

  async updateJourney(id: string, updates: Partial<Journey>) {
    const { data, error } = await supabase
      .from('journeys')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Journey;
  },

  async deleteJourney(id: string) {
    const { error } = await supabase
      .from('journeys')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async addMoment(moment: Omit<Moment, 'id'>) {
    const { data, error } = await supabase
      .from('moments')
      .insert(moment)
      .select()
      .single();
    if (error) throw error;
    return data as Moment;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
