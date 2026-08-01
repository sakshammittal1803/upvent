import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
];

const LandingNavBar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);

            // Update active section based on scroll position
            const sections = navLinks.map(link => link.href.substring(1));
            let current = 'home';
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // If the top of the section is near the top of the viewport
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        current = section;
                    }
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        const element = document.querySelector(href);
        if (element) {
            const offset = 80; // Account for navbar height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-surface-container-lowest/90 dark:bg-[#121212]/90 backdrop-blur-md shadow-sm border-b border-outline-variant/30 py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop flex justify-between items-center">
                {/* Logo */}
                <a href="#home" onClick={(e) => scrollToSection(e, '#home')} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
                        <span className="material-symbols-outlined text-[20px]">event</span>
                    </div>
                    <span className="font-headline-md text-headline-md font-bold text-on-surface dark:text-[#e1e3e4]">Upvent</span>
                </a>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <a 
                            key={link.name}
                            href={link.href}
                            onClick={(e) => scrollToSection(e, link.href)}
                            className={`font-body-sm text-body-sm font-medium transition-colors hover:text-primary ${activeSection === link.href.substring(1) ? 'text-primary' : 'text-on-surface-variant dark:text-surface-variant'}`}
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Link to="/login" className="font-body-sm text-body-sm font-semibold text-on-surface hover:text-primary transition-colors">
                        Log in
                    </Link>
                    <Link to="/login" className="gradient-btn text-on-primary font-body-sm text-body-sm font-semibold px-5 py-2.5 rounded-full shadow-level-1 hover:shadow-level-2 transition-all">
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button 
                    className="md:hidden text-on-surface-variant hover:text-on-surface p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle Menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Nav Overlay */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-surface-container-lowest dark:bg-inverse-surface border-b border-outline-variant/30 shadow-level-2 flex flex-col p-4 md:hidden animate-in slide-in-from-top-2">
                    {navLinks.map((link) => (
                        <a 
                            key={link.name}
                            href={link.href}
                            onClick={(e) => scrollToSection(e, link.href)}
                            className={`px-4 py-3 font-body-lg text-body-lg font-medium border-b border-outline-variant/10 ${activeSection === link.href.substring(1) ? 'text-primary bg-primary/5' : 'text-on-surface dark:text-[#e1e3e4]'}`}
                        >
                            {link.name}
                        </a>
                    ))}
                    <div className="flex flex-col gap-3 mt-4 px-4">
                        <Link to="/login" className="w-full text-center font-body-lg text-body-lg font-semibold text-on-surface py-2 border border-outline-variant rounded-lg">
                            Log in
                        </Link>
                        <Link to="/login" className="w-full text-center gradient-btn text-on-primary font-body-lg text-body-lg font-semibold py-2 rounded-lg shadow-level-1">
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default LandingNavBar;
