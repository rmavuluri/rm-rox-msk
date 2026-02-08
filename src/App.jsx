import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { ThemeContextProvider } from './hooks/ThemeContext';
import { AuthProvider } from './hooks/AuthContext';

// Lazy load page components for code splitting (OnboardForm loaded directly so /onboard always works)
import OnboardForm from './pages/OnboardForm.jsx';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FulcrumResources = lazy(() => import('./pages/FulcrumResources'));
const OnboardingTracker = lazy(() => import('./pages/OnboardingTracker'));
const Landing = lazy(() => import('./pages/Landing'));

const App = () => {

  return (
    <AuthProvider>
      <ThemeContextProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/resources" element={
                <ProtectedRoute>
                  <Layout>
                    <FulcrumResources />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/onboard" element={
                <ProtectedRoute>
                  <Layout>
                    <OnboardForm />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/onboarding-tracker" element={
                <ProtectedRoute>
                  <Layout>
                    <OnboardingTracker />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeContextProvider>
    </AuthProvider>
  );
};

export default App;
