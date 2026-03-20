import React, { createContext, useContext, useState, useEffect } from 'react';

interface BrandingData {
  site_title: string;
  updated_at?: string;
  active_logo_id?: number | null;
}

export interface LogoItem {
  id: number;
  name: string;
  logo_mime_type: string;
  created_at: string;
}

interface BrandingContextType {
  branding: BrandingData;
  logos: LogoItem[];
  isLoading: boolean;
  refreshBranding: () => Promise<void>;
  refreshLogos: (token: string | null) => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);
const API_URL = import.meta.env.VITE_API_URL;

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingData>({
    site_title: 'Arjo Portfolio',
    updated_at: undefined,
    active_logo_id: null
  });
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const res = await fetch(`${API_URL}/api/branding`);
      if (res.ok) {
        const data = await res.json();
        setBranding(data);
      }
    } catch (err) {
      console.error('Failed to fetch branding:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogos = async (token: string | null) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/branding/logos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogos(data);
      }
    } catch (err) {
      console.error('Failed to fetch logos:', err);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ 
      branding, 
      logos, 
      isLoading, 
      refreshBranding: fetchBranding,
      refreshLogos: fetchLogos
    }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
