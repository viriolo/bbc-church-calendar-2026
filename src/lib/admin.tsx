import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  showLoginModal: boolean;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
  openLogin: () => void;
  closeLogin: () => void;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  showLoginModal: false,
  login: async () => false,
  logout: () => {},
  openLogin: () => {},
  closeLogin: () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

const ADMIN_KEY = 'bbc_admin';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem(ADMIN_KEY) === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  const login = useCallback(async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.authenticated) {
        setIsAdmin(true);
        sessionStorage.setItem(ADMIN_KEY, 'true');
        setShowLoginModal(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    sessionStorage.removeItem(ADMIN_KEY);
  }, []);

  const openLogin = useCallback(() => setShowLoginModal(true), []);
  const closeLogin = useCallback(() => setShowLoginModal(false), []);

  return (
    <AdminContext.Provider value={{ isAdmin, showLoginModal, login, logout, openLogin, closeLogin }}>
      {children}
    </AdminContext.Provider>
  );
}
