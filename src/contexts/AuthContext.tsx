import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
    logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            
            if (user) {
                // Sync user with backend SQLite database
                try {
                    await fetch('/api/users/sync', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            // Normally we would pass an auth token here, but the sync endpoint
                            // just trusts the payload for this specific implementation.
                            // In a strict production system, we'd pass the Bearer token and decode it on the backend.
                        },
                        body: JSON.stringify({
                            uid: user.uid,
                            email: user.email,
                            display_name: user.displayName,
                            photo_url: user.photoURL,
                            provider: user.providerData[0]?.providerId || 'firebase',
                            email_verified: user.emailVerified,
                        }),
                    });
                } catch (error) {
                    console.error("Failed to sync user to backend:", error);
                }
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const value = {
        currentUser,
        loading,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
