'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Locality {
  id: string;
  name: string;
  subArea: string | null;
  city: string;
  state: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
}

interface LocalityContextType {
  currentLocality: Locality | null;
  localities: Locality[];
  selectLocality: (localityId: string) => void;
  loading: boolean;
  refreshLocalities: () => Promise<void>;
}

const LocalityContext = createContext<LocalityContextType | undefined>(undefined);

export function LocalityProvider({ children }: { children: React.ReactNode }) {
  const [currentLocality, setCurrentLocality] = useState<Locality | null>(null);
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocalities = async () => {
    try {
      const response = await fetch('/api/localities');
      if (response.ok) {
        const data = await response.json();
        setLocalities(data);
        
        // Restore from localStorage or default to Badlapur East/Katrap
        const savedLocalityId = localStorage.getItem('aaspas_locality_id');
        if (savedLocalityId) {
          const found = data.find((l: Locality) => l.id === savedLocalityId);
          if (found) {
            setCurrentLocality(found);
            setLoading(false);
            return;
          }
        }
        
        // Find default: Katrap, Badlapur or first available
        const defaultLocality = data.find((l: Locality) => l.subArea === 'Katrap') || data[0];
        if (defaultLocality) {
          setCurrentLocality(defaultLocality);
          localStorage.setItem('aaspas_locality_id', defaultLocality.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch localities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      fetchLocalities();
    }, 0);
  }, []);

  const selectLocality = (localityId: string) => {
    const found = localities.find((l) => l.id === localityId);
    if (found) {
      setCurrentLocality(found);
      localStorage.setItem('aaspas_locality_id', found.id);
    }
  };

  return (
    <LocalityContext.Provider
      value={{
        currentLocality,
        localities,
        selectLocality,
        loading,
        refreshLocalities: fetchLocalities,
      }}
    >
      {children}
    </LocalityContext.Provider>
  );
}

export function useLocality() {
  const context = useContext(LocalityContext);
  if (context === undefined) {
    throw new Error('useLocality must be used within a LocalityProvider');
  }
  return context;
}
