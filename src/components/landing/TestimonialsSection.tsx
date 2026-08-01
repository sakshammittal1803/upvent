import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
    const testimonials = [
        {
            quote: "Upvent completely transformed how our university handles hackathons. We went from scattered spreadsheets to a unified dashboard overnight. It saved us countless hours of administrative work.",
            author: "Dr. James Wilson",
            role: "Dean of Computer Science",
            company: "Stanford University"
        },
        {
            quote: "The AI extraction feature is nothing short of magic. I just paste the WhatsApp forward I get from sponsors, and the event is fully populated in seconds. Highly recommended for busy teams.",
            author: "Anita Patel",
            role: "Lead Organizer",
            company: "Global Tech Summit"
        },
        {
            quote: "We needed a platform with enterprise-grade security and strict role-based access for our corporate training sessions. Upvent delivered exactly what we needed without any of the bloat.",
            author: "Michael Chang",
            role: "Director of HR Operations",
            company: "FinTech Innovations"
        }
    ];

    return (
        <section className="py-24 bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant/20">
            <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
                
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="font-headline-lg text-3xl md:text-5xl font-bold text-on-surface dark:text-[#e1e3e4] mb-4">
                        Trusted by professionals
                    </h2>
                    <p className="font-body-lg text-lg text-on-surface-variant dark:text-surface-variant">
                        Don't just take our word for it. See what event organizers around the world are saying about Upvent.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: idx * 0.15 }}
                            className="bg-surface dark:bg-[#121212] rounded-2xl p-8 border border-outline-variant/30 shadow-sm flex flex-col relative"
                        >
                            <Quote className="absolute top-6 right-6 text-primary/10 w-12 h-12 rotate-180" />
                            
                            <p className="font-body-lg text-on-surface-variant dark:text-surface-variant leading-relaxed mb-8 relative z-10 flex-grow italic">
                                "{testimonial.quote}"
                            </p>
                            
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                    {testimonial.author.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-headline-md text-base font-bold text-on-surface leading-tight">{testimonial.author}</h4>
                                    <p className="font-body-sm text-sm text-on-surface-variant dark:text-surface-variant">
                                        {testimonial.role}, <span className="font-semibold text-primary">{testimonial.company}</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default TestimonialsSection;
