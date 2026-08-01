import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {
    return (
        <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.15, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute top-0 left-0 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.15, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className="absolute top-0 right-0 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.15, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                    className="absolute -bottom-8 left-1/2 w-72 h-72 bg-tertiary rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000"
                />
            </div>

            <div className="relative z-10 max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop text-center flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-label-caps text-label-caps mb-6 border border-primary/20">
                        The New Standard for Event Management
                    </span>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline-lg text-on-surface dark:text-[#e1e3e4] tracking-tight leading-tight max-w-4xl mb-6"
                >
                    Organize, Automate, and Scale Your Events
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    className="font-body-lg text-lg md:text-xl text-on-surface-variant dark:text-surface-variant max-w-2xl mx-auto mb-10"
                >
                    Upvent is the all-in-one platform for professional teams to effortlessly manage hackathons, webinars, and conferences. AI-powered and beautifully designed.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
                >
                    <Link 
                        to="/login" 
                        className="w-full sm:w-auto gradient-btn text-on-primary font-body-lg text-body-lg font-semibold px-8 py-4 rounded-xl shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                        Get Started Free
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </Link>
                    <a 
                        href="#about" 
                        className="w-full sm:w-auto bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/30 text-on-surface dark:text-[#e1e3e4] font-body-lg text-body-lg font-semibold px-8 py-4 rounded-xl hover:bg-surface-container dark:hover:bg-[#222426] transition-colors"
                    >
                        Learn More
                    </a>
                </motion.div>

                {/* Dashboard Preview Image */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    className="mt-16 w-full max-w-5xl relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background dark:from-[#121212] via-transparent to-transparent z-10 h-full bottom-0"></div>
                    <div className="rounded-2xl border border-outline-variant/20 shadow-level-2 overflow-hidden bg-surface-container-lowest dark:bg-inverse-surface p-2">
                        {/* Placeholder for actual dashboard UI mockup. We will use CSS to simulate a clean UI block instead of a real image to ensure it doesn't break */}
                        <div className="w-full aspect-[16/9] rounded-xl bg-surface-container-low dark:bg-[#181a1c] border border-outline-variant/10 flex flex-col">
                            {/* Mock Header */}
                            <div className="h-12 border-b border-outline-variant/10 flex items-center px-4 gap-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                                </div>
                                <div className="flex-1 max-w-md mx-auto bg-surface-container-lowest dark:bg-inverse-surface rounded-md h-6 border border-outline-variant/10"></div>
                            </div>
                            {/* Mock Body */}
                            <div className="flex-1 flex p-4 gap-4">
                                <div className="w-48 hidden sm:flex flex-col gap-2 border-r border-outline-variant/10 pr-4">
                                    <div className="h-8 bg-surface-container-lowest dark:bg-inverse-surface rounded-md"></div>
                                    <div className="h-8 bg-primary/10 rounded-md"></div>
                                    <div className="h-8 bg-surface-container-lowest dark:bg-inverse-surface rounded-md"></div>
                                </div>
                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <div className="h-8 w-32 bg-surface-container-lowest dark:bg-inverse-surface rounded-md"></div>
                                        <div className="h-8 w-24 bg-primary/20 rounded-md"></div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1 h-32 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-sm border border-outline-variant/10"></div>
                                        <div className="flex-1 h-32 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-sm border border-outline-variant/10"></div>
                                        <div className="flex-1 h-32 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-sm border border-outline-variant/10"></div>
                                    </div>
                                    <div className="flex-1 bg-surface-container-lowest dark:bg-inverse-surface rounded-xl shadow-sm border border-outline-variant/10 mt-2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
