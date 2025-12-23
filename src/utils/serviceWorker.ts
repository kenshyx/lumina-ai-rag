/**
 * Service Worker registration and management utilities.
 * 
 * Handles registration, updates, and lifecycle management of the PWA service worker.
 */

/**
 * Service Worker registration state.
 */
interface ServiceWorkerRegistrationState {
    /** Whether service workers are supported */
    isSupported: boolean;
    /** Whether a service worker is registered */
    isRegistered: boolean;
    /** Whether a service worker update is available */
    updateAvailable: boolean;
    /** Current registration instance */
    registration: ServiceWorkerRegistration | null;
}

/**
 * Register the service worker for PWA functionality.
 * 
 * @returns Promise that resolves when registration is complete
 * 
 * @example
 * ```typescript
 * await registerServiceWorker();
 * ```
 */
export const registerServiceWorker = async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) {
        console.warn('[Service Worker] Service workers are not supported in this browser');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });

        console.log('[Service Worker] Registered successfully:', registration.scope);

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            console.log('[Service Worker] New service worker found, installing...');

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker is ready, but old one is still active
                    console.log('[Service Worker] New service worker installed. Refresh to update.');
                    // Could show a notification to the user here
                } else if (newWorker.state === 'activated') {
                    console.log('[Service Worker] New service worker activated');
                }
            });
        });

        // Handle controller change (new service worker took control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[Service Worker] Controller changed, reloading page...');
            window.location.reload();
        });

    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[Service Worker] Registration failed:', err);
    }
};

/**
 * Unregister the service worker (useful for development or cleanup).
 * 
 * @returns Promise that resolves when unregistration is complete
 * 
 * @example
 * ```typescript
 * await unregisterServiceWorker();
 * ```
 */
export const unregisterServiceWorker = async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const unregistered = await registration.unregister();
        
        if (unregistered) {
            console.log('[Service Worker] Unregistered successfully');
        } else {
            console.warn('[Service Worker] Unregistration failed');
        }
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[Service Worker] Unregistration error:', err);
    }
};

/**
 * Check if service workers are supported in the current browser.
 * 
 * @returns True if service workers are supported
 */
export const isServiceWorkerSupported = (): boolean => {
    return 'serviceWorker' in navigator;
};

/**
 * Get the current service worker registration state.
 * 
 * @returns Promise that resolves with the current registration state
 */
export const getServiceWorkerState = async (): Promise<ServiceWorkerRegistrationState> => {
    const isSupported = isServiceWorkerSupported();
    
    if (!isSupported) {
        return {
            isSupported: false,
            isRegistered: false,
            updateAvailable: false,
            registration: null
        };
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        return {
            isSupported: true,
            isRegistered: !!registration,
            updateAvailable: !!registration.waiting,
            registration
        };
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[Service Worker] Error getting state:', err);
        return {
            isSupported: true,
            isRegistered: false,
            updateAvailable: false,
            registration: null
        };
    }
};

/**
 * Prompt the user to install the PWA.
 * 
 * This function should be called in response to the `beforeinstallprompt` event.
 * 
 * @param event - The beforeinstallprompt event
 * @returns Promise that resolves when the install prompt is shown
 */
export const promptPWAInstall = async (event: Event): Promise<void> => {
    const installEvent = event as BeforeInstallPromptEvent;
    
    if (!installEvent) {
        console.warn('[PWA Install] Install prompt event not available');
        return;
    }

    try {
        await installEvent.prompt();
        const choiceResult = await installEvent.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
            console.log('[PWA Install] User accepted the install prompt');
        } else {
            console.log('[PWA Install] User dismissed the install prompt');
        }
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[PWA Install] Error showing install prompt:', err);
    }
};

/**
 * Extended Window interface to include beforeinstallprompt event.
 */
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}

