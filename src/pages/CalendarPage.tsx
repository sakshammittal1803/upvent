import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import { apiClient } from '../utils/apiClient';
import { 
    format, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
    isSameMonth, isSameDay, parseISO, addWeeks, subWeeks, addDays as addDaysToDate,
    subDays, isToday, isAfter
} from 'date-fns';

interface Event {
    id: number;
    title: string;
    organizer: string;
    category: string;
    start_datetime: string;
    end_datetime?: string;
    mode: string;
    source?: string;
    venue?: string;
    description?: string;
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

const getCategoryColor = (category: string, isDark: boolean = false) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('hackathon')) return isDark ? 'bg-purple-900/40 text-purple-200 border-purple-500/50' : 'bg-purple-100 text-purple-800 border-purple-200';
    if (cat.includes('workshop')) return isDark ? 'bg-blue-900/40 text-blue-200 border-blue-500/50' : 'bg-blue-100 text-blue-800 border-blue-200';
    if (cat.includes('webinar')) return isDark ? 'bg-emerald-900/40 text-emerald-200 border-emerald-500/50' : 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (cat.includes('seminar')) return isDark ? 'bg-amber-900/40 text-amber-200 border-amber-500/50' : 'bg-amber-100 text-amber-800 border-amber-200';
    return isDark ? 'bg-surface-variant/50 text-primary-fixed-dim border-outline-variant' : 'bg-primary/10 text-primary border-primary/20';
};

const CalendarPage: React.FC = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewMode>('month');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Handle Escape key for modals
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (selectedEvent) setSelectedEvent(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedEvent]);

    // Initial fetch & Polling
    useEffect(() => {
        const fetchEvents = () => {
            apiClient('/api/events')
                .then(data => {
                    if (Array.isArray(data)) setEvents(data);
                })
                .catch(err => console.error('Failed to sync events:', err));
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 30000); // 30s polling
        
        // Theme check
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        setIsDarkMode(document.documentElement.classList.contains('dark'));
        
        return () => {
            clearInterval(interval);
            observer.disconnect();
        };
    }, []);

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            if (!searchQuery) return true;
            return e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   e.organizer?.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [events, searchQuery]);

    const upcomingEvents = useMemo(() => {
        const now = new Date();
        return filteredEvents
            .filter(e => e.start_datetime && !isNaN(Date.parse(e.start_datetime)) && isAfter(parseISO(e.start_datetime), now))
            .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
            .slice(0, 5);
    }, [filteredEvents]);

    // Navigation Handlers
    const next = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else if (view === 'day') setCurrentDate(addDaysToDate(currentDate, 1));
    };
    
    const prev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else if (view === 'day') setCurrentDate(subDays(currentDate, 1));
    };

    const goToToday = () => setCurrentDate(new Date());

    // Month View Render
    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                // Get events for this day
                const dayEvents = filteredEvents.filter(e => e.start_datetime && !isNaN(Date.parse(e.start_datetime)) && isSameDay(parseISO(e.start_datetime), cloneDay));

                days.push(
                    <div 
                        key={day.toString()} 
                        className={`min-h-[120px] p-2 border-b border-r border-outline-variant/30 flex flex-col transition-colors duration-200
                            ${!isCurrentMonth ? 'bg-surface-container-low/50 dark:bg-[#121212]' : 'bg-surface-container-lowest dark:bg-inverse-surface hover:bg-surface-container-low dark:hover:bg-[#1a1c1e]'}
                        `}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold
                                ${isTodayDate ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface dark:text-surface-bright'}
                                ${!isCurrentMonth && !isTodayDate ? 'opacity-30' : ''}
                            `}>
                                {formattedDate}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                            {dayEvents.slice(0, 3).map(event => (
                                <div 
                                    key={event.id}
                                    onClick={() => setSelectedEvent(event)}
                                    className={`text-xs px-2 py-1 rounded-md border cursor-pointer truncate shadow-sm hover:shadow-md transition-shadow group relative ${getCategoryColor(event.category, isDarkMode)}`}
                                >
                                    <span className="font-semibold">{format(parseISO(event.start_datetime), 'HH:mm')}</span> {event.title}
                                    
                                    {/* Tooltip on Hover */}
                                    <div className="hidden group-hover:block absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-surface text-on-surface dark:bg-[#222426] dark:text-e1e3e4 rounded-xl shadow-level-3 border border-outline-variant/20 whitespace-normal">
                                        <div className="font-bold text-sm mb-1">{event.title}</div>
                                        <div className="text-xs text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> {format(parseISO(event.start_datetime), 'h:mm a')}</div>
                                        <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-[12px]">business</span> {event.organizer || 'Unknown Organizer'}</div>
                                    </div>
                                </div>
                            ))}
                            {dayEvents.length > 3 && (
                                <div className="text-xs text-primary font-semibold text-center cursor-pointer hover:underline">
                                    +{dayEvents.length - 3} more
                                </div>
                            )}
                        </div>
                    </div>
                );
                day = addDaysToDate(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div className="flex flex-col flex-1 border-t border-l border-outline-variant/30 rounded-tl-xl overflow-hidden bg-surface-container-lowest dark:bg-inverse-surface shadow-level-1">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-outline-variant/30 bg-surface-container-low dark:bg-[#181a1c]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => (
                        <div key={idx} className="p-3 text-center text-sm font-label-caps uppercase text-on-surface-variant dark:text-surface-variant border-r border-outline-variant/30 font-semibold">
                            {dayName}
                        </div>
                    ))}
                </div>
                {rows}
            </div>
        );
    };

    const renderAgendaView = () => {
        // Group events by day
        const groupedEvents: { [key: string]: Event[] } = {};
        
        filteredEvents
            .filter(e => e.start_datetime && !isNaN(Date.parse(e.start_datetime)))
            .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
            .forEach(e => {
                const dateKey = format(parseISO(e.start_datetime), 'yyyy-MM-dd');
                if (!groupedEvents[dateKey]) groupedEvents[dateKey] = [];
                groupedEvents[dateKey].push(e);
            });

        return (
            <div className="flex flex-col gap-lg pb-xl max-w-4xl mx-auto w-full">
                {Object.keys(groupedEvents).map(dateKey => {
                    const dayEvents = groupedEvents[dateKey];
                    const dateObj = parseISO(dateKey);
                    const isTodayDate = isToday(dateObj);

                    return (
                        <div key={dateKey} className="flex flex-col md:flex-row gap-md relative">
                            <div className="w-32 flex-shrink-0 pt-2 sticky top-24 z-10 bg-background dark:bg-[#121212] md:bg-transparent pb-2 md:pb-0">
                                <h3 className={`text-2xl font-bold ${isTodayDate ? 'text-primary' : 'text-on-surface dark:text-surface-bright'}`}>
                                    {format(dateObj, 'MMM d')}
                                </h3>
                                <p className="text-on-surface-variant font-label-caps uppercase text-sm">{format(dateObj, 'EEEE')}</p>
                            </div>
                            <div className="flex-1 space-y-3">
                                {dayEvents.map(event => (
                                    <div 
                                        key={event.id}
                                        onClick={() => setSelectedEvent(event)}
                                        className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/40 rounded-[16px] p-4 flex gap-4 cursor-pointer hover:shadow-level-2 transition-shadow group relative overflow-hidden"
                                    >
                                        <div className={`w-1.5 absolute left-0 top-0 bottom-0 ${getCategoryColor(event.category, isDarkMode).split(' ')[1]}`}></div>
                                        <div className="flex-1 ml-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-headline-md text-on-surface dark:text-primary-fixed-dim font-bold">{event.title}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(event.category, isDarkMode)}`}>
                                                    {event.category || 'Event'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant mt-2">
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {format(parseISO(event.start_datetime), 'h:mm a')}</span>
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span> {event.mode || 'Offline'}</span>
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">business</span> {event.organizer || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {Object.keys(groupedEvents).length === 0 && (
                    <div className="text-center py-xl text-on-surface-variant">
                        No events found matching your criteria.
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="font-sans text-on-background min-h-screen flex flex-col bg-background dark:bg-[#121212] dark:text-[#e1e3e4] transition-colors duration-300">
            <TopNavBar />
            
            <main className="flex-grow flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto px-margin-mobile md:px-margin-desktop py-md gap-lg">
                
                {/* Main Calendar Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Calendar Header Tools */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-md gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={goToToday} className="px-4 py-2 rounded-xl bg-surface-container-low dark:bg-[#222426] border border-outline-variant/30 font-semibold text-sm hover:bg-surface-container transition-colors">
                                Today
                            </button>
                            <div className="flex items-center gap-1">
                                <button onClick={prev} className="p-2 rounded-full hover:bg-surface-container dark:hover:bg-[#222426] transition-colors">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <h2 className="text-xl font-bold w-48 text-center text-on-surface dark:text-primary-fixed-dim">
                                    {format(currentDate, view === 'agenda' ? 'yyyy' : 'MMMM yyyy')}
                                </h2>
                                <button onClick={next} className="p-2 rounded-full hover:bg-surface-container dark:hover:bg-[#222426] transition-colors">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-sm w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                            <div className="relative flex-1 md:w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                                <input 
                                    type="text" 
                                    placeholder="Search calendar..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/20 hover:border-primary/50 bg-surface-container-lowest dark:bg-inverse-surface dark:text-surface-bright dark:border-outline-variant/30 text-sm h-10 transition-all duration-200"
                                />
                            </div>
                            
                            <div className="flex bg-surface-container-low dark:bg-[#222426] p-1 rounded-xl border border-outline-variant/30 h-10">
                                {['month', 'agenda'].map(v => (
                                    <button 
                                        key={v}
                                        onClick={() => setView(v as ViewMode)}
                                        className={`px-3 py-1 rounded-lg text-sm font-semibold capitalize transition-all ${view === v ? 'bg-surface-container-lowest dark:bg-inverse-surface shadow-sm text-primary dark:text-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                            
                            <button onClick={() => navigate('/event/add')} className="gradient-btn text-on-primary font-semibold text-sm h-10 px-4 rounded-xl flex items-center justify-center shadow-level-1 transition-transform hover:scale-105 whitespace-nowrap ml-xs">
                                <span className="material-symbols-outlined mr-1 text-[18px]">add</span> Add
                            </button>
                        </div>
                    </div>

                    {/* View Container */}
                    <div className="flex-1 bg-surface-container-lowest dark:bg-transparent rounded-[24px] flex flex-col overflow-hidden relative">
                        {view === 'month' && renderMonthView()}
                        {view === 'agenda' && renderAgendaView()}
                    </div>
                </div>

                {/* Right Sidebar - Upcoming Events */}
                <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-md">
                    <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-[24px] shadow-level-1 p-lg border border-outline-variant/30">
                        <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-primary-fixed-dim mb-md border-b border-outline-variant/30 pb-2">Upcoming Events</h3>
                        
                        {upcomingEvents.length === 0 ? (
                            <p className="text-on-surface-variant text-sm">No upcoming events scheduled.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {upcomingEvents.map(event => (
                                    <div key={event.id} onClick={() => setSelectedEvent(event)} className="flex gap-3 cursor-pointer group">
                                        <div className="flex flex-col items-center bg-surface-container-low dark:bg-[#222426] rounded-lg p-2 min-w-[50px] border border-transparent group-hover:border-primary/30 transition-colors">
                                            <span className="text-[10px] uppercase font-bold text-on-surface-variant">{format(parseISO(event.start_datetime), 'MMM')}</span>
                                            <span className="text-lg font-bold text-primary dark:text-primary-fixed">{format(parseISO(event.start_datetime), 'd')}</span>
                                        </div>
                                        <div className="flex flex-col justify-center overflow-hidden">
                                            <h4 className="text-sm font-bold text-on-surface dark:text-surface-bright truncate group-hover:text-primary transition-colors">{event.title}</h4>
                                            <span className="text-xs text-on-surface-variant truncate">{event.organizer}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button onClick={() => setView('agenda')} className="w-full mt-6 py-2 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container-low dark:hover:bg-[#222426] transition-colors">
                            View All
                        </button>
                    </div>

                    <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-[24px] shadow-level-1 p-lg border border-outline-variant/30">
                        <h3 className="font-headline-md text-headline-md font-bold text-on-surface dark:text-primary-fixed-dim mb-md border-b border-outline-variant/30 pb-2">Calendars</h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant" />
                                <span className="text-sm font-medium">My Events</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant" />
                                <span className="text-sm font-medium">Extracted via Integrations</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant" />
                                <span className="text-sm font-medium">University Academic</span>
                            </label>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div onClick={() => setSelectedEvent(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div onClick={(e) => e.stopPropagation()} className="bg-surface-container-lowest dark:bg-inverse-surface w-full max-w-2xl rounded-2xl shadow-level-3 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                        
                        <div className={`h-40 w-full ${getCategoryColor(selectedEvent.category, isDarkMode).split(' ')[0]} flex items-end p-6 relative overflow-hidden`}>
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                            
                            <h2 className="text-3xl font-bold text-on-surface dark:text-primary-fixed-dim z-10 drop-shadow-md">{selectedEvent.title}</h2>
                        </div>
                        
                        <div className="p-6 md:p-8 flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex gap-3 text-on-surface-variant dark:text-surface-variant">
                                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">event</span>
                                    <div>
                                        <p className="font-semibold text-on-surface dark:text-surface-bright">Date</p>
                                        <p className="text-sm">{selectedEvent.start_datetime && !isNaN(Date.parse(selectedEvent.start_datetime)) ? format(parseISO(selectedEvent.start_datetime), 'EEEE, MMMM d, yyyy') : 'TBD'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-on-surface-variant dark:text-surface-variant">
                                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">schedule</span>
                                    <div>
                                        <p className="font-semibold text-on-surface dark:text-surface-bright">Time</p>
                                        <p className="text-sm">{selectedEvent.start_datetime && !isNaN(Date.parse(selectedEvent.start_datetime)) ? format(parseISO(selectedEvent.start_datetime), 'h:mm a') : 'TBD'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-on-surface-variant dark:text-surface-variant">
                                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">location_on</span>
                                    <div>
                                        <p className="font-semibold text-on-surface dark:text-surface-bright">Venue/Mode</p>
                                        <p className="text-sm">{selectedEvent.mode || 'TBD'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-on-surface-variant dark:text-surface-variant">
                                    <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim">business</span>
                                    <div>
                                        <p className="font-semibold text-on-surface dark:text-surface-bright">Organizer</p>
                                        <p className="text-sm">{selectedEvent.organizer || 'Unknown'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-2 border-t border-outline-variant/30 pt-6">
                                <h3 className="font-headline-md font-bold text-on-surface dark:text-primary-fixed-dim mb-2">About this event</h3>
                                <p className="text-on-surface-variant dark:text-surface-variant leading-relaxed text-sm">
                                    {selectedEvent.description || "No description provided for this event. Reach out to the organizer for more details."}
                                </p>
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/30">
                                <button className="px-5 py-2 rounded-xl border border-outline-variant font-semibold text-on-surface hover:bg-surface-container transition-colors">
                                    Share
                                </button>
                                <button onClick={() => navigate(`/event/${selectedEvent.id}`)} className="px-5 py-2 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 shadow-level-1 transition-all">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
