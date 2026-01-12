import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import { ThemeContextProvider } from './hooks/ThemeContext';
import { AuthProvider } from './hooks/AuthContext';

// Lazy load all page components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const FulcrumResources = lazy(() => import('./pages/FulcrumResources'));
const OnboardForm = lazy(() => import('./pages/OnboardForm'));

const SignUp = lazy(() => import('./pages/SignUp'));
const SignIn = lazy(() => import('./pages/SignIn'));
const Landing = lazy(() => import('./pages/Landing'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const ChangePassword = lazy(() => import('./pages/ChangePassword.jsx'));


const App = () => {

  return (
    <AuthProvider>
      <ThemeContextProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/landing" element={<Landing />} />
              {<Route path="/signup" element={<SignUp />} />}
              {<Route path="/signin" element={<SignIn />} />}

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
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } />

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/landing" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeContextProvider>
    </AuthProvider>
  );
};

export default App;
