import { createContext, useContext, useState, useCallback } from 'react';

export type SelectedCampus = 'SJCE' | 'SJIT' | 'CIT' | null;

interface CampusContextValue {
  selectedCampus: SelectedCampus;
  setCampus: (campus: SelectedCampus) => void;
}

const CampusContext = createContext<CampusContextValue>({
  selectedCampus: null,
  setCampus: () => {},
});

export const useCampus = () => useContext(CampusContext);

export const CampusProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedCampus, setSelectedCampus] = useState<SelectedCampus>(() => {
    return (localStorage.getItem('campus_selected') as SelectedCampus) ?? null;
  });

  const setCampus = useCallback((campus: SelectedCampus) => {
    setSelectedCampus(campus);
    if (campus) {
      localStorage.setItem('campus_selected', campus);
    } else {
      localStorage.removeItem('campus_selected');
    }
  }, []);

  return (
    <CampusContext.Provider value={{ selectedCampus, setCampus }}>
      {children}
    </CampusContext.Provider>
  );
};
