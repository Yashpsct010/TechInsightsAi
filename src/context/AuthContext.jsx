/* eslint-disable react-refresh/only-export-components */
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
        let isMounted = true; // Prevent state updates after unmount

        // Check if user is logged in on mount
        const checkUserLoggedIn = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                if (isMounted) setLoading(false);
                return;
            }

            try {
                const parsedUser = JSON.parse(storedUser);

                // Add timeout to prevent hanging on poor networks
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

                // Verify token is still valid by fetching latest profile
                const profile = await authService.getProfile({ signal: controller.signal });
                clearTimeout(timeoutId);

                // Merge local token with fresh profile data
                if (isMounted) {
                    setUser({ 
                      ...profile, 
                      token: parsedUser.token,
                      bookmarks: profile.bookmarks || [] 
                    });
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Session check failed:", err);
                    // Only logout if it's a 401/Invalid token, not for network timeouts
                    if (err.message && (err.message.includes("401") || err.message.includes("Invalid"))) {
                        setUser(null);
                        localStorage.removeItem('user');
                    } else {
                        console.warn("Session check failed due to network/timeout. Letting the user try again.");
                    }
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        checkUserLoggedIn();

        return () => {
            isMounted = false; // Cleanup on unmount
        };
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const userData = await authService.login(email, password);
            setUser({
                ...userData,
                bookmarks: userData.bookmarks || []
            });
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
            setUser({
                ...userData,
                bookmarks: userData.bookmarks || [] // normalize same as login
            });
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

    const updatePreferences = async (preferences, newsletterSubscribed) => {
        try {
            const data = await authService.updatePreferences(preferences, newsletterSubscribed);
            setUser(prev => ({ ...prev, preferences: data.preferences, newsletterSubscribed: data.newsletterSubscribed }));
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const toggleBookmark = async (blogId) => {
        try {
            // Determine if we are adding or removing based on the snapshot
            const currentBookmarksSnapshot = user?.bookmarks || [];
            const isAdding = !currentBookmarksSnapshot.some(b => 
                (typeof b === 'string' ? b : b._id) === blogId
            );

            // Optimistic update: use functional update to avoid race conditions with other toggles
            setUser(prev => {
                const current = prev?.bookmarks || [];
                const nextBookmarks = isAdding
                    ? [...current, blogId]
                    : current.filter(b => (typeof b === 'string' ? b : b._id) !== blogId);
                return { ...prev, bookmarks: nextBookmarks };
            });

            // Then sync with server in background
            try {
                const updatedBookmarks = await authService.toggleBookmark(blogId);
                // Server returned different result than our optimistic update - sync
                setUser(prev => ({ ...prev, bookmarks: updatedBookmarks }));
                return true;
            } catch (serverErr) {
                // Rollback on failure using functional update
                console.error("Bookmark sync failed, rolling back:", serverErr);
                setUser(prev => {
                    const current = prev?.bookmarks || [];
                    // Reverse the optimistic operation
                    const rbBookmarks = isAdding
                        ? current.filter(b => (typeof b === 'string' ? b : b._id) !== blogId)
                        : [...current, blogId];
                    return { ...prev, bookmarks: rbBookmarks };
                });
                setError("Failed to save bookmark: " + serverErr.message);
                return false;
            }
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updatePreferences,
        toggleBookmark,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
