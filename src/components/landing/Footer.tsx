import React from 'react';
import { Link } from 'react-router-dom';

const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const LinkedinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const GithubIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>;

const Footer: React.FC = () => {
    return (
        <footer className="bg-surface-container-lowest dark:bg-[#0f0f11] pt-20 pb-10 border-t border-outline-variant/20">
            <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
                    
                    {/* Brand Info */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
                                <span className="material-symbols-outlined text-[20px]">event</span>
                            </div>
                            <span className="font-headline-md text-headline-md font-bold text-on-surface dark:text-[#e1e3e4]">Upvent</span>
                        </div>
                        <p className="font-body-sm text-on-surface-variant dark:text-surface-variant max-w-sm leading-relaxed">
                            The intelligent event management platform built for modern teams. Automate workflows, manage attendees, and extract data effortlessly.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-outline hover:text-primary transition-colors" aria-label="Twitter"><TwitterIcon /></a>
                            <a href="#" className="text-outline hover:text-primary transition-colors" aria-label="LinkedIn"><LinkedinIcon /></a>
                            <a href="#" className="text-outline hover:text-primary transition-colors" aria-label="Facebook"><FacebookIcon /></a>
                            <a href="#" className="text-outline hover:text-primary transition-colors" aria-label="GitHub"><GithubIcon /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-label-caps text-label-caps text-on-surface font-semibold mb-2">Product</h4>
                        <a href="#features" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">Features</a>
                        <a href="#how-it-works" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">How it works</a>
                        <Link to="/login" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">Pricing</Link>
                        <a href="#faq" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">FAQ</a>
                    </div>

                    {/* Resources */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-label-caps text-label-caps text-on-surface font-semibold mb-2">Resources</h4>
                        <Link to="/login" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">Documentation</Link>
                        <a href="#" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">API Reference</a>
                        <a href="#" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">Blog</a>
                        <a href="#" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">Community</a>
                    </div>

                    {/* Company */}
                    <div className="flex flex-col gap-4">
                        <h4 className="font-label-caps text-label-caps text-on-surface font-semibold mb-2">Company</h4>
                        <a href="#about" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">About</a>
                        <a href="#team" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">Team</a>
                        <a href="#contact" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">Contact</a>
                        <Link to="/login" className="font-body-sm text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors">Careers</Link>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-outline-variant/20">
                    <p className="font-body-sm text-xs text-on-surface-variant dark:text-surface-variant">
                        &copy; {new Date().getFullYear()} Upvent Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="/login" className="font-body-sm text-xs text-on-surface-variant dark:text-surface-variant hover:text-on-surface transition-colors">Privacy Policy</Link>
                        <Link to="/login" className="font-body-sm text-xs text-on-surface-variant dark:text-surface-variant hover:text-on-surface transition-colors">Terms of Service</Link>
                        <Link to="/login" className="font-body-sm text-xs text-on-surface-variant dark:text-surface-variant hover:text-on-surface transition-colors">Cookie Settings</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
