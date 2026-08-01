import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

interface Task {
    id: number;
    label: string;
    is_done: boolean;
}

interface Event {
    id: number;
    title: string;
    organizer: string;
    category: string;
    start_datetime: string;
    duration_hours: number;
    mode: string;
    venue_address: string;
    meeting_link: string;
    registration_url: string;
    status: string;
    notes: string;
    source: string;
    updated_at: string;
    tasks: Task[];
}

const EventDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient(`/api/events/${id}`)
            .then(data => {
                if(data && data.id) {
                    setEvent(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleDelete = async () => {
        if(window.confirm('Are you sure you want to delete this event?')) {
            await apiClient(`/api/events/${id}`, { method: 'DELETE' });
            navigate('/dashboard');
        }
    };

    if (loading) return <div className="p-8 text-center text-on-surface-variant">Loading...</div>;
    if (!event) return <div className="p-8 text-center text-error">Event not found.</div>;

    return (
        <div className="bg-surface text-on-surface dark:bg-[#121212] dark:text-[#e1e3e4] font-body-lg min-h-screen pb-xl antialiased flex flex-col items-center transition-colors duration-300">
            <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface dark:bg-[#121212] border-b border-transparent dark:border-outline-variant/30">
                <div className="flex items-center gap-xs">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="font-headline-md text-headline-md text-primary font-bold">Event Details</h1>
                </div>
                <div className="flex items-center gap-xs">
                    <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined">share</span>
                    </button>
                    <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>
                </div>
            </header>

            <main className="w-full max-w-[1280px] mt-24 px-margin-mobile md:px-margin-desktop flex flex-col gap-lg">
                {/* Header Section */}
                <section className="flex flex-col gap-xs">
                    <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">{event.title}</h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">via {event.organizer || 'Unknown'}</p>
                    <div className="flex flex-wrap gap-xs mt-sm">
                        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-caps text-label-caps flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            {event.duration_hours ? `${event.duration_hours}-hour ` : ''}{event.category || 'Event'}
                        </div>
                        <div className="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-label-caps text-label-caps flex items-center gap-1 capitalize">
                            <span className="material-symbols-outlined text-[16px]">devices</span>
                            {event.mode || 'offline'}
                        </div>
                    </div>
                </section>

                {/* Venue Section */}
                <section className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-level-1 p-md flex flex-col gap-md border border-transparent dark:border-outline-variant/30">
                    {(event.mode === 'offline' || event.mode === 'hybrid') && (
                        <div className="flex items-start gap-sm">
                            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-primary">
                                <span className="material-symbols-outlined">location_on</span>
                            </div>
                            <div>
                                <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">{event.venue_address || 'TBD'}</h3>
                            </div>
                        </div>
                    )}
                    {event.mode === 'hybrid' && <div className="h-px w-full bg-surface-variant"></div>}
                    {(event.mode === 'online' || event.mode === 'hybrid') && (
                        <div className="flex items-start md:items-center justify-between gap-sm flex-col md:flex-row">
                            <div className="flex items-start gap-sm">
                                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-primary">
                                    <span className="material-symbols-outlined">videocam</span>
                                </div>
                                <div>
                                    <h3 className="font-body-lg text-body-lg font-semibold text-on-surface">Online Meeting</h3>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant">{event.meeting_link ? 'Link available' : 'Link not provided'}</p>
                                </div>
                            </div>
                            {event.meeting_link && (
                                <a href={event.meeting_link} target="_blank" rel="noreferrer" className="gradient-btn text-on-primary font-body-lg text-body-lg font-semibold h-12 px-6 rounded-xl shadow-level-2 flex items-center">
                                    Join link
                                </a>
                            )}
                        </div>
                    )}
                </section>

                {/* Action Section */}
                {event.registration_url && (
                    <section>
                        <a href={event.registration_url} target="_blank" rel="noreferrer" className="w-full bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline-variant/30 text-primary font-body-lg text-body-lg font-semibold h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container-low dark:hover:bg-[#222426] transition-colors">
                            Go to registration page
                            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                        </a>
                    </section>
                )}

                {/* Status Section */}
                <section className="flex flex-col gap-sm">
                    <h3 className="font-headline-md text-headline-md text-on-surface">Status</h3>
                    <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                        {['Registered', 'Shortlisted', 'Submitted', 'Completed', 'Missed'].map(s => (
                            <button key={s} className={`px-4 py-2 rounded-xl font-body-sm text-body-sm whitespace-nowrap border ${event.status === s ? 'bg-primary/10 text-primary border-primary' : 'bg-surface-container-lowest dark:bg-inverse-surface text-on-surface-variant dark:text-surface-variant border-outline-variant dark:border-outline-variant/30'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Tasks Section */}
                <section className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-level-1 p-md flex flex-col gap-sm border border-transparent dark:border-outline-variant/30">
                    <div className="flex justify-between items-center">
                        <h3 className="font-headline-md text-headline-md text-on-surface">Tasks</h3>
                        <button className="text-primary font-body-sm text-body-sm font-semibold hover:underline">
                            + Add task
                        </button>
                    </div>
                    <div className="flex flex-col gap-3 mt-2">
                        {event.tasks && event.tasks.length > 0 ? (
                            event.tasks.map(t => (
                                <label key={t.id} className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" defaultChecked={t.is_done} className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" />
                                    <span className={`font-body-lg text-body-lg transition-colors ${t.is_done ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>{t.label}</span>
                                </label>
                            ))
                        ) : (
                            <div className="text-on-surface-variant font-body-sm">No tasks added yet.</div>
                        )}
                    </div>
                </section>

                {/* Notes Section */}
                <section className="flex flex-col gap-sm">
                    <h3 className="font-headline-md text-headline-md text-on-surface">Notes</h3>
                    <div className="relative">
                        <textarea readOnly value={event.notes || ''} className="w-full bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant dark:border-outline-variant/30 rounded-xl p-md font-body-lg text-body-lg text-on-surface dark:text-surface-bright min-h-[120px]" placeholder="No notes available." />
                    </div>
                </section>

                {/* Footer / Actions */}
                <footer className="w-full py-md flex flex-col md:flex-row justify-between items-center gap-sm mt-lg border-t border-outline-variant dark:border-outline-variant/30 bg-surface-container-low dark:bg-[#181a1c]">
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <p className="font-note text-note text-secondary">Source: {event.source || 'Manual'} • Updated {event.updated_at && !isNaN(Date.parse(event.updated_at)) ? new Date(event.updated_at).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    <div className="flex gap-4">
                        <Link to={`/event/edit/${event.id}`} className="font-note text-note text-on-surface-variant hover:text-primary transition-colors">
                            Edit Event
                        </Link>
                        <button onClick={handleDelete} className="font-note text-note text-error border border-error/50 rounded-lg px-4 py-2 hover:bg-error/10 transition-colors">
                            Delete Event
                        </button>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default EventDetailPage;
