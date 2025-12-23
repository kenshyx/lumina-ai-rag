import { useState, useEffect } from 'react';

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

/**
 * Return type for the usePWAInstall hook.
 */
interface UsePWAInstallReturn {
    /** Whether the PWA can be installed */
    canInstall: boolean;
    /** Whether the PWA is installed */
    isInstalled: boolean;
    /** Function to prompt the user to install the PWA */
    promptInstall: () => Promise<void>;
    /** Whether the install prompt is currently being shown */
    isPrompting: boolean;
}

/**
 * Custom hook for managing PWA installation.
 * 
 * This hook provides functionality to:
 * - Detect if the PWA can be installed
 * - Detect if the PWA is already installed
 * - Prompt the user to install the PWA
 * 
 * @returns Object containing installation state and functions
 * 
 * @example
 * ```tsx
 * const { canInstall, isInstalled, promptInstall } = usePWAInstall();
 * 
 * {canInstall && !isInstalled && (
 *   <button onClick={promptInstall}>Install App</button>
 * )}
 * ```
 */
export const usePWAInstall = (): UsePWAInstallReturn => {
    const [canInstall, setCanInstall] = useState<boolean>(false);
    const [isInstalled, setIsInstalled] = useState<boolean>(false);
    const [isPrompting, setIsPrompting] = useState<boolean>(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        // Check if app is already installed
        const checkInstalled = () => {
            // Check if running in standalone mode (installed)
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                                 (window.navigator as Navigator & { standalone?: boolean }).standalone ||
                                 document.referrer.includes('android-app://');
            
            setIsInstalled(isStandalone);
        };

        checkInstalled();

        // Listen for the beforeinstallprompt event
        const handleBeforeInstallPrompt = (event: Event) => {
            const installEvent = event as BeforeInstallPromptEvent;
            
            // Only prevent default if the event has the prompt method (PWA installable)
            if (installEvent.prompt) {
                // Prevent the default browser install prompt so we can show our custom button
                // The browser will show a console warning "Banner not shown: beforeinstallpromptevent.preventDefault() called"
                // This is expected behavior - we prevent default to control when the prompt appears.
                // The warning will be resolved when prompt() is called (when user clicks install button).
                event.preventDefault();
                
                // Store the event for later use (when user clicks install button)
                setDeferredPrompt(installEvent);
                setCanInstall(true);
                
                console.log('[PWA Install] Install prompt available - install button will appear in header');
            }
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            console.log('[PWA Install] App was installed');
            setIsInstalled(true);
            setCanInstall(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Re-check installed status periodically (in case user installs via browser UI)
        const interval = setInterval(checkInstalled, 1000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            clearInterval(interval);
        };
    }, []);

    /**
     * Prompt the user to install the PWA.
     * 
     * This function calls prompt() on the deferred beforeinstallprompt event,
     * which resolves the browser's console warning about preventDefault().
     */
    const promptInstall = async (): Promise<void> => {
        if (!deferredPrompt) {
            console.warn('[PWA Install] Install prompt not available');
            return;
        }

        setIsPrompting(true);

        try {
            // Call prompt() - this resolves the browser warning about preventDefault()
            // and shows the native install dialog
            await deferredPrompt.prompt();
            
            // Wait for the user's response
            const choiceResult = await deferredPrompt.userChoice;
            
            if (choiceResult.outcome === 'accepted') {
                console.log('[PWA Install] User accepted the install prompt');
                setIsInstalled(true);
            } else {
                console.log('[PWA Install] User dismissed the install prompt');
            }
            
            // Clear the deferred prompt after use
            // The prompt can only be used once per event
            setDeferredPrompt(null);
            setCanInstall(false);
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            console.error('[PWA Install] Error showing install prompt:', err);
            // Clear the prompt on error as it may be invalid
            setDeferredPrompt(null);
            setCanInstall(false);
        } finally {
            setIsPrompting(false);
        }
    };

    return {
        canInstall,
        isInstalled,
        promptInstall,
        isPrompting
    };
};

