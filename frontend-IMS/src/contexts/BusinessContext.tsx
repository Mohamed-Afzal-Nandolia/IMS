'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Business {
  id: string;
  name: string;
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
      if (businessId) {
          // Dummy business info for now, as it's extracted implicitly in backend APIs
          setCurrentBusiness({ id: businessId, name: 'My Business' });
      } else {
          setCurrentBusiness(null);
      }
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
