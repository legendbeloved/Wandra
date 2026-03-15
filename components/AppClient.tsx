"use client";

import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { HomeView } from '../views/HomeView';
import { JourneyView } from '../views/JourneyView';
import { LibraryView } from '../views/LibraryView';
import { ProfileView } from '../views/ProfileView';
import { JournalDetailView } from '../views/JournalDetailView';
import { SplashScreen } from '../components/SplashScreen';
import { Journey } from '../types';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { supabase, SupabaseService } from '../services/supabaseService';
import { AuthView } from '../views/AuthView';
import { OnboardingView } from '../views/OnboardingView';
import { LandingPage } from '../views/LandingPage';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const isOnline = useOnlineStatus();
  const [isLoaded, setIsLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadProfileAndData();
    } else {
      setProfile(null);
      setJourneys([]);
    }
  }, [session]);

  const loadProfileAndData = async () => {
    if (!session) return;
    try {
      // 1. Load Profile
      try {
        const profileData = await SupabaseService.getProfile(session.user.id);
        setProfile(profileData);
      } catch (error) {
        console.log("No profile found yet");
      }

      // 2. Load Journeys
      loadJourneys();
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const loadJourneys = async () => {
    try {
      const data = await SupabaseService.getJourneys();
      setJourneys(data);
    } catch (error) {
      console.error("Failed to load journeys:", error);
    }
  };

  const handleOnboardingComplete = async (data: any) => {
    if (!session) return;
    try {
      const updatedProfile = await SupabaseService.updateProfile(session.user.id, {
        display_name: data.displayName,
        onboarded: true,
        travel_style: data.travelStyle,
      });
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const startJourney = async (destination: string) => {
    if (!session) return;
    
    try {
      const response = await fetch('/api/journeys/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_name: destination,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start journey');
      }

      setActiveJourney(data);
      setActiveTab('journey');
    } catch (error: any) {
      console.error("Failed to start journey:", error);
    }
  };

  const endJourney = async (completedJourney: Journey) => {
    try {
      await SupabaseService.updateJourney(completedJourney.id, {
        status: 'completed',
        ended_at: new Date().toISOString(),
        journal_text: completedJourney.journal_text,
        mood_tag: completedJourney.mood_tag,
      });
      await loadJourneys();
      setActiveJourney(null);
      setSelectedJourney(completedJourney);
      setActiveTab('detail');
    } catch (error) {
      console.error("Failed to end journey:", error);
    }
  };

  const deleteJourney = async (id: string) => {
    try {
      await SupabaseService.deleteJourney(id);
      setJourneys(journeys.filter(j => j.id !== id));
      if (selectedJourney?.id === id) {
        setSelectedJourney(null);
        setActiveTab('library');
      }
    } catch (error) {
      console.error("Failed to delete journey:", error);
    }
  };

  const handleSelectJourney = (journey: Journey) => {
    setSelectedJourney(journey);
    setActiveTab('detail');
  };

  if (!isLoaded) {
    return <SplashScreen onComplete={() => setIsLoaded(true)} />;
  }

  if (!session && !showAuth) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  if (!session && showAuth) {
    return (
      <Layout activeTab="home" onTabChange={() => {}}>
        <AuthView onSuccess={() => {}} />
      </Layout>
    );
  }

  if (profile && !profile.onboarded) {
    return (
      <Layout activeTab="home" onTabChange={() => {}}>
        <OnboardingView onComplete={handleOnboardingComplete} />
      </Layout>
    );
  }

  return (
    <Layout 
      activeTab={activeTab === 'detail' ? 'library' : activeTab} 
      onTabChange={setActiveTab}
      isSyncing={isSyncing}
    >
      {activeTab === 'home' && (
        <HomeView 
          onStartJourney={startJourney} 
          recentJourneys={journeys.slice(0, 3)}
          onViewLibrary={() => setActiveTab('library')}
        />
      )}
      {activeTab === 'journey' && (
        <JourneyView 
          journey={activeJourney} 
          onEndJourney={endJourney}
          onCancel={() => {
            setActiveJourney(null);
            setActiveTab('home');
          }}
        />
      )}
      {activeTab === 'library' && (
        <LibraryView 
          journeys={journeys} 
          onSelectJourney={handleSelectJourney}
          onDeleteJourney={deleteJourney}
        />
      )}
      {activeTab === 'profile' && (
        <ProfileView journeys={journeys} />
      )}
      {activeTab === 'detail' && selectedJourney && (
        <JournalDetailView 
          journey={selectedJourney} 
          onBack={() => setActiveTab('library')}
          onDelete={() => {
            deleteJourney(selectedJourney.id);
          }}
        />
      )}
    </Layout>
  );
}
