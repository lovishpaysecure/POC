import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    // if (!isAuthenticated) {
    //     // Redirect to Thymeleaf login
    //     window.location.href = 'http://localhost:9091/login';
    //     return null;
    // }

    return <>{children}</>;
}; 