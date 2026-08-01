import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

// Define the global Google object type for TS
declare global {
    interface Window {
        google?: any;
    }
}

export const useOneTapLogin = (isPublicPage: boolean = true) => {
    const { currentUser, loading } = useAuth();
    const navigate = useNavigate();
    const [isOneTapLoaded, setIsOneTapLoaded] = useState(false);

    useEffect(() => {
        // Do not show on authenticated pages or if already loading/logged in
        if (!isPublicPage || loading || currentUser) {
            return;
        }

        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.error("Google Client ID is missing. One Tap cannot initialize.");
            return;
        }

        const handleCredentialResponse = async (response: any) => {
            try {
                // Exchange Google ID token for Firebase Auth
                const credential = GoogleAuthProvider.credential(response.credential);
                await signInWithCredential(auth, credential);
                
                // On success, redirect to dashboard
                navigate('/dashboard');
            } catch (error) {
                console.error("Error during One Tap authentication:", error);
                // Graceful fallback: do nothing, user can still use manual login
            }
        };

        const initializeGSI = () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                    cancel_on_tap_outside: false,
                    // Prevent annoying auto-select if they have multiple accounts or just logged out
                    auto_select: false, 
                });
                
                // Display the prompt
                window.google.accounts.id.prompt((notification: any) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // User closed it or browser blocked it, gracefully handle
                        console.log("One Tap not displayed or skipped:", notification.getNotDisplayedReason());
                    }
                });
                setIsOneTapLoaded(true);
            }
        };

        // Load the GSI script if not already loaded
        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGSI;
            document.head.appendChild(script);
        } else {
            initializeGSI();
        }

        // Cleanup: cancel prompt if component unmounts
        return () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.cancel();
            }
        };
    }, [currentUser, loading, navigate, isPublicPage]);

    return { isOneTapLoaded };
};
