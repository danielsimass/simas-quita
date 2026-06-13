import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useFinancings } from '../hooks/use-financing';

const SELECTED_FINANCING_KEY = 'controle-financiamentos-selected';

type FinancingContextValue = {
  selectedFinancingId: string | null;
  setSelectedFinancingId: (id: string | null) => void;
};

const FinancingContext = createContext<FinancingContextValue | null>(null);

export function FinancingProvider({ children }: { children: ReactNode }) {
  const { data: financings } = useFinancings();
  const [selectedFinancingId, setSelectedFinancingIdState] = useState<string | null>(() => {
    return localStorage.getItem(SELECTED_FINANCING_KEY);
  });

  useEffect(() => {
    if (!financings?.length) {
      return;
    }

    const isValid = selectedFinancingId
      ? financings.some((financing) => financing.id === selectedFinancingId)
      : false;

    if (!isValid) {
      setSelectedFinancingIdState(financings[0].id);
    }
  }, [financings, selectedFinancingId]);

  const setSelectedFinancingId = (id: string | null) => {
    setSelectedFinancingIdState(id);
    if (id) {
      localStorage.setItem(SELECTED_FINANCING_KEY, id);
    } else {
      localStorage.removeItem(SELECTED_FINANCING_KEY);
    }
  };

  const value = useMemo(
    () => ({ selectedFinancingId, setSelectedFinancingId }),
    [selectedFinancingId],
  );

  return <FinancingContext.Provider value={value}>{children}</FinancingContext.Provider>;
}

export function useSelectedFinancing(): FinancingContextValue {
  const context = useContext(FinancingContext);
  if (!context) {
    throw new Error('useSelectedFinancing must be used within FinancingProvider');
  }
  return context;
}
