import React, { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';

const AnimatedCounter = ({ value, suffix = "" }: { value: number, suffix?: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    
    // We use a spring to animate the number smoothly
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 40,
        stiffness: 100,
        duration: 2
    });

    useEffect(() => {
        if (inView) {
            motionValue.set(value);
        }
    }, [inView, value, motionValue]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Intl.NumberFormat('en-US').format(Math.floor(latest)) + suffix;
            }
        });
    }, [springValue, suffix]);

    return <span ref={ref} className="font-headline-lg text-4xl md:text-5xl font-bold text-on-surface dark:text-[#e1e3e4]" />;
};

const StatisticsSection: React.FC = () => {
    const stats = [
        { label: "Events Managed", value: 15400, suffix: "+" },
        { label: "Active Users", value: 25000, suffix: "+" },
        { label: "Departments", value: 120, suffix: "" },
        { label: "Partner Projects", value: 450, suffix: "+" },
        { label: "Years Experience", value: 10, suffix: "+" },
    ];

    return (
        <section className="py-20 bg-primary/5 dark:bg-primary/10 border-y border-outline-variant/20 overflow-hidden">
            <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
                    {stats.map((stat, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="flex flex-col items-center text-center"
                        >
                            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                            <span className="font-label-caps text-label-caps text-on-surface-variant dark:text-surface-variant mt-2 uppercase tracking-widest">
                                {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default StatisticsSection;
