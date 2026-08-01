import { auth } from '../config/firebase';

interface RequestOptions extends RequestInit {
    timeout?: number;
    retries?: number;
}

export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}

export const apiClient = async (url: string, options: RequestOptions = {}) => {
    const { timeout = 15000, retries = 1, headers, ...fetchOptions } = options;

    let attempt = 0;

    while (attempt <= retries) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            // Get Firebase Auth token if user is signed in
            let token = null;
            if (auth.currentUser) {
                token = await auth.currentUser.getIdToken();
            }

            const response = await fetch(url, {
                ...fetchOptions,
                headers: {
                    ...headers,
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                signal: controller.signal,
            });
            clearTimeout(id);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { error: response.statusText };
                }
                
                throw new ApiError(
                    errorData.error || `API request failed with status ${response.status}`,
                    response.status,
                    errorData
                );
            }

            return await response.json();
        } catch (error: any) {
            clearTimeout(id);
            
            const isRetryable = error.name === 'AbortError' || (error instanceof ApiError && error.status >= 500);
            
            if (attempt < retries && isRetryable) {
                attempt++;
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                continue;
            }

            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your internet connection.');
            }
            
            throw error;
        }
    }
};
