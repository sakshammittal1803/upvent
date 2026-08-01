import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQSection: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "How does the AI extraction feature work?",
            answer: "Our AI model analyzes raw text (like emails, WhatsApp messages, or web page text) to automatically identify and extract key event details like title, date, location, and registration links. It instantly populates your dashboard without manual data entry."
        },
        {
            question: "Is my data secure?",
            answer: "Yes. Upvent employs enterprise-grade security protocols, including AES-256 encryption at rest and TLS 1.2+ in transit. We have strict role-based access controls to ensure your event data is only accessible to authorized personnel."
        },
        {
            question: "Can I integrate Upvent with my existing tools?",
            answer: "Absolutely. Upvent seamlessly integrates with platforms like Gmail (via IMAP), Unstop, Luma, and Devfolio. You can connect these accounts in your dashboard to automatically pull in event data."
        },
        {
            question: "What happens if I lose my internet connection?",
            answer: "Upvent is built with reliability in mind. While offline, the app handles network interruptions gracefully with clear error boundaries. Once reconnected, failed requests can be retried automatically via our resilient API client."
        },
        {
            question: "Do you offer a free tier?",
            answer: "Yes! Upvent offers a generous free tier for small teams and student organizers. As your needs grow, you can upgrade to our Pro or Enterprise plans for advanced analytics and higher API rate limits."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-24 bg-surface dark:bg-[#121212] border-t border-outline-variant/20">
            <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop">
                
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-label-caps text-label-caps mb-4">
                        Support
                    </span>
                    <h2 className="font-headline-lg text-3xl md:text-5xl font-bold text-on-surface dark:text-[#e1e3e4] mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="font-body-lg text-lg text-on-surface-variant dark:text-surface-variant">
                        Everything you need to know about the product and billing.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {faqs.map((faq, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                            className={`border ${openIndex === idx ? 'border-primary shadow-sm bg-surface-container-lowest dark:bg-inverse-surface' : 'border-outline-variant/30 bg-transparent'} rounded-2xl overflow-hidden transition-all duration-300`}
                        >
                            <button 
                                onClick={() => toggleFAQ(idx)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                aria-expanded={openIndex === idx}
                            >
                                <span className={`font-headline-md text-lg font-bold ${openIndex === idx ? 'text-primary' : 'text-on-surface'}`}>
                                    {faq.question}
                                </span>
                                <motion.div
                                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`shrink-0 ml-4 ${openIndex === idx ? 'text-primary' : 'text-outline'}`}
                                >
                                    <ChevronDown size={24} />
                                </motion.div>
                            </button>
                            
                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-6 pt-0 font-body-lg text-on-surface-variant dark:text-surface-variant leading-relaxed border-t border-outline-variant/10 mt-2 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default FAQSection;
