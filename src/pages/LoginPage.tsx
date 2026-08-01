import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useOneTapLogin } from '../hooks/useOneTapLogin';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize Google One Tap (it will auto-prompt if eligible)
    useOneTapLogin(true);

    const from = location.state?.from?.pathname || '/dashboard';

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await signInWithPopup(auth, googleProvider);
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error(err);
            // Ignore popup closed errors
            if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                setError(err.message || 'Failed to sign in with Google.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // Attempt login
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            // If user doesn't exist, try to create them seamlessly (per requirements "Create or update user profile")
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    navigate(from, { replace: true });
                } catch (createErr: any) {
                    setError(createErr.message || 'Authentication failed.');
                }
            } else {
                setError(err.message || 'Authentication failed.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-screen flex flex-col font-body-lg text-on-surface dark:bg-[#121212] dark:text-[#e1e3e4] antialiased bg-gradient-to-br from-surface to-surface-container-high dark:from-[#121212] dark:to-[#1e1e1e] transition-colors duration-300">
            <main className="flex-grow flex items-center justify-center p-margin-mobile md:p-margin-desktop relative overflow-hidden">
                {/* Decorative Ambient Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-secondary-fixed opacity-30 blur-[100px]"></div>
                    <div className="absolute -bottom-[20%] -right-[10%] w-[40vw] h-[40vw] rounded-full bg-primary-fixed opacity-40 blur-[120px]"></div>
                </div>

                <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-level-1 p-lg flex flex-col gap-md z-10">
                    {/* Header Area */}
                    <div className="text-center flex flex-col items-center gap-sm mb-sm">
                        <div className="w-16 h-16 bg-surface-variant rounded-xl flex items-center justify-center text-primary mb-xs">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                        </div>
                        <h1 className="font-headline-lg text-headline-lg text-on-surface">Upvent</h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant">All your hackathons. One timeline.</p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-xl font-body-sm mb-2">
                            {error}
                        </div>
                    )}

                    {/* SSO Section */}
                    <div className="flex flex-col gap-xs">
                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full min-h-[48px] rounded-[12px] border border-outline-variant bg-transparent hover:bg-surface-container-low transition-colors flex items-center justify-center gap-sm px-sm font-headline-md text-headline-md text-on-surface disabled:opacity-50"
                        >
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqy7g7fjV-_0J17FQNH24psOuvA7HtBkhYtJ4jx4RqlqinWaoXTNdbTpoSiEKq_Da-_xf2y0fvxptx99KwpZ8D4-rinIhl2bA5IV-Ttj3Q6kJ2L_Qq-iRzy4JpzIdplcvk9cSHkUpzxA2tFIxQAFZ-E12f1rO-r75ND_qKGpu2T3zxeFJYdNE1MVgSiQhsbhHo9-6b9azEVkzvcVic8jgHPIvjYCwk45bvpKN2DebYrRUqnM6db3-a" alt="Google Logo" className="w-6 h-6 object-contain" />
                            Continue with Google
                        </button>
                        <div className="flex items-center gap-xs justify-center font-note text-note text-outline mt-base">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                            <p>We only read event-related emails — nothing else.</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-sm w-full my-sm">
                        <div className="h-px bg-surface-variant flex-grow"></div>
                        <span className="font-label-caps text-label-caps text-on-surface-variant">OR</span>
                        <div className="h-px bg-surface-variant flex-grow"></div>
                    </div>

                    {/* Login Form */}
                    <form className="flex flex-col gap-sm" onSubmit={handleLogin}>
                        <div className="flex flex-col gap-xs">
                            <label className="font-label-caps text-label-caps text-on-surface-variant pl-base" htmlFor="email">Email address</label>
                            <div className="input-glow rounded-[12px] border border-outline-variant bg-surface-container-lowest transition-all duration-200 overflow-hidden flex items-center px-sm min-h-[48px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                <span className="material-symbols-outlined text-outline mr-sm">mail</span>
                                <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-lg text-body-lg text-on-surface outline-none" id="email" placeholder="student@university.edu" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-xs mt-base">
                            <label className="font-label-caps text-label-caps text-on-surface-variant pl-base" htmlFor="password">Password</label>
                            <div className="input-glow rounded-[12px] border border-outline-variant bg-surface-container-lowest transition-all duration-200 overflow-hidden flex items-center px-sm min-h-[48px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                                <span className="material-symbols-outlined text-outline mr-sm">key</span>
                                <input className="w-full bg-transparent border-none p-0 focus:ring-0 font-body-lg text-body-lg text-on-surface outline-none" id="password" placeholder="••••••••" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-base mb-sm">
                            <label className="flex items-center gap-xs cursor-pointer">
                                <input className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer bg-surface-container-lowest" type="checkbox" />
                                <span className="font-body-sm text-body-sm text-on-surface-variant">Remember me</span>
                            </label>
                            <a className="font-body-sm text-body-sm text-primary hover:text-primary-container transition-colors" href="#">Forgot password?</a>
                        </div>

                        <button disabled={isLoading} className="w-full min-h-[48px] rounded-[12px] gradient-btn text-on-primary font-headline-md text-headline-md hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" type="submit">
                            {isLoading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : 'Log in'}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="text-center mt-sm">
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                            New here? <a className="text-primary font-headline-md text-headline-md hover:underline decoration-2 underline-offset-4 ml-xs" href="#">Create an account</a>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="bg-transparent flex flex-col items-center gap-xs w-full py-lg px-margin-mobile text-center">
                <div className="font-label-caps text-label-caps text-on-surface-variant mb-xs">UPVENT</div>
                <div className="flex gap-md font-body-sm text-body-sm text-tertiary">
                    <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
                    <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of Service</a>
                    <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">Campus Safety</a>
                </div>
                <p className="font-note text-note text-tertiary mt-sm">© 2024 Upvent. Academic Vitality for Modern Students.</p>
            </footer>
        </div>
    );
};

export default LoginPage;
