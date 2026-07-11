import { createContext, useContext, useState, useEffect } from 'react';
import { loginCustomer, loginSeller, registerCustomer, registerSeller } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('aras_token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('aras_role') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('aras_email') || '');

  useEffect(() => {
    if (token) {
      localStorage.setItem('aras_token', token);
      localStorage.setItem('aras_role', userRole);
      localStorage.setItem('aras_email', userEmail);
    } else {
      localStorage.removeItem('aras_token');
      localStorage.removeItem('aras_role');
      localStorage.removeItem('aras_email');
    }
  }, [token, userRole, userEmail]);

  const login = async (email, password, role) => {
    const fn = role === 'Seller' ? loginSeller : loginCustomer;
    const data = await fn(email, password);
    setToken(data.token);
    setUserRole(role);
    setUserEmail(email);
    return data;
  };

  const register = async (formData, role) => {
    const fn = role === 'Seller' ? registerSeller : registerCustomer;
    const data = await fn(formData);
    setToken(data.token);
    setUserRole(role);
    setUserEmail(formData.email);
    return data;
  };

  const logout = () => {
    setToken('');
    setUserRole('');
    setUserEmail('');
  };

  const isAuthenticated = !!token;
  const isSeller = userRole === 'Seller';
  const isCustomer = userRole === 'Customer';

  return (
    <AuthContext.Provider value={{
      token, userRole, userEmail,
      isAuthenticated, isSeller, isCustomer,
      login, register, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
