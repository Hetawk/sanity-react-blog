import React, {
    createContext,
    useState,
    useEffect,
    useContext
} from 'react';

import {
    createClient
} from '../client';

const AuthContext = createContext(null);

export const AuthProvider = ({
    children
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authClient, setAuthClient] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);

            // Get token from local storage
            const token = localStorage.getItem('sanityToken');
            const isAuth = localStorage.getItem('dashboardAuth') === 'true';

            if (token && isAuth) {
                try {
                    // Create client with token
                    const client = createClient(token);

                    // Verify token is valid by making a test request
                    await client.fetch('*[_type == "skills"][0]');

                    // If no error was thrown, set the authenticated client
                    setAuthClient(client);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Auth verification failed:', error);
                    // Clear invalid auth data
                    localStorage.removeItem('dashboardAuth');
                    localStorage.removeItem('sanityToken');
                    setIsAuthenticated(false);
                    setAuthClient(null);
                }
            } else {
                setIsAuthenticated(false);
                setAuthClient(null);
            }

            setLoading(false);
        };

        checkAuth();
    }, []);

    // Login function with manual fallback option
    const login = (password) => {
        // Get token from environment variables (with fallback for development)
        const envToken = process.env.REACT_APP_SANITY_TOKEN;

        // Get admin password from environment variables
        const envPassword = process.env.REACT_APP_ADMIN_PASSWORD;

        console.log("Login attempt with password.");
        console.log("Environment variables status:", {
            "REACT_APP_ADMIN_PASSWORD": envPassword ? "Loaded" : "Missing",
            "REACT_APP_SANITY_TOKEN": envToken ? "Loaded" : "Missing"
        });

        // Special development mode password (enter "dev-mode" in the password field)
        if (password === "dev-mode") {
            console.log("Development mode activated - contact your administrator for proper setup");

            // For dev mode, use local storage to simulate token
            const devToken = prompt("Enter your Sanity token for development:");
            if (!devToken) return false;

            // Store auth state and token
            localStorage.setItem('dashboardAuth', 'true');
            localStorage.setItem('sanityToken', devToken);

            // Create a new client with the token
            const client = createClient(devToken);
            setAuthClient(client);
            setIsAuthenticated(true);

            return true;
        }

        // Normal mode - check against environment variable
        if (envPassword && password === envPassword && envToken) {
            console.log("Password matched!");

            // Store auth state and token
            localStorage.setItem('dashboardAuth', 'true');
            localStorage.setItem('sanityToken', envToken);

            // Create a new client with the token
            const client = createClient(envToken);
            setAuthClient(client);
            setIsAuthenticated(true);

            return true;
        }

        // If environment variables are missing, show helpful error
        if (!envPassword || !envToken) {
            console.error("Missing required environment variables:");
            if (!envPassword) console.error("- REACT_APP_ADMIN_PASSWORD not found");
            if (!envToken) console.error("- REACT_APP_SANITY_TOKEN not found");
        } else {
            console.error("Password didn't match");
        }

        return false;
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('dashboardAuth');
        localStorage.removeItem('sanityToken');
        setAuthClient(null);
        setIsAuthenticated(false);
    };

    // Verify authentication is still valid
    const verifyAuth = async () => {
        if (!authClient) return false;

        try {
            // Try to fetch a small piece of data to verify token is still valid
            await authClient.fetch('*[_type == "skills"][0]');
            return true;
        } catch (error) {
            console.error("Authentication verification failed:", error);
            logout(); // Logout if verification fails
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                login,
                logout,
                authClient,
                verifyAuth,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);