'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  role: string;
  localityId: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is stored in localStorage
    const savedUser = localStorage.getItem('aaspas_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setTimeout(() => {
          setUser(parsed);
          setLoading(false);
        }, 0);
        return;
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('aaspas_user');
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 0);
  }, []);

  const login = async (phone: string): Promise<boolean> => {
    try {
      // Simulate API call to send OTP
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      return response.ok;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('aaspas_user', JSON.stringify(data.user));
        
        // Also save user's locality if they have one
        if (data.user.localityId) {
          localStorage.setItem('aaspas_locality_id', data.user.localityId);
        }
        
        router.push('/');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Verification error:', error);
      return false;
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...profileData }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('aaspas_user', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aaspas_user');
    // Keep locality saved to preserve local area selection for next time
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
