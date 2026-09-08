import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const DEFAULT_USERS = [
  { username: 'admin', password: 'password123', name: 'Admin Alice', role: 'ADMIN' },
  { username: 'agent', password: 'password123', name: 'Agent Bob', role: 'REPLIER' },
  { username: 'sarah', password: 'password123', name: 'Sarah Specialist', role: 'REPLIER' },
  { username: 'customer', password: 'password123', name: 'Customer Charlie', role: 'CUSTOMER' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cstms_user');
      return saved ? JSON.parse(saved) : DEFAULT_USERS[0];
    } catch {
      return DEFAULT_USERS[0];
    }
  });

  const login = (username, password) => {
    const found = DEFAULT_USERS.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (found) {
      const userData = { username: found.username, name: found.name, role: found.role };
      setUser(userData);
      localStorage.setItem('cstms_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cstms_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, DEFAULT_USERS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
