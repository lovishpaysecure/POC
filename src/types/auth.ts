export interface User {
    username: string;
    // Add any other user properties you need
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface LoginCredentials {
    username: string;
    password: string;
} 