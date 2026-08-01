import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught component error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background dark:bg-[#121212] p-4 text-center font-sans">
                    <div className="bg-surface-container-lowest dark:bg-inverse-surface border border-outline-variant/40 rounded-2xl p-8 max-w-lg shadow-sm">
                        <span className="material-symbols-outlined text-5xl text-error mb-4">error</span>
                        <h1 className="text-2xl font-bold text-on-surface mb-2">Oops! Something went wrong.</h1>
                        <p className="text-on-surface-variant mb-6">
                            We've encountered an unexpected error displaying this page. Our engineers have been notified.
                        </p>
                        <button 
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.href = '/dashboard';
                            }}
                            className="px-6 py-2 bg-primary text-on-primary rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Return to Dashboard
                        </button>
                        {import.meta.env.DEV && (
                            <div className="mt-6 p-4 bg-error-container/20 rounded-lg text-left overflow-auto max-h-40">
                                <pre className="text-xs text-error font-mono whitespace-pre-wrap">
                                    {this.state.error?.toString()}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
