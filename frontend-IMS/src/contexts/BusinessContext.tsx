'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

interface Business {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  invoicePrefix?: string;
  invoiceTerms?: string;
  invoiceNotes?: string;
  showBankDetails?: boolean;
  showUpiQr?: boolean;
  showDigitalSignature?: boolean;
  lowStockAlert?: boolean;
  newInvoiceAlert?: boolean;
  paymentReceivedAlert?: boolean;
  overdueInvoicesAlert?: boolean;
}

interface BusinessContextType {
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business | null) => void;
  businesses: Business[];
  setBusinesses: (businesses: Business[]) => void;
}

const BusinessContext = createContext<BusinessContextType>({
  currentBusiness: null,
  setCurrentBusiness: () => {},
  businesses: [],
  setBusinesses: () => {},
});

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { businessId } = useAuth();
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const loadBusiness = async () => {
      try {
        if (!businessId) {
          if (isMounted) setCurrentBusiness(null);
          return;
        }

        // We can fetch from backend to get the real business name and settings
        const { data } = await api.get('/business');
        if (isMounted) {
          setCurrentBusiness(data);
        }
      } catch (err) {
        console.error('Failed to load business profile', err);
        // Fallback or handle later
        if (isMounted) setCurrentBusiness({ id: businessId, name: 'Business' } as Business);
      }
    };

    loadBusiness();

    return () => {
      isMounted = false;
    };
  }, [businessId]);

  const handleSetBusiness = useCallback((business: Business | null) => {
    setCurrentBusiness(business);
    if (business) {
      localStorage.setItem('ims-current-business', business.id);
    }
  }, []);

  return (
    <BusinessContext.Provider
      value={{
        currentBusiness,
        setCurrentBusiness: handleSetBusiness,
        businesses,
        setBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusiness = () => useContext(BusinessContext);
