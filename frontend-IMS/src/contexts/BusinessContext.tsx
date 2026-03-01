'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Business {
  id: string;
  name: string;
  legal_name?: string;
  gstin?: string;
  gst_type?: string;
  state?: string;
  state_code?: string;
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
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);

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
