import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;

const ContactSection: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'contactMessages'), {
                name: formData.name,
                email: formData.email,
                message: formData.message,
                createdAt: serverTimestamp(),
            });
            setSubmitted(true);
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            console.error("Error submitting contact form: ", error);
            alert("Failed to send message. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="py-24 bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant/20">
            <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
                
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="font-headline-lg text-3xl md:text-5xl font-bold text-on-surface dark:text-[#e1e3e4] mb-4">
                        Get in touch
                    </h2>
                    <p className="font-body-lg text-lg text-on-surface-variant dark:text-surface-variant">
                        Have questions about enterprise plans or custom integrations? Our team is ready to help you scale.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    
                    {/* Contact Info & Map */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col gap-10"
                    >
                        <div className="flex flex-col gap-6">
                            <h3 className="font-headline-md text-2xl font-bold text-on-surface">Contact Information</h3>
                            
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Email Us</p>
                                    <a href="mailto:hello@upvent.app" className="font-body-lg text-lg font-medium text-on-surface hover:text-primary transition-colors">hello@upvent.app</a>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Call Us</p>
                                    <a href="tel:+18005550199" className="font-body-lg text-lg font-medium text-on-surface hover:text-primary transition-colors">+1 (800) 555-0199</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Office Address</p>
                                    <p className="font-body-lg text-lg font-medium text-on-surface">100 Innovation Drive<br/>San Francisco, CA 94103</p>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="w-full h-48 bg-surface-container dark:bg-[#181a1c] rounded-2xl overflow-hidden border border-outline-variant/30 flex items-center justify-center relative group cursor-pointer">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxyZWN0IHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0ibm9uZSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0wIDEwaDQwTTAgMjBoNDBNMCAzMGg0ME0xMCAwdjQwTTIwIDB2NDBNejAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDE1MCwgMTUwLCAxNTAsIDAuMikiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50 dark:opacity-20"></div>
                            <div className="flex flex-col items-center z-10 gap-2">
                                <MapPin size={32} className="text-primary" />
                                <span className="font-label-caps text-label-caps font-semibold bg-surface-container-lowest dark:bg-inverse-surface px-3 py-1 rounded-full shadow-sm">View on Google Maps</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-surface-container-highest dark:bg-[#181a1c] flex items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-all"><TwitterIcon /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-surface-container-highest dark:bg-[#181a1c] flex items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-all"><LinkedinIcon /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-surface-container-highest dark:bg-[#181a1c] flex items-center justify-center text-on-surface hover:bg-primary hover:text-white transition-all"><FacebookIcon /></a>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6 }}
                        className="bg-surface dark:bg-[#121212] p-8 rounded-3xl border border-outline-variant/30 shadow-level-2"
                    >
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="name" className="font-label-caps text-label-caps text-on-surface">Full Name</label>
                                <input 
                                    type="text" 
                                    id="name"
                                    required
                                    className="px-4 py-3 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/50 rounded-xl font-body-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="Jane Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="email" className="font-label-caps text-label-caps text-on-surface">Work Email</label>
                                <input 
                                    type="email" 
                                    id="email"
                                    required
                                    className="px-4 py-3 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/50 rounded-xl font-body-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="jane@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="message" className="font-label-caps text-label-caps text-on-surface">Message</label>
                                <textarea 
                                    id="message"
                                    required
                                    rows={4}
                                    className="px-4 py-3 bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/50 rounded-xl font-body-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                                    placeholder="How can we help you?"
                                    value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`mt-2 font-body-lg text-body-lg font-semibold px-8 py-4 rounded-xl shadow-level-1 hover:shadow-level-2 transition-all flex items-center justify-center gap-2 ${submitted ? 'bg-secondary text-white' : 'gradient-btn text-on-primary'}`}
                            >
                                {isSubmitting ? (
                                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                ) : submitted ? (
                                    <>Message Sent! <span className="material-symbols-outlined text-[20px]">check_circle</span></>
                                ) : (
                                    <>Send Message <span className="material-symbols-outlined text-[20px]">send</span></>
                                )}
                            </button>
                        </form>
                    </motion.div>

                </div>

            </div>
        </section>
    );
};

export default ContactSection;
