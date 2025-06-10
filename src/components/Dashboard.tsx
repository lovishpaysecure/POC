import React, { useEffect, useState } from 'react';
import { useAuth, useApi } from '../contexts/AuthContext';

interface DashboardData {
    // Add your dashboard data interface here
    title: string;
    content: string;
}

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const api = useApi();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Example API call - replace with your actual endpoint
                const response = await api.get('/dashboard/data');
                setDashboardData(response.data);
                setError(null);
            } catch (err) {
                // If it's a 401, it will be handled by the interceptor
                // This is for other types of errors
                setError('Failed to fetch dashboard data');
                console.error('Dashboard data fetch error:', err);
            }
        };

        fetchDashboardData();
    }, [api]);

    if (error) {
        return (
            <div className="dashboard error">
                <p>{error}</p>
                <button onClick={() => logout()}>Logout</button>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <h1>Welcome to Dashboard</h1>
            <p>Hello, {user?.username}!</p>
            
            {dashboardData && (
                <div className="dashboard-content">
                    <h2>{dashboardData.title}</h2>
                    <p>{dashboardData.content}</p>
                </div>
            )}

            <button onClick={() => logout()}>Logout</button>
        </div>
    );
}; 