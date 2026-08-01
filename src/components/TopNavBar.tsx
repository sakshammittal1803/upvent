import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TopNavBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="bg-surface dark:bg-inverse-surface w-full top-0 sticky shadow-sm z-50 transition-colors duration-300">
            <div className="flex justify-between items-center w-full px-4 md:px-margin-desktop max-w-7xl mx-auto h-16">
                <div className="flex items-center gap-lg">
                    <span className="text-headline-md font-headline-md font-bold text-primary dark:text-primary-fixed-dim">Upvent</span>
                    <nav className="hidden md:flex gap-sm">
                        <Link to="/dashboard" className={`text-label-caps font-label-caps uppercase transition-all duration-200 ${location.pathname === '/dashboard' ? 'text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1' : 'text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim py-1'}`}>Dashboard</Link>
                        <Link to="/calendar" className={`text-label-caps font-label-caps uppercase transition-all duration-200 ${location.pathname === '/calendar' ? 'text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1' : 'text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim py-1'}`}>Calendar</Link>
                        <Link to="/connect" className={`text-label-caps font-label-caps uppercase transition-all duration-200 ${location.pathname === '/connect' ? 'text-primary dark:text-primary-fixed-dim border-b-2 border-primary dark:border-primary-fixed-dim pb-1' : 'text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-primary-fixed-dim py-1'}`}>Connect Accounts</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-sm">
                    <button onClick={() => navigate('/event/add')} className="gradient-btn text-on-primary font-label-caps text-label-caps uppercase h-10 px-sm rounded-xl flex items-center justify-center min-w-[120px] transition-transform hover:scale-105 ml-xs hidden sm:flex shadow-level-1 hover:shadow-level-2">
                        <span className="material-symbols-outlined mr-1 text-[18px]">add</span> Add Event
                    </button>
                    <Link to="/profile" className="ml-sm flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full">
                        <img alt="Student profile avatar" className="w-10 h-10 rounded-full object-cover border border-outline-variant hover:border-primary transition-colors" src={currentUser?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuCwwRPm-qlejzwVsxtEOtvnSDZxJ-Eq0n52g4DyV0BEPjPALGq_wjGU535d0U2-4SMgq3-VLFKnHe0arWSJ51oX_DuCwIx9t1ScN4crlB0g7eoKVNXdRWspeuvP7tr2Fsx6EepoRlFCGghLAy9aRZb8t3gfHFG0bH73topf7OnrVPOAuZ8ASitcepckxnOHwAOecSRa1YYQylZNelKW0zsQDwNeBoatvAMHrMeKBTuMM3G-QYUUWhqe"} />
                    </Link>
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                        className="md:hidden p-2 ml-1 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors"
                        aria-label="Toggle mobile menu"
                    >
                        <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-surface-container-lowest dark:bg-inverse-surface border-b border-outline-variant/30 shadow-level-2 z-40 animate-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col p-4 gap-2">
                        <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard" className={`p-3 rounded-lg font-label-caps uppercase ${location.pathname === '/dashboard' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant'}`}>Dashboard</Link>
                        <Link onClick={() => setIsMobileMenuOpen(false)} to="/calendar" className={`p-3 rounded-lg font-label-caps uppercase ${location.pathname === '/calendar' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant'}`}>Calendar</Link>
                        <Link onClick={() => setIsMobileMenuOpen(false)} to="/connect" className={`p-3 rounded-lg font-label-caps uppercase ${location.pathname === '/connect' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant'}`}>Connect Accounts</Link>
                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/event/add'); }} className="gradient-btn text-on-primary font-label-caps uppercase h-12 w-full mt-2 rounded-xl flex items-center justify-center shadow-level-1">
                            <span className="material-symbols-outlined mr-1 text-[18px]">add</span> Add Event
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default TopNavBar;
