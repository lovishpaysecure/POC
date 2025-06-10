import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create axios instance with default config
const api = axios.create({
    withCredentials: true, // This is important for sending cookies
    baseURL: '/api'
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: true, // Assume authenticated since JWT cookie exists
        isLoading: false, // No initial loading state needed
    });

    const redirectToLogin = () => {
        window.location.href = 'http://localhost:9091/login';
    };

    // Setup axios interceptors for handling JWT
    useEffect(() => {
        // Request interceptor - no need to manually set the JWT as it's in the cookie
        const requestInterceptor = api.interceptors.request.use(
            config => {
                // The JWT cookie will be automatically included due to withCredentials: true
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for handling JWT expiration
        const responseInterceptor = api.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 401) {
                    // JWT is expired or invalid
                    setAuthState({
                        user: null,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    redirectToLogin();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            // Clean up interceptors
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setAuthState({
                user: null,
                isAuthenticated: true,
                isLoading: false,
            });
            redirectToLogin();
        } catch (error) {
            console.error('Logout failed:', error);
            // Still redirect to login page even if logout API fails
            redirectToLogin();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...authState,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Export the auth hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export the axios instance for use in components
export const useApi = () => api; 