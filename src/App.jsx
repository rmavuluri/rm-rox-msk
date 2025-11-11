import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import OktaCallback from './components/OktaCallback';
import LoadingSpinner from './components/LoadingSpinner';
import { ThemeContextProvider } from './hooks/ThemeContext';
import { AuthProvider } from './hooks/AuthContext';

// Lazy load all page components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Producers = lazy(() => import('./pages/Producers'));
const Consumers = lazy(() => import('./pages/Consumers'));
const FulcrumResources = lazy(() => import('./pages/FulcrumResources'));
const OnboardForm = lazy(() => import('./pages/OnboardForm'));
const SchemasList = lazy(() => import('./pages/SchemasList'));
const Topics = lazy(() => import('./pages/Topics'));
// SignUp and SignIn commented out for now
// const SignUp = lazy(() => import('./pages/SignUp'));
// const SignIn = lazy(() => import('./pages/SignIn'));
const Landing = lazy(() => import('./pages/Landing'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const ChangePassword = lazy(() => import('./pages/ChangePassword.jsx'));
const DashboardProducers = lazy(() => import('./pages/DashboardProducers'));
const DashboardConsumers = lazy(() => import('./pages/DashboardConsumers'));
const DashboardTopics = lazy(() => import('./pages/DashboardTopics'));
const DashboardActivity = lazy(() => import('./pages/DashboardActivity'));

const App = () => {
  // Debug: Log environment variables
  console.log('REACT_APP_OKTA_ISSUER:', process.env.REACT_APP_OKTA_ISSUER);
  console.log('REACT_APP_OKTA_CLIENT_ID:', process.env.REACT_APP_OKTA_CLIENT_ID);
  
  return (
    <AuthProvider>
      <ThemeContextProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/landing" element={<Landing />} />
              {/* SignUp and SignIn routes commented out for now */}
              {/* <Route path="/signup" element={<SignUp />} /> */}
              {/* <Route path="/signin" element={<SignIn />} /> */}
              <Route path="/login/callback" element={<OktaCallback />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/producers" element={
                <ProtectedRoute>
                  <Layout>
                    <Producers />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/consumers" element={
                <ProtectedRoute>
                  <Layout>
                    <Consumers />
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
              <Route path="/schemas" element={
                <ProtectedRoute>
                  <Layout>
                    <SchemasList />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/topics" element={
                <ProtectedRoute>
                  <Layout>
                    <Topics />
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
              <Route path="/dashboard/producers" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardProducers />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/consumers" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardConsumers />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/topics" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardTopics />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard/activity" element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardActivity />
                  </Layout>
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
