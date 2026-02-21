import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is logged in on mount
        const checkUserLoggedIn = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    // Verify token is still valid by fetching latest profile
                    const profile = await authService.getProfile();
                    // Merge local token with fresh profile data
                    setUser({ ...profile, token: JSON.parse(storedUser).token });
                } catch (err) {
                    console.error("Session expired or invalid:", err);
                    setUser(null);
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkUserLoggedIn();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const userData = await authService.login(email, password);
            setUser(userData);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const userData = await authService.register(email, password);
            setUser(userData);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
