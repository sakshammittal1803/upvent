import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import { apiClient } from '../utils/apiClient';

import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [stats, setStats] = useState({ totalEvents: 0, autoSynced: 0, manual: 0 });

    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        
        // Fetch stats
        apiClient('/api/events')
            .then(data => {
                if (Array.isArray(data)) {
                    const autoSynced = data.filter((e: any) => e.source && e.source.toLowerCase() !== 'manual').length;
                    const manual = data.length - autoSynced;
                    setStats({ totalEvents: data.length, autoSynced, manual });
                }
            })
            .catch(err => console.error(err));
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDarkMode(true);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <div className="font-sans text-on-background min-h-screen flex flex-col bg-background dark:bg-[#121212] dark:text-[#e1e3e4] transition-colors duration-300">
            <TopNavBar />
            
            <main className="flex-grow w-full max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-xl">
                <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-[24px] shadow-level-1 overflow-hidden transition-colors duration-300">
                    
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-primary to-secondary relative">
                        <div className="absolute -bottom-12 left-md md:left-lg">
                            <img alt="User avatar" className="w-[96px] h-[96px] rounded-full object-cover border-4 border-surface-container-lowest dark:border-inverse-surface shadow-md" src={currentUser?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuCwwRPm-qlejzwVsxtEOtvnSDZxJ-Eq0n52g4DyV0BEPjPALGq_wjGU535d0U2-4SMgq3-VLFKnHe0arWSJ51oX_DuCwIx9t1ScN4crlB0g7eoKVNXdRWspeuvP7tr2Fsx6EepoRlFCGghLAy9aRZb8t3gfHFG0bH73topf7OnrVPOAuZ8ASitcepckxnOHwAOecSRa1YYQylZNelKW0zsQDwNeBoatvAMHrMeKBTuMM3G-QYUUWhqe"} />
                        </div>
                    </div>

                    <div className="pt-16 px-md md:px-lg pb-lg">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-md mb-xl">
                            <div>
                                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface dark:text-primary-fixed-dim">{currentUser?.displayName || "Student Developer"}</h1>
                                <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant">{currentUser?.email || "student@university.edu"}</p>
                            </div>
                            <button onClick={handleLogout} className="px-md py-xs rounded-full border border-outline-variant text-error dark:text-error-container hover:bg-error-container/10 transition-colors font-label-caps uppercase text-sm font-semibold whitespace-nowrap self-start">
                                Log Out
                            </button>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm mb-xl">
                            <div className="bg-surface-container-low dark:bg-[#222426] p-md rounded-xl text-center border border-transparent dark:border-outline-variant/20">
                                <span className="block font-headline-lg text-3xl font-bold text-primary dark:text-primary-fixed">{stats.totalEvents}</span>
                                <span className="font-label-caps text-on-surface-variant dark:text-surface-variant uppercase text-xs">Total Events</span>
                            </div>
                            <div className="bg-surface-container-low dark:bg-[#222426] p-md rounded-xl text-center border border-transparent dark:border-outline-variant/20">
                                <span className="block font-headline-lg text-3xl font-bold text-[#34a853]">{stats.autoSynced}</span>
                                <span className="font-label-caps text-on-surface-variant dark:text-surface-variant uppercase text-xs">Auto-Synced</span>
                            </div>
                            <div className="bg-surface-container-low dark:bg-[#222426] p-md rounded-xl text-center border border-transparent dark:border-outline-variant/20">
                                <span className="block font-headline-lg text-3xl font-bold text-secondary dark:text-secondary-fixed">{stats.manual}</span>
                                <span className="font-label-caps text-on-surface-variant dark:text-surface-variant uppercase text-xs">Manual Entries</span>
                            </div>
                        </div>

                        {/* Settings Section */}
                        <div className="mb-md border-t border-outline-variant/30 pt-md">
                            <h2 className="font-headline-md text-headline-md font-semibold text-on-surface dark:text-primary-fixed-dim mb-sm">Settings</h2>
                            
                            <div className="flex items-center justify-between p-sm bg-surface-container-low dark:bg-[#222426] rounded-xl border border-transparent dark:border-outline-variant/20">
                                <div className="flex items-center gap-sm">
                                    <div className="p-xs bg-surface-variant dark:bg-tertiary rounded-full text-on-surface-variant dark:text-on-tertiary flex items-center justify-center">
                                        <span className="material-symbols-outlined">{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-body-lg text-on-surface dark:text-surface-bright">Dark Theme</h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline">Toggle dark mode for the application</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-surface-variant dark:bg-tertiary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary dark:peer-checked:bg-primary-fixed after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-on-primary-fixed after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                </label>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
