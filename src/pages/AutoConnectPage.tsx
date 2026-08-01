import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

const AutoConnectPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [isGmailConnected, setIsGmailConnected] = useState(false);
    const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [reviewQueue, setReviewQueue] = useState<any[]>([]);

    const [email, setEmail] = useState('');
    const [appPassword, setAppPassword] = useState('');
    const [savingAuth, setSavingAuth] = useState(false);
    
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;
        
        const fetchConnections = async () => {
            try {
                const q = query(collection(db, 'userConnections'), where('userId', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);
                const platforms: string[] = [];
                let gmailConnected = false;
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    platforms.push(data.platform);
                    if (data.platform === 'Gmail') gmailConnected = true;
                });
                
                setConnectedPlatforms(platforms);
                setIsGmailConnected(gmailConnected);
            } catch (error) {
                console.error("Failed to fetch connections", error);
            }
        };
        fetchConnections();
    }, [currentUser]);

    const platforms = [
        { name: 'Unstop', icon: 'emoji_events', subtitle: 'Auto-import hackathons and competitions', color: 'text-[#f50057]' },
        { name: 'Luma', icon: 'event', subtitle: 'Sync workshops and community events', color: 'text-[#e91e63]' },
        { name: 'Devfolio', icon: 'code', subtitle: 'Discover and sync global hackathons', color: 'text-[#3f51b5]' },
        { name: 'Devpost', icon: 'terminal', subtitle: 'Import virtual and in-person hackathons', color: 'text-[#009688]' },
        { name: 'Reskill', icon: 'school', subtitle: 'Sync coding challenges and webinars', color: 'text-[#9c27b0]' },
    ].map(p => ({
        ...p,
        isConnected: connectedPlatforms.includes(p.name),
        lastSynced: connectedPlatforms.includes(p.name) ? 'Just now' : ''
    }));

    const handleSaveCredentials = async () => {
        if (!currentUser) return alert("Please log in first");
        
        if (selectedPlatform === 'Gmail') {
            if (!email || !appPassword) return alert("Please enter both email and App Password");
            setSavingAuth(true);
            try {
                // Save to SQLite for Backend IMAP Sync
                const data = await apiClient('/api/credentials', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, appPassword })
                });
                
                if (data.success) {
                    // Save metadata to Firestore
                    await setDoc(doc(db, 'userConnections', `${currentUser.uid}_Gmail`), {
                        userId: currentUser.uid,
                        platform: 'Gmail',
                        email: email,
                        connectedAt: new Date().toISOString()
                    });
                    setIsGmailConnected(true);
                    setConnectedPlatforms(prev => [...prev, 'Gmail']);
                    setModalOpen(false);
                } else {
                    alert(data.error || 'Failed to save credentials');
                }
            } catch (error) {
                console.error('Auth error', error);
            } finally {
                setSavingAuth(false);
            }
        } else if (selectedPlatform) {
            setSavingAuth(true);
            try {
                // Save connection info to Firestore
                await setDoc(doc(db, 'userConnections', `${currentUser.uid}_${selectedPlatform}`), {
                    userId: currentUser.uid,
                    platform: selectedPlatform,
                    apiKey: appPassword, // using appPassword state field for the generic API key input
                    connectedAt: new Date().toISOString()
                });
                
                setConnectedPlatforms(prev => [...prev, selectedPlatform]);
                setModalOpen(false);
            } catch (error) {
                console.error('Failed to save connection to Firestore', error);
                alert("Failed to connect platform.");
            } finally {
                setSavingAuth(false);
            }
        }
    };

    const handleSyncPlatform = async (platform: string) => {
        setIsSyncing(true);
        try {
            const data = await apiClient(`/api/sync/mock/${platform}`, { method: 'POST' });
            if (data.success) {
                setReviewQueue(prev => [...prev, ...data.events]);
                alert(`Successfully synced ${data.count} historical events from ${platform}!`);
            } else {
                alert(data.error || 'Sync failed');
            }
        } catch (error) {
            console.error('Failed to sync', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSyncGmail = async () => {
        setIsSyncing(true);
        try {
            const data = await apiClient('/api/sync/imap', { method: 'POST' });
            if (data.success) {
                setReviewQueue(prev => [...prev, ...data.events]);
                alert(`Successfully synced ${data.count} historical events from Gmail!`);
            } else {
                alert(data.error || 'Sync failed');
            }
        } catch (error) {
            console.error('Failed to sync', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const openModal = (platform: string) => {
        setSelectedPlatform(platform);
        setModalOpen(true);
    };

    return (
        <div className="bg-surface-container-lowest text-on-surface dark:bg-[#121212] dark:text-[#e1e3e4] font-body-lg min-h-screen flex flex-col antialiased transition-colors duration-300">
            {/* Top App Bar */}
            <header className="w-full top-0 sticky z-10 bg-surface dark:bg-[#121212] shadow-level-1 h-16 flex items-center px-margin-desktop max-w-[1280px] mx-auto border-b border-surface-variant dark:border-outline-variant/30">
                <button onClick={() => navigate(-1)} className="mr-sm text-on-surface hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-variant">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="font-headline-md text-headline-md text-on-surface">Connect Accounts</h1>
            </header>

            <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin-desktop py-lg grid grid-cols-1 md:grid-cols-12 gap-md items-start">
                {/* Left Column: Platforms */}
                <div className="col-span-1 md:col-span-7 flex flex-col gap-sm">
                    <div className="mb-sm">
                        <h2 className="font-headline-md text-headline-md mb-xs">Data Sources</h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Automatically import and sync events from your preferred platforms.</p>
                    </div>

                    {/* Standard Platform Cards */}
                    {platforms.map(p => (
                        <div key={p.name} className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-level-1 p-md flex flex-col sm:flex-row items-start sm:items-center justify-between border border-surface-variant dark:border-outline-variant/30 gap-sm hover:shadow-level-2 transition-shadow">
                            <div className="flex items-center gap-sm">
                                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                                    <span className={`material-symbols-outlined ${p.color} text-[28px]`}>{p.icon}</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-xs">
                                        <h3 className="font-headline-md text-body-lg font-semibold">{p.name}</h3>
                                        {p.isConnected && (
                                            <span className="bg-[#34a853]/10 text-[#34a853] px-2 py-0.5 rounded-full font-label-caps text-label-caps flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span> Connected
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{p.subtitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-xs text-on-surface-variant">
                                {p.isConnected ? (
                                    <>
                                        <span className="font-note text-note mr-2">Last synced: {p.lastSynced}</span>
                                        <button onClick={() => handleSyncPlatform(p.name)} disabled={isSyncing} className="p-2 rounded-full hover:bg-surface-container transition-colors text-primary disabled:opacity-50" title="Sync now">
                                            <span className={`material-symbols-outlined ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => openModal(p.name)} className="bg-surface-container-lowest dark:bg-transparent border border-outline-variant dark:border-outline-variant/30 text-on-surface-variant dark:text-surface-variant px-4 py-2 rounded-lg font-body-sm text-body-sm font-semibold hover:bg-surface-container dark:hover:bg-[#222426] hover:text-on-surface dark:hover:text-surface-bright transition-colors">
                                        Connect
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Gmail Card */}
                    <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-level-1 p-md flex flex-col sm:flex-row items-start sm:items-center justify-between border border-primary/20 gap-sm bg-primary/5 dark:bg-primary/10 mt-sm">
                        <div className="flex items-center gap-sm">
                            <div className="w-12 h-12 rounded-lg bg-surface-container-lowest border border-surface-variant flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[#DB4437] text-[28px]">mail</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-xs">
                                    <h3 className="font-headline-md text-body-lg font-semibold">Gmail / SMTP</h3>
                                    {isGmailConnected && (
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-label-caps text-label-caps flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Connected
                                        </span>
                                    )}
                                </div>
                                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 flex items-center gap-2">
                                    {isSyncing ? (
                                        <><span className="material-symbols-outlined text-primary text-[16px] animate-spin">sync</span> Scanning for events...</>
                                    ) : (
                                        'Extract events from your inbox'
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {isGmailConnected ? (
                                <button onClick={handleSyncGmail} disabled={isSyncing} className="bg-primary text-white px-4 py-2 rounded-lg font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity min-h-[40px] disabled:opacity-50">
                                    Sync Inbox
                                </button>
                            ) : (
                                <button onClick={() => openModal('Gmail')} className="bg-surface-container-lowest dark:bg-transparent border border-outline-variant dark:border-outline-variant/30 text-on-surface-variant dark:text-surface-variant px-4 py-2 rounded-lg font-body-sm text-body-sm font-semibold hover:bg-surface-container dark:hover:bg-[#222426] hover:text-on-surface dark:hover:text-surface-bright transition-colors min-h-[40px]">
                                    Manage API
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-md bg-surface-container-low dark:bg-[#181a1c] rounded-xl p-md border border-surface-variant dark:border-outline-variant/30">
                        <h3 className="font-headline-md text-body-lg font-semibold mb-xs flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">security</span> Privacy Note
                        </h3>
                        <p className="font-note text-note text-on-surface-variant">Upvent only scans for calendar invites, event confirmations, and ticketing emails. We do not store or read personal correspondence. <a className="text-primary hover:underline" href="#">Read our privacy policy</a>.</p>
                    </div>
                </div>

                {/* Right Column: Review Queue */}
                <div className="col-span-1 md:col-span-5 flex flex-col gap-sm">
                    <div className="mb-sm flex items-center justify-between">
                        <h2 className="font-headline-md text-headline-md mb-xs">Review Queue</h2>
                        {reviewQueue.length > 0 && <span className="bg-primary text-white font-label-caps text-label-caps px-2 py-1 rounded-full">{reviewQueue.length} New</span>}
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-xs">We found these events based on your recent activity. Review to add to your calendar.</p>
                    <div className="flex flex-col gap-xs">
                        {reviewQueue.map((event, idx) => (
                            <div key={idx} className="bg-surface-container-lowest dark:bg-inverse-surface rounded-lg shadow-level-1 p-sm border border-surface-variant dark:border-outline-variant/30 flex flex-col gap-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="font-label-caps text-label-caps text-on-surface-variant mb-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">mail</span> {event.source}
                                        </span>
                                        <h4 className="font-headline-md text-body-lg">{event.title}</h4>
                                        <p className="font-note text-note text-on-surface-variant">Organizer: {event.organizer}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-surface-variant">
                                    <button className="p-1.5 rounded-md text-[#34a853] hover:bg-[#34a853]/10 transition-colors flex items-center gap-1 font-label-caps text-label-caps pl-2 pr-3 bg-[#34a853]/5 border border-[#34a853]/20" title="Saved">
                                        <span className="material-symbols-outlined text-[18px]">check</span> Added to Dashboard
                                    </button>
                                </div>
                            </div>
                        ))}
                        {reviewQueue.length === 0 && (
                            <div className="text-center py-lg text-on-surface-variant">No new events to review. Click sync!</div>
                        )}
                    </div>
                </div>
            </main>

            {/* API Key Modal */}
            {modalOpen && (
                <>
                    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40" onClick={() => setModalOpen(false)}></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-margin-mobile pointer-events-none">
                        <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-level-2 w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto flex flex-col border border-surface-variant dark:border-outline-variant/30">
                            <div className="flex items-center justify-between p-md border-b border-surface-variant dark:border-outline-variant/30 sticky top-0 bg-surface-container-lowest dark:bg-inverse-surface z-10">
                                <h2 className="font-headline-md text-headline-md">Manage {selectedPlatform} API</h2>
                                <button onClick={() => setModalOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-container">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-md flex flex-col gap-lg">
                                <div>
                                    <h3 className="font-headline-md text-body-lg font-semibold mb-xs">Add New Connection</h3>
                                    
                                    <div className="mb-sm bg-surface-container-low dark:bg-[#181a1c] p-sm rounded-lg border border-surface-variant dark:border-outline-variant/30 text-body-sm text-on-surface-variant">
                                        <h4 className="font-semibold text-on-surface mb-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">info</span> How to get your API Key
                                        </h4>
                                        <ol className="list-decimal pl-5 space-y-1">
                                            {selectedPlatform === 'Gmail' && (
                                                <>
                                                    <li>Go to your <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google Account Security page</a>.</li>
                                                    <li>Ensure <strong>2-Step Verification</strong> is turned on.</li>
                                                    <li>Search for <strong>"App passwords"</strong> in the top search bar.</li>
                                                    <li>Create a new app password (name it "Upvent") and copy the 16-character code.</li>
                                                </>
                                            )}
                                            {selectedPlatform === 'Unstop' && (
                                                <>
                                                    <li>Log in to your <strong>Unstop</strong> account.</li>
                                                    <li>Go to your Profile icon {'>'} <strong>Settings</strong> {'>'} <strong>API Access</strong>.</li>
                                                    <li>Click on <strong>Generate New Token</strong>.</li>
                                                    <li>Copy the generated token and paste it below.</li>
                                                </>
                                            )}
                                            {selectedPlatform === 'Luma' && (
                                                <>
                                                    <li>Log in to <strong>lu.ma</strong>.</li>
                                                    <li>Navigate to <strong>Account Settings</strong> {'>'} <strong>Developer</strong>.</li>
                                                    <li>Click on <strong>Create API Key</strong>.</li>
                                                    <li>Name the key "Upvent Sync" and copy it.</li>
                                                </>
                                            )}
                                            {selectedPlatform === 'Devfolio' && (
                                                <>
                                                    <li>Log in to your <strong>Devfolio</strong> Organizer Dashboard.</li>
                                                    <li>Go to <strong>Settings</strong> {'>'} <strong>API Keys</strong>.</li>
                                                    <li>Click <strong>Create Key</strong> and copy the generated token.</li>
                                                </>
                                            )}
                                            {selectedPlatform === 'Devpost' && (
                                                <>
                                                    <li>Log in to your <strong>Devpost</strong> account.</li>
                                                    <li>Go to your <strong>Organizer Dashboard</strong> {'>'} <strong>API Settings</strong>.</li>
                                                    <li>Locate and copy your <strong>Integration Token</strong>.</li>
                                                </>
                                            )}
                                            {selectedPlatform === 'Reskill' && (
                                                <>
                                                    <li>Log in to <strong>Reskill</strong>.</li>
                                                    <li>Navigate to <strong>Profile</strong> {'>'} <strong>Integrations</strong>.</li>
                                                    <li>Generate a new <strong>Personal Access Token</strong> and copy it.</li>
                                                </>
                                            )}
                                        </ol>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-sm items-end">
                                        {selectedPlatform === 'Gmail' && (
                                            <div className="flex-grow w-full">
                                                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Email Address</label>
                                                <input value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-lg border border-outline-variant focus:border-primary focus:ring focus:ring-primary/10 font-body-sm text-body-sm text-on-surface h-10 px-3 bg-transparent" placeholder="student@university.edu" type="email" />
                                            </div>
                                        )}
                                        <div className="flex-grow w-full">
                                            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
                                                {selectedPlatform === 'Gmail' ? 'App Password' : 'API Key'}
                                            </label>
                                            <input value={selectedPlatform === 'Gmail' ? appPassword : ''} onChange={e => selectedPlatform === 'Gmail' ? setAppPassword(e.target.value) : null} className="w-full rounded-lg border border-outline-variant focus:border-primary focus:ring focus:ring-primary/10 font-body-sm text-body-sm text-on-surface h-10 px-3 bg-transparent" placeholder="••••••••••••••••" type="password" />
                                        </div>
                                        <button onClick={handleSaveCredentials} disabled={savingAuth} className="gradient-btn text-white px-6 py-2 rounded-lg font-body-sm text-body-sm font-semibold hover:opacity-90 transition-opacity h-10 w-full sm:w-auto whitespace-nowrap disabled:opacity-50">
                                            {savingAuth ? 'Saving...' : 'Add Key'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AutoConnectPage;
