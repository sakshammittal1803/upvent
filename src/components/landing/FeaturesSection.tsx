import React from 'react';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, 
    Wand2, 
    CalendarDays, 
    LineChart, 
    BellRing, 
    Users, 
    Shield, 
    Workflow, 
    Gauge, 
    Lock 
} from 'lucide-react';

const FeaturesSection: React.FC = () => {
    const features = [
        { icon: <LayoutDashboard size={24} />, title: "Smart Dashboard", description: "Centralized hub for all your events, giving you a bird's-eye view of your entire organization." },
        { icon: <Wand2 size={24} />, title: "AI Event Management", description: "Automatically extract event details from plain text, emails, and WhatsApp messages." },
        { icon: <CalendarDays size={24} />, title: "Dynamic Calendar", description: "Interactive calendar views to manage scheduling conflicts and visualize upcoming timelines." },
        { icon: <LineChart size={24} />, title: "Analytics", description: "Deep insights into participant engagement, registration drop-offs, and event success metrics." },
        { icon: <BellRing size={24} />, title: "Notifications", description: "Automated reminders and updates to keep your team and attendees perfectly aligned." },
        { icon: <Users size={24} />, title: "User Management", description: "Easily handle attendee lists, bulk imports, and secure authentication flows." },
        { icon: <Shield size={24} />, title: "Role-Based Access", description: "Granular permissions ensuring the right team members have the exact access they need." },
        { icon: <Workflow size={24} />, title: "Automation", description: "Sync data automatically from platforms like Unstop, Luma, Devfolio, and Gmail." },
        { icon: <Gauge size={24} />, title: "Fast Performance", description: "Optimized for speed. No lag, no waiting. Experience real-time UI updates." },
        { icon: <Lock size={24} />, title: "Secure Architecture", description: "Bank-grade security, data encryption, and robust middleware protecting your events." },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
    };

    return (
        <section id="features" className="py-24 bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant/20">
            <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
                
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-label-caps text-label-caps mb-4">
                        Powerful Features
                    </span>
                    <h2 className="font-headline-lg text-3xl md:text-5xl font-bold text-on-surface dark:text-[#e1e3e4] mb-4">
                        Everything you need to <br className="hidden md:block"/> scale your events
                    </h2>
                    <p className="font-body-lg text-lg text-on-surface-variant dark:text-surface-variant">
                        Upvent combines modern design with enterprise-grade engineering to deliver a comprehensive suite of tools for event organizers.
                    </p>
                </div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
                >
                    {features.map((feature, idx) => (
                        <motion.div 
                            key={idx} 
                            variants={cardVariants}
                            className="bg-surface dark:bg-[#121212] rounded-2xl p-6 border border-outline-variant/30 shadow-sm hover:shadow-level-1 hover:-translate-y-1 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">{feature.title}</h3>
                            <p className="font-body-sm text-sm text-on-surface-variant dark:text-surface-variant leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
};

export default FeaturesSection;
