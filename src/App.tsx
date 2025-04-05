import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TestCreator from './pages/TestCreator';
import TakeTest from './pages/TakeTest';
import MonitorTest from './pages/MonitorTest';
import Results from './pages/Results';

// Components
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="create-test" element={<TestCreator />} />
        <Route path="take-test/:testId" element={<TakeTest />} />
        <Route path="monitor/:testId" element={<MonitorTest />} />
        <Route path="results/:testId" element={<Results />} />
      </Route>
    </Routes>
  );
}

export default App;
