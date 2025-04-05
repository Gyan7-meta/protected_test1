import React, { createContext, useContext, useState, useEffect } from 'react';

// Define User type
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
}

// Define AuthContext type
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'student' | 'instructor') => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // In a real app, this would be an API call
      // For demo, we'll simulate a login
      const mockUser: User = {
        id: '123',
        name: email.split('@')[0],
        email,
        role: email.includes('instructor') ? 'instructor' : 'student'
      };
      
      // Store user in local storage
      localStorage.setItem('user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: 'student' | 'instructor') => {
    try {
      setError(null);
      setLoading(true);
      
      // In a real app, this would be an API call
      // For demo, we'll simulate a registration
      const mockUser: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        role
      };
      
      // Store user in local storage
      localStorage.setItem('user', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 