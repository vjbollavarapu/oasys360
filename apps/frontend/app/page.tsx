/**
 * Root Dashboard Page
 * Main overview dashboard showing metrics from all modules
 * Redirects to login if not authenticated
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { RootDashboard } from '@/components/dashboard/root-dashboard';
import { OnboardingGuard } from '@/components/onboarding/onboarding-guard';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (mounted && !isLoading && !user) {
      router.push('/auth/login');
      return;
    }
    
    // Check onboarding status if user is authenticated
    if (mounted && !isLoading && user) {
      checkOnboardingStatus();
    }
  }, [user, isLoading, mounted, router]);

  const checkOnboardingStatus = async () => {
    // Skip check - OnboardingGuard will handle it
    // This prevents duplicate API calls
    return;
  };

  // Show loading state or nothing while checking auth
  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, return null (redirect will happen)
  if (!user) {
    return null;
  }

  // Show dashboard for authenticated users (protected by onboarding guard)
  return (
    <OnboardingGuard>
      <DashboardLayout>
        <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
          <RootDashboard />
        </div>
      </DashboardLayout>
    </OnboardingGuard>
  );
}
