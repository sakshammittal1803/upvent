import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const EventDetailPage = React.lazy(() => import('./pages/EventDetailPage'));
const AddEditEventPage = React.lazy(() => import('./pages/AddEditEventPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AutoConnectPage = React.lazy(() => import('./pages/AutoConnectPage'));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage'));

const App: React.FC = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen font-sans bg-background text-on-background dark:bg-[#121212] dark:text-[#e1e3e4] transition-colors duration-300">
                    <Suspense fallback={
                        <div className="flex items-center justify-center min-h-screen">
                            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                        </div>
                    }>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<LoginPage />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                            <Route path="/event/add" element={<ProtectedRoute><AddEditEventPage /></ProtectedRoute>} />
                            <Route path="/event/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
                            <Route path="/event/edit/:id" element={<ProtectedRoute><AddEditEventPage /></ProtectedRoute>} />
                            <Route path="/connect" element={<ProtectedRoute><AutoConnectPage /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                            
                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;
