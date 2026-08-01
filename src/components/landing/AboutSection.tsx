import React from 'react';
import { motion } from 'framer-motion';
import { Target, Lightbulb, ShieldCheck, Zap } from 'lucide-react';

const AboutSection: React.FC = () => {
    const fadeIn = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    const cards = [
        {
            icon: <Target className="w-8 h-8 text-primary" />,
            title: "Our Mission",
            description: "To eliminate the chaos of manual event planning by providing a unified, AI-driven platform that empowers organizers to focus on what truly matters: creating memorable experiences."
        },
        {
            icon: <Lightbulb className="w-8 h-8 text-secondary" />,
            title: "Our Vision",
            description: "A world where any team, regardless of size, can seamlessly execute professional-grade events, hackathons, and conferences with zero technical friction."
        }
    ];

    const benefits = [
        { icon: <Zap className="w-5 h-5" />, text: "Save hours of manual data entry with AI extraction." },
        { icon: <ShieldCheck className="w-5 h-5" />, text: "Enterprise-grade security and role-based access." },
        { icon: <Zap className="w-5 h-5" />, text: "Automated synchronization across multiple platforms." },
        { icon: <ShieldCheck className="w-5 h-5" />, text: "Real-time analytics and participant tracking." }
    ];

    return (
        <section id="about" className="py-24 bg-surface dark:bg-[#121212] border-t border-outline-variant/20">
            <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left side: Text & Benefits */}
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                        variants={fadeIn}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-1 bg-primary rounded-full"></span>
                            <h2 className="font-label-caps text-label-caps text-primary uppercase tracking-wider">About Upvent</h2>
                        </div>
                        
                        <h3 className="font-headline-lg text-3xl md:text-5xl font-bold text-on-surface dark:text-[#e1e3e4] leading-tight">
                            Built to solve the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">event management crisis.</span>
                        </h3>
                        
                        <p className="font-body-lg text-lg text-on-surface-variant dark:text-surface-variant leading-relaxed">
                            Before Upvent, organizers were drowning in spreadsheets, scattered emails, and disconnected tools. We built this platform because we experienced the pain of lost data and communication silos firsthand.
                        </p>
                        
                        <p className="font-body-lg text-lg text-on-surface-variant dark:text-surface-variant leading-relaxed mb-4">
                            Upvent consolidates your workflow. From initial planning to post-event analytics, everything lives in one secure, dynamic dashboard.
                        </p>

                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                        {benefit.icon}
                                    </div>
                                    <span className="font-body-sm text-body-sm text-on-surface font-medium">{benefit.text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Right side: Cards */}
                    <div className="flex flex-col gap-6">
                        {cards.map((card, idx) => (
                            <motion.div 
                                key={idx}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6, delay: 0.2 + (idx * 0.2) }}
                                variants={fadeIn}
                                className="bg-surface-container-lowest dark:bg-inverse-surface p-8 rounded-2xl shadow-level-1 border border-outline-variant/30 hover:shadow-level-2 transition-shadow"
                            >
                                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center mb-6">
                                    {card.icon}
                                </div>
                                <h4 className="font-headline-md text-2xl font-bold text-on-surface mb-3">{card.title}</h4>
                                <p className="font-body-lg text-on-surface-variant dark:text-surface-variant leading-relaxed">
                                    {card.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AboutSection;
