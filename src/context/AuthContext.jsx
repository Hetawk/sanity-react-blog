import React,
{
    createContext,
    useState,
    useEffect,
    useContext
}

    from 'react';

import {
    createClient
}

    from '../client';

const AuthContext = createContext(null);

export const AuthProvider = ({
    children
}

) => {
    const [isAuthenticated,
        setIsAuthenticated] = useState(false);
    const [authClient,
        setAuthClient] = useState(null);
    const [loading,
        setLoading] = useState(true);

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
                }

                catch (error) {
                    console.error('Auth verification failed:', error);
                    // Clear invalid auth data
                    localStorage.removeItem('dashboardAuth');
                    localStorage.removeItem('sanityToken');
                    setIsAuthenticated(false);
                    setAuthClient(null);
                }
            }

            else {
                setIsAuthenticated(false);
                setAuthClient(null);
            }

            setLoading(false);
        }

            ;

        checkAuth();
    }

        , []);

    // Login function
    const login = (password) => {
        // Get admin password from environment variable
        const envPassword = process.env.REACT_APP_ADMIN_PASSWORD;
        // Get token from environment variable
        const envToken = process.env.SANITY_STUDIO_TOKEN;

        console.log("Checking environment variables...");
        console.log("Admin password available:", envPassword ? "Yes" : "No");
        console.log("Sanity token available:", envToken ? "Yes" : "No");

        // Check if environment variables are available
        if (!envPassword || !envToken) {
            console.error("Environment variables not loaded correctly");
            return false;
        }

        // Check if password matches
        if (password === envPassword) {
            console.log("Password matched!");

            // Store auth state and token
            localStorage.setItem('dashboardAuth', 'true');
            localStorage.setItem('sanityToken', envToken);

            // Create a new client with the token
            const client = createClient(envToken);
            setAuthClient(client);
            setIsAuthenticated(true);

            console.log("Authentication successful!");
            return true;
        }

        console.error("Password didn't match");
        return false;
    }

        ;

    // Logout function
    const logout = () => {
        localStorage.removeItem('dashboardAuth');
        localStorage.removeItem('sanityToken');
        setAuthClient(null);
        setIsAuthenticated(false);
    }

        ;

    // Verify authentication is still valid
    const verifyAuth = async () => {
        if (!authClient) return false;

        try {
            // Try to fetch a small piece of data to verify token is still valid
            await authClient.fetch('*[_type == "skills"][0]');
            return true;
        }

        catch (error) {
            console.error("Authentication verification failed:", error);
            logout(); // Logout if verification fails
            return false;
        }
    }

        ;

    return (<AuthContext.Provider value={
        {
            isAuthenticated,
            login,
            logout,
            authClient,
            verifyAuth,
            loading
        }
    }

    > {
            children
        }

    </AuthContext.Provider>);
}

    ;

export const useAuth = () => useContext(AuthContext);