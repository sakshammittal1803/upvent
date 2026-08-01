import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import SkeletonCard from '../components/SkeletonCard';
import { apiClient } from '../utils/apiClient';

interface Event {
    id: number;
    title: string;
    organizer: string;
    category: string;
    start_datetime: string;
    mode: string;
    source?: string;
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        apiClient('/api/events')
            .then(data => {
                if(Array.isArray(data)) {
                    setEvents(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(true);
                setLoading(false);
            });
    }, []);

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const safeTitle = e.title || '';
            const safeOrganizer = e.organizer || '';
            const safeCategory = e.category || '';
            const safeMode = e.mode || 'offline';
            
            const matchesFilter = filter === 'All' 
                ? true 
                : (filter === 'Online' || filter === 'Offline' 
                    ? safeMode.toLowerCase() === filter.toLowerCase()
                    : safeCategory.toLowerCase() === filter.toLowerCase());
                    
            const matchesSearch = safeTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  safeOrganizer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [events, filter, searchQuery]);

    return (
        <div className="font-sans text-on-background min-h-screen flex flex-col bg-background dark:bg-[#121212] dark:text-[#e1e3e4] transition-colors duration-300">
            <TopNavBar />
            
            <main className="flex-grow w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-lg gap-4">
                    <div>
                        <h1 className="font-headline-lg text-headline-lg mb-xs text-on-surface dark:text-primary-fixed-dim">Your Dashboard</h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-surface-variant">Stay on top of your academic and social events.</p>
                    </div>
                    
                    <div className="flex items-center gap-sm w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">search</span>
                            <input 
                                type="text" 
                                placeholder="Search events..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/20 hover:border-primary/50 bg-surface-container-lowest dark:bg-inverse-surface dark:text-surface-bright dark:border-outline-variant/30 transition-all duration-200"
                            />
                        </div>
                        <button onClick={() => navigate('/event/add')} className="gradient-btn text-on-primary font-label-caps text-label-caps uppercase h-10 px-sm rounded-xl flex items-center justify-center shadow-level-2 transition-transform hover:scale-105 whitespace-nowrap">
                            <span className="material-symbols-outlined mr-xs text-[18px]">add</span> Add Event
                        </button>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-xs overflow-x-auto pb-sm mb-md scrollbar-hide">
                    {['All', 'Hackathon', 'Webinar', 'Workshop', 'Online', 'Offline'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-sm py-xs rounded-full font-label-caps text-label-caps uppercase whitespace-nowrap border transition-colors ${filter === f ? 'bg-primary bg-opacity-10 text-primary border-primary' : 'bg-surface-container-lowest dark:bg-inverse-surface text-on-surface-variant dark:text-surface-variant border-outline-variant dark:border-outline-variant/30 hover:bg-surface-container dark:hover:bg-[#1a1c1e]'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mt-sm">
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : error ? (
                    <div className="bg-error-container/20 border border-error/30 rounded-2xl p-8 flex flex-col items-center justify-center mt-lg text-center">
                        <span className="material-symbols-outlined text-4xl text-error mb-4">cloud_off</span>
                        <h2 className="text-xl font-bold text-on-surface mb-2">Connection Failed</h2>
                        <p className="text-on-surface-variant max-w-md mb-6">We couldn't reach the server to fetch your events. Please check your connection and try again.</p>
                        <button onClick={() => window.location.reload()} className="px-6 py-2 border border-outline-variant rounded-xl font-semibold text-on-surface hover:bg-surface-container transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-xl mt-lg" id="empty-state-view">
                        <img alt="No events illustration" className="w-64 h-64 object-contain mb-lg opacity-90" src="https://lh3.googleusercontent.com/aida/AP1WRLvub482Wl1u1kNwoW3wlz7y_9s-zofX6zJ7OlgRifW_mpBqNYz9vQAtxnQlCmBM07zCGyxfQhR-cketmV-dHeJcOfwi9FiYDydWInAy4Zy-oT2byqzigf979YfgQZg8tIXxauCeFgxOA326xzpl1-GWEckd3rbm_0WzExN8nqs4k-tXUdcqrYh8c1Mm4ddl6j1iBu7fAOt8zwaSjvO41pXLMylBCK-fsEU71k69KYP57PReNCzxAJcSStE" />
                        <h2 className="font-headline-lg text-headline-lg text-on-background mb-xs">No events yet</h2>
                        <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg text-center max-w-md">Your schedule is completely clear. Start exploring campus activities or create your own event to get started.</p>
                        <button onClick={() => navigate('/event/add')} className="gradient-btn text-on-primary font-label-caps text-label-caps uppercase h-12 px-lg rounded-xl flex items-center justify-center shadow-level-2 transition-transform hover:scale-105">
                            Add your first event
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-md" id="dashboard-content">
                        {/* We group by Today, This Week, Later. For simplicity here we just list them */}
                        <section className="flex flex-col gap-sm lg:col-span-3">
                            <h2 className="font-headline-md text-headline-md text-on-background border-b border-surface-container-high pb-xs">Upcoming Events</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mt-sm">
                                {filteredEvents.map(event => (
                                    <div key={event.id} onClick={() => navigate(`/event/${event.id}`)} className="cursor-pointer bg-surface-container-lowest dark:bg-inverse-surface rounded-[16px] shadow-level-1 p-md relative hover:shadow-level-2 transition-shadow group flex flex-col border border-transparent dark:border-outline-variant/30 hover:border-primary/20">
                                        <div className="flex gap-xs mb-sm flex-wrap">
                                            <span className="px-xs py-[2px] rounded-full bg-secondary bg-opacity-10 text-secondary font-label-caps text-[10px] uppercase">{event.mode || 'Offline'}</span>
                                            <span className="px-xs py-[2px] rounded-full bg-primary bg-opacity-10 text-primary font-label-caps text-[10px] uppercase">{event.category || 'Event'}</span>
                                            
                                            <span className={`px-xs py-[2px] rounded-full font-label-caps text-[10px] uppercase flex items-center gap-[2px] ml-auto border ${
                                                event.source && event.source.toLowerCase() !== 'manual' 
                                                    ? 'bg-[#34a853]/5 text-[#34a853] border-[#34a853]/20' 
                                                    : 'bg-surface-variant/30 text-on-surface-variant border-surface-variant'
                                            }`}>
                                                <span className="material-symbols-outlined text-[12px]">
                                                    {event.source && event.source.toLowerCase() !== 'manual' ? 'auto_awesome' : 'edit_document'}
                                                </span>
                                                {event.source && event.source.toLowerCase() !== 'manual' ? `Extracted via ${event.source}` : 'Manual'}
                                            </span>
                                        </div>
                                        <h3 className="font-headline-md text-headline-md text-on-background mb-[2px] pr-lg leading-tight truncate">{event.title}</h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-md truncate">via {event.organizer || 'Unknown'}</p>
                                        <div className="flex items-center justify-between text-on-surface-variant mt-auto">
                                            <div className="flex items-center gap-base font-note text-note">
                                                <span className="material-symbols-outlined text-[16px]">event</span> {event.start_datetime && !isNaN(Date.parse(event.start_datetime)) ? new Date(event.start_datetime).toLocaleDateString() : 'TBD'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-surface-container-low dark:bg-background w-full mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-desktop py-md max-w-7xl mx-auto gap-sm">
                    <span className="text-body-lg font-body-lg font-bold text-primary dark:text-primary-fixed-dim">Upvent</span>
                    <nav className="flex flex-wrap justify-center gap-sm md:gap-md">
                        <a className="text-on-surface-variant dark:text-surface-variant text-label-caps font-label-caps uppercase hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="text-on-surface-variant dark:text-surface-variant text-label-caps font-label-caps uppercase hover:text-primary transition-colors" href="#">Terms of Service</a>
                        <a className="text-on-surface-variant dark:text-surface-variant text-label-caps font-label-caps uppercase hover:text-primary transition-colors" href="#">Support</a>
                    </nav>
                    <p className="text-body-sm font-body-sm text-on-surface-variant text-center md:text-right">
                        © 2024 Upvent Academic Vitality.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default DashboardPage;
