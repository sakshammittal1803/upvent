import React from 'react';
import LandingNavBar from '../components/landing/LandingNavBar';
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import StatisticsSection from '../components/landing/StatisticsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import ContactSection from '../components/landing/ContactSection';
import Footer from '../components/landing/Footer';
import { useOneTapLogin } from '../hooks/useOneTapLogin';

const LandingPage: React.FC = () => {
    // Initialize Google One Tap on the landing page for quick access
    useOneTapLogin(true);

    return (
        <div className="bg-background dark:bg-[#121212] text-on-surface dark:text-[#e1e3e4] min-h-screen font-sans flex flex-col scroll-smooth">
            <LandingNavBar />
            <main className="flex-grow flex flex-col w-full">
                <HeroSection />
                <AboutSection />
                <FeaturesSection />
                <HowItWorksSection />
                <StatisticsSection />
                <TestimonialsSection />
                <FAQSection />
                <ContactSection />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
