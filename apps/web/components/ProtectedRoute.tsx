'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && isClient) {
      if (!user) {
        router.replace('/login');
      } else if (requireAdmin && user.role !== 'admin') {
        router.replace('/');
      }
    }
  }, [user, loading, requireAdmin, router, isClient]);

  // If initial load in progress and no stored token, show small branded loader
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-[#ec5b13] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user && !loading) {
    return null;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
