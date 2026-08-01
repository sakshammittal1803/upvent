import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
const GithubIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>;

const TeamSection: React.FC = () => {
    const team = [
        {
            name: "Sarah Jenkins",
            role: "Founder & CEO",
            bio: "Former event director at TechCrunch. Sarah founded Upvent to fix the broken workflows she experienced firsthand.",
            linkedin: "#",
            github: "#",
            email: "#"
        },
        {
            name: "David Chen",
            role: "Chief Technology Officer",
            bio: "Ex-Google engineer specializing in distributed systems and AI. David leads the architecture of the Upvent platform.",
            linkedin: "#",
            github: "#",
            email: "#"
        },
        {
            name: "Emily Rodriguez",
            role: "Head of Product",
            bio: "Passionate about user-centric design. Emily ensures every feature in Upvent is intuitive and deeply powerful.",
            linkedin: "#",
            email: "#"
        },
        {
            name: "Marcus Johnson",
            role: "Lead Security Engineer",
            bio: "Ensures enterprise-grade security across the platform. Marcus holds multiple patents in data encryption.",
            linkedin: "#",
            github: "#"
        }
    ];

    return (
        <section id="team" className="py-24 bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant/20">
            <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
                
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-label-caps text-label-caps mb-4">
                        Our Team
                    </span>
                    <h2 className="font-headline-lg text-3xl md:text-5xl font-bold text-on-surface dark:text-[#e1e3e4] mb-4">
                        The minds behind Upvent
                    </h2>
                    <p className="font-body-lg text-lg text-on-surface-variant dark:text-surface-variant">
                        Built by event veterans and engineering experts dedicated to solving the hardest problems in event management.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-surface dark:bg-[#121212] rounded-2xl p-6 border border-outline-variant/30 shadow-sm flex flex-col items-center text-center group hover:shadow-level-1 transition-all"
                        >
                            <div className="w-24 h-24 rounded-full bg-surface-container-high dark:bg-[#181a1c] border-2 border-primary/20 mb-4 overflow-hidden relative group-hover:border-primary transition-colors">
                                {/* Placeholder image using UI Avatar */}
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=3525cd&color=fff&size=200`} 
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            
                            <h3 className="font-headline-md text-xl font-bold text-on-surface mb-1">{member.name}</h3>
                            <p className="font-body-sm text-sm text-primary font-semibold mb-4">{member.role}</p>
                            
                            <p className="font-body-sm text-sm text-on-surface-variant dark:text-surface-variant mb-6 line-clamp-3 flex-grow">
                                {member.bio}
                            </p>

                            <div className="flex items-center gap-3 mt-auto">
                                {member.linkedin && (
                                    <a href={member.linkedin} className="text-outline hover:text-primary transition-colors" aria-label={`${member.name} LinkedIn`}>
                                        <LinkedinIcon />
                                    </a>
                                )}
                                {member.github && (
                                    <a href={member.github} className="text-outline hover:text-on-surface dark:hover:text-white transition-colors" aria-label={`${member.name} GitHub`}>
                                        <GithubIcon />
                                    </a>
                                )}
                                {member.email && (
                                    <a href={member.email} className="text-outline hover:text-primary transition-colors" aria-label={`Email ${member.name}`}>
                                        <Mail size={20} />
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default TeamSection;
