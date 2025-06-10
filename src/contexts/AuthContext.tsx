import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to get JWT token from cookies
const getJwtFromCookies = () => {
    const cookies = document.cookie.split(';');
    const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('JWT_TOKEN='));
    return jwtCookie ? jwtCookie.split('=')[1].trim() : null;
};

// Create axios instance with default config
const api = axios.create({
    withCredentials: true,
    baseURL: 'http://localhost:9091/',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: true,
        isLoading: false,
    });

    const redirectToLogin = () => {
        window.location.href = 'http://localhost:9091/login';
    };

    // Setup axios interceptors for handling JWT
    useEffect(() => {
        // Request interceptor to add JWT token from cookies
        const requestInterceptor = api.interceptors.request.use(
            config => {
                const token = getJwtFromCookies();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
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

        // Initial auth check
        const token = getJwtFromCookies();
        if (!token) {
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }

        return () => {
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