import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

const AddEditEventPage: React.FC = () => {
    const navigate = useNavigate();
    const [entryMode, setEntryMode] = useState<'manual' | 'ai'>('manual');
    const [isMultiDay, setIsMultiDay] = useState(false);
    const [mode, setMode] = useState('offline');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI States
    const [pastedText, setPastedText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiError, setAiError] = useState('');
    const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});
    
    // Duplicate Detection States
    const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

    // Handle Escape key for modals
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (duplicateWarning) setDuplicateWarning(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [duplicateWarning]);

    const [formData, setFormData] = useState({
        title: '',
        organizer: '',
        category: '',
        start_datetime: '',
        end_datetime: '',
        duration_hours: '',
        registration_deadline: '',
        venue_address: '',
        meeting_link: '',
        registration_url: ''
    });

    const [metadata, setMetadata] = useState({
        contact_person: '',
        contact_number: '',
        email: '',
        speaker: '',
        prize_pool: '',
        eligibility: '',
        social_links: [] as string[]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear warning on edit
        if (confidenceScores[name]) {
            setConfidenceScores(prev => ({ ...prev, [name]: 100 }));
        }
    };

    const handleAnalyze = async () => {
        if (!pastedText.trim()) return;
        setIsAnalyzing(true);
        setAiError('');
        
        try {
            const result = await apiClient('/api/extract-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: pastedText }),
                timeout: 30000 // 30s timeout for AI
            });

            if (result.success && result.data) {
                const data = result.data;
                const newScores: Record<string, number> = {};
                const newForm = { ...formData };
                
                // Helper to safely extract value and confidence
                const applyField = (key: keyof typeof formData, dataField: any) => {
                    if (dataField && dataField.value) {
                        newForm[key] = dataField.value.toString();
                        newScores[key] = dataField.confidence || 100;
                    }
                };

                applyField('title', data.title);
                applyField('organizer', data.organizer);
                applyField('category', data.category);
                applyField('start_datetime', data.start_datetime);
                applyField('end_datetime', data.end_datetime);
                applyField('registration_deadline', data.registration_deadline);
                applyField('venue_address', data.venue_address);
                applyField('meeting_link', data.meeting_link);
                applyField('registration_url', data.registration_url);

                if (data.mode && data.mode.value) {
                    setMode(data.mode.value.toLowerCase());
                    newScores['mode'] = data.mode.confidence || 100;
                }

                if (data.end_datetime?.value) setIsMultiDay(true);

                if (data.metadata?.value) {
                    setMetadata(prev => ({ ...prev, ...data.metadata.value }));
                }

                setFormData(newForm);
                setConfidenceScores(newScores);
            }
        } catch (error) {
            console.error(error);
            setAiError('Network error occurred while reaching AI service.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        // Validation check for duplicates
        if (!duplicateWarning) {
            try {
                const checkData = await apiClient('/api/events/check-duplicate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: formData.title, start_datetime: formData.start_datetime })
                });
                
                if (checkData.duplicate) {
                    setDuplicateWarning(checkData.existingEvent);
                    setIsSubmitting(false);
                    return; // Intercept save
                }
            } catch (err) {
                console.error("Duplicate check failed", err);
            }
        }

        // Proceed to save
        try {
            await apiClient('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    mode,
                    metadata,
                    venue_address: mode === 'offline' || mode === 'hybrid' ? formData.venue_address : '',
                    meeting_link: mode === 'online' || mode === 'hybrid' ? formData.venue_address : '', 
                })
            });
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to create event', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFieldStyle = (fieldName: string) => {
        const conf = confidenceScores[fieldName];
        if (conf !== undefined && conf < 70) {
            return "border-error/80 bg-error-container/20 dark:bg-error-container/10 focus:border-error focus:ring-4 focus:ring-error/30 transition-all duration-200";
        }
        return "border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/20 hover:border-primary/50 transition-all duration-200";
    };

    const renderFormFields = () => (
        <div className="space-y-lg">
            {/* Basic Info */}
            <section className="space-y-sm">
                <div className="flex items-center gap-xs mb-sm border-b border-outline-variant pb-2">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Basic Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm relative">
                    <div className="md:col-span-2 relative">
                        <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant flex justify-between">
                            Event Name
                            {confidenceScores['title'] < 70 && <span className="text-error flex items-center gap-1 text-[10px]"><span className="material-symbols-outlined text-[14px]">warning</span> Verify this field</span>}
                        </label>
                        <input name="title" value={formData.title} onChange={handleChange} required className={`w-full rounded-lg border p-3 font-body-sm text-on-background bg-transparent focus:outline-none ${getFieldStyle('title')}`} placeholder="e.g., Spring Hackathon 2024" type="text" />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant flex justify-between">
                            Organizer
                            {confidenceScores['organizer'] < 70 && <span className="text-error flex items-center gap-1 text-[10px]"><span className="material-symbols-outlined text-[14px]">warning</span> Verify</span>}
                        </label>
                        <input name="organizer" value={formData.organizer} onChange={handleChange} className={`w-full rounded-lg border p-3 font-body-sm text-on-background bg-transparent focus:outline-none ${getFieldStyle('organizer')}`} placeholder="e.g., Computer Science Club" type="text" />
                    </div>
                    <div>
                        <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant flex justify-between">
                            Category
                            {confidenceScores['category'] < 70 && <span className="text-error flex items-center gap-1 text-[10px]"><span className="material-symbols-outlined text-[14px]">warning</span> Verify</span>}
                        </label>
                        {/* Fallback to text input for AI extraction to allow any category, unlike dropdown */}
                        <input name="category" value={formData.category} onChange={handleChange} className={`w-full rounded-lg border p-3 font-body-sm text-on-background bg-transparent focus:outline-none ${getFieldStyle('category')}`} placeholder="e.g., Hackathon, Seminar" type="text" />
                    </div>
                </div>
            </section>

            {/* Timing */}
            <section className="space-y-sm">
                <div className="flex items-center justify-between border-b border-outline-variant pb-2 mb-sm">
                    <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-primary">schedule</span>
                        <h2 className="font-headline-md text-headline-md text-on-surface">Timing</h2>
                    </div>
                    <div className="flex items-center gap-xs">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase">Multi-day event</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={isMultiDay} onChange={(e) => setIsMultiDay(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                    <div>
                        <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant flex justify-between">
                            Start Date & Time
                            {confidenceScores['start_datetime'] < 70 && <span className="text-error flex items-center gap-1 text-[10px]"><span className="material-symbols-outlined text-[14px]">warning</span> Verify</span>}
                        </label>
                        <input name="start_datetime" value={formData.start_datetime ? formData.start_datetime.substring(0,16) : ''} onChange={handleChange} className={`w-full rounded-lg border p-3 font-body-sm text-on-background bg-transparent focus:outline-none ${getFieldStyle('start_datetime')}`} type="datetime-local" />
                    </div>
                    {!isMultiDay ? (
                        <div>
                            <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Duration (Hours)</label>
                            <input name="duration_hours" value={formData.duration_hours} onChange={handleChange} className={`w-full rounded-lg border border-outline-variant p-3 font-body-sm text-on-background bg-transparent focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 hover:border-primary/50 transition-all duration-200`} type="number" step="0.5" placeholder="e.g., 2" />
                        </div>
                    ) : (
                        <div>
                            <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant flex justify-between">
                                End Date & Time
                                {confidenceScores['end_datetime'] < 70 && <span className="text-error flex items-center gap-1 text-[10px]"><span className="material-symbols-outlined text-[14px]">warning</span> Verify</span>}
                            </label>
                            <input name="end_datetime" value={formData.end_datetime ? formData.end_datetime.substring(0,16) : ''} onChange={handleChange} className={`w-full rounded-lg border p-3 font-body-sm text-on-background bg-transparent focus:outline-none ${getFieldStyle('end_datetime')}`} type="datetime-local" />
                        </div>
                    )}
                </div>
            </section>

            {/* Logistics */}
            <section className="space-y-sm">
                <div className="flex items-center gap-xs mb-sm border-b border-outline-variant pb-2">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    <h2 className="font-headline-md text-headline-md text-on-surface">Logistics</h2>
                </div>
                <div className="space-y-sm">
                    <div>
                        <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant flex justify-between">
                            Mode
                            {confidenceScores['mode'] < 70 && <span className="text-error flex items-center gap-1 text-[10px]"><span className="material-symbols-outlined text-[14px]">warning</span> Verify</span>}
                        </label>
                        <div className={`flex bg-surface-container-low p-1 rounded-lg border ${confidenceScores['mode'] < 70 ? 'border-error/80 bg-error-container/10' : 'border-transparent'}`}>
                            {['offline', 'online', 'hybrid'].map(m => (
                                <div 
                                    key={m} 
                                    onClick={() => setMode(m)} 
                                    className={`flex-1 text-center py-2 rounded cursor-pointer font-body-sm transition-all duration-200 capitalize ${mode === m ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}`}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                        <div>
                            <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant flex justify-between">
                                Venue Location / Link
                                {confidenceScores['venue_address'] < 70 && <span className="text-error flex items-center gap-1 text-[10px]"><span className="material-symbols-outlined text-[14px]">warning</span> Verify</span>}
                            </label>
                            <input name="venue_address" value={formData.venue_address} onChange={handleChange} className={`w-full rounded-lg border p-3 font-body-sm text-on-background bg-transparent focus:outline-none ${getFieldStyle('venue_address')}`} placeholder="e.g., Student Union Building or Zoom link" type="text" />
                        </div>
                        <div>
                            <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant flex justify-between">
                                Registration Deadline
                                {confidenceScores['registration_deadline'] < 70 && <span className="text-error flex items-center gap-1 text-[10px]"><span className="material-symbols-outlined text-[14px]">warning</span> Verify</span>}
                            </label>
                            <input name="registration_deadline" value={formData.registration_deadline ? formData.registration_deadline.substring(0,16) : ''} onChange={handleChange} className={`w-full rounded-lg border p-3 font-body-sm text-on-background bg-transparent focus:outline-none ${getFieldStyle('registration_deadline')}`} type="datetime-local" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-on-surface-variant flex justify-between">
                                Registration Website URL
                                {confidenceScores['registration_url'] < 70 && <span className="text-error flex items-center gap-1 text-[10px]"><span className="material-symbols-outlined text-[14px]">warning</span> Verify</span>}
                            </label>
                            <input name="registration_url" value={formData.registration_url} onChange={handleChange} className={`w-full rounded-lg border p-3 font-body-sm text-on-background bg-transparent focus:outline-none ${getFieldStyle('registration_url')}`} placeholder="https://..." type="url" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );

    return (
        <div className="antialiased min-h-screen flex flex-col font-body-sm text-body-sm bg-background dark:bg-[#121212] dark:text-[#e1e3e4] transition-colors duration-300">
            <header className="bg-surface-container-lowest dark:bg-inverse-surface text-primary docked full-width top-0 sticky border-b border-outline-variant dark:border-outline-variant/30 flex justify-between items-center w-full px-margin-desktop py-4 z-50">
                <div onClick={() => navigate(-1)} className="flex items-center gap-xs cursor-pointer hover:bg-surface-variant rounded-full p-2 transition-colors duration-200">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </div>
                
                {/* Entry Mode Toggle */}
                <div className="flex bg-surface-container-low dark:bg-[#181a1c] p-1 rounded-xl border border-outline-variant/30 hidden md:flex">
                    <button 
                        onClick={() => setEntryMode('manual')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${entryMode === 'manual' ? 'bg-surface-container-lowest dark:bg-inverse-surface shadow-sm text-primary dark:text-primary-fixed-dim' : 'text-on-surface-variant dark:text-surface-variant hover:text-on-surface dark:hover:text-surface-bright'}`}
                    >
                        Manual Entry
                    </button>
                    <button 
                        onClick={() => setEntryMode('ai')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 ${entryMode === 'ai' ? 'bg-primary shadow-sm text-on-primary' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        AI Extraction
                    </button>
                </div>

                <h1 className="text-headline-md font-headline-md font-bold text-primary md:hidden">Add Event</h1>
                
                <button onClick={handleSave} disabled={isSubmitting} className="gradient-btn text-on-primary font-bold px-6 py-2 rounded-lg shadow-level-1 hover:shadow-level-2 transition-all duration-200 disabled:opacity-50 flex items-center gap-2">
                    {isSubmitting && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                    {isSubmitting ? 'Saving...' : 'Save'}
                </button>
            </header>

            <main className={`flex-grow w-full mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-xl ${entryMode === 'ai' && Object.keys(confidenceScores).length > 0 ? 'max-w-[1600px]' : 'max-w-4xl'}`}>
                
                {entryMode === 'ai' && Object.keys(confidenceScores).length === 0 && (
                    <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-[24px] shadow-level-1 p-lg md:p-xl border border-outline-variant/30 flex flex-col items-center">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                        </div>
                        <h2 className="text-2xl font-bold text-on-surface mb-2">Paste Event Details</h2>
                        <p className="text-on-surface-variant dark:text-[#e1e3e4] mb-8 text-center max-w-lg">
                            Paste any WhatsApp message, email, or promotional text below. Our AI will automatically extract all the event details and populate the form for you.
                        </p>
                        
                        {aiError && (
                            <div className="w-full mb-6 p-4 bg-error-container/20 border border-error/50 rounded-xl text-error text-center flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">error</span> {aiError}
                            </div>
                        )}

                        <textarea 
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder="Paste your event text here... (e.g. 'Join us next Friday at 10 AM for the Tech Symposium in the Main Auditorium. Register at bit.ly/tech...')"
                            className="w-full h-64 p-6 rounded-2xl border-2 border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/20 bg-surface-container-low dark:bg-inverse-surface dark:text-surface-bright resize-none text-base transition-all"
                        />
                        <button 
                            onClick={handleAnalyze} 
                            disabled={!pastedText.trim() || isAnalyzing}
                            className="mt-6 gradient-btn text-on-primary font-bold text-lg px-8 py-3 rounded-xl shadow-level-2 hover:shadow-level-3 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {isAnalyzing ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    Analyzing Text...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">magic_button</span>
                                    Extract Event Data
                                </>
                            )}
                        </button>
                    </div>
                )}

                {entryMode === 'ai' && Object.keys(confidenceScores).length > 0 && (
                    <div className="flex flex-col lg:flex-row gap-lg">
                        {/* Left Side: Pasted Text Reference */}
                        <div className="w-full lg:w-1/3 flex flex-col gap-4">
                            <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-xl p-4 border border-outline-variant dark:border-outline-variant/30 shadow-sm sticky top-24">
                                <h3 className="font-bold text-on-surface mb-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">format_quote</span>
                                    Original Text
                                </h3>
                                <div className="text-sm text-on-surface-variant dark:text-[#e1e3e4] whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {pastedText}
                                </div>
                                <button 
                                    onClick={() => { setConfidenceScores({}); setPastedText(''); }}
                                    className="mt-4 w-full py-2 border border-outline-variant dark:border-outline-variant/30 rounded-lg text-on-surface-variant dark:text-surface-bright hover:bg-surface-container dark:hover:bg-[#222426] transition-colors text-sm font-semibold"
                                >
                                    Start Over
                                </button>
                            </div>
                        </div>

                        {/* Right Side: Populated Form */}
                        <div className="w-full lg:w-2/3 bg-surface-container-lowest dark:bg-inverse-surface rounded-[24px] shadow-level-1 p-md md:p-xl border border-outline-variant/30">
                            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl mb-6 flex gap-3">
                                <span className="material-symbols-outlined text-primary mt-0.5">check_circle</span>
                                <div>
                                    <h4 className="font-bold text-primary">Extraction Complete</h4>
                                    <p className="text-sm text-primary/80 mt-1">
                                        Please review the extracted fields below. Fields with low confidence are highlighted in yellow.
                                    </p>
                                </div>
                            </div>
                            {renderFormFields()}
                        </div>
                    </div>
                )}

                {entryMode === 'manual' && (
                    <div className="bg-surface-container-lowest dark:bg-inverse-surface rounded-[24px] shadow-level-1 p-md md:p-xl border border-outline-variant/30">
                        {renderFormFields()}
                    </div>
                )}

            </main>

            {/* Duplicate Warning Modal */}
            {duplicateWarning && (
                <div onClick={() => setDuplicateWarning(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div onClick={(e) => e.stopPropagation()} className="bg-surface-container-lowest dark:bg-inverse-surface w-full max-w-md rounded-2xl shadow-level-3 overflow-hidden p-6 relative">
                        <div className="w-12 h-12 bg-error-container/20 text-error rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                        <h2 className="text-xl font-bold text-on-surface mb-2">Similar Event Detected</h2>
                        <p className="text-sm text-on-surface-variant mb-4">
                            We found an event in your database that looks very similar to this one. 
                        </p>
                        <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/30 mb-6">
                            <p className="font-semibold text-on-surface">{duplicateWarning.title}</p>
                            <p className="text-xs text-on-surface-variant mt-1">Organized by {duplicateWarning.organizer}</p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDuplicateWarning(null)} className="px-4 py-2 border border-outline-variant rounded-xl font-semibold text-on-surface">
                                Review Details
                            </button>
                            <button onClick={() => { setDuplicateWarning(null); handleSave(); }} className="px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:opacity-90 transition-opacity">
                                Save Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddEditEventPage;
