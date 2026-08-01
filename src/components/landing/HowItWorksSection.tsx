import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MousePointerClick, LogIn, LayoutDashboard, CalendarCheck } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
    const steps = [
        { icon: <Globe size={28} />, title: "Visit Platform", description: "Start by exploring the Upvent landing page." },
        { icon: <MousePointerClick size={28} />, title: "Get Started", description: "Click the Get Started button to initialize your workspace." },
        { icon: <LogIn size={28} />, title: "Secure Login", description: "Authenticate securely using our seamless login system." },
        { icon: <LayoutDashboard size={28} />, title: "Access Dashboard", description: "Enter your centralized hub to view all metrics." },
        { icon: <CalendarCheck size={28} />, title: "Manage Events", description: "Create, sync, and organize events effortlessly." },
    ];

    return (
        <section className="py-24 bg-surface dark:bg-[#121212] overflow-hidden">
            <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
                
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="font-headline-lg text-3xl md:text-5xl font-bold text-on-surface dark:text-[#e1e3e4] mb-4">
                        How It Works
                    </h2>
                    <p className="font-body-lg text-lg text-on-surface-variant dark:text-surface-variant">
                        A seamless journey from discovering the platform to managing your first enterprise-grade event.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[45px] left-[10%] right-[10%] h-0.5 bg-outline-variant/30 z-0"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
                        {steps.map((step, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: idx * 0.15 }}
                                className="flex flex-col items-center text-center relative group"
                            >
                                <div className="w-24 h-24 rounded-full bg-surface-container-lowest dark:bg-inverse-surface border-4 border-surface dark:border-[#121212] shadow-level-1 flex items-center justify-center text-primary mb-6 relative z-10 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    {step.icon}
                                    {/* Number Badge */}
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-white font-bold text-sm flex items-center justify-center shadow-sm">
                                        {idx + 1}
                                    </div>
                                </div>
                                <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">{step.title}</h3>
                                <p className="font-body-sm text-sm text-on-surface-variant dark:text-surface-variant max-w-[200px]">
                                    {step.description}
                                </p>

                                {/* Mobile/Tablet Connecting Line (Vertical) */}
                                {idx !== steps.length - 1 && (
                                    <div className="lg:hidden h-12 w-0.5 bg-outline-variant/30 mt-4"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default HowItWorksSection;
