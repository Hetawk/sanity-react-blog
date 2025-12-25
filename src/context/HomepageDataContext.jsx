import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/client';

/**
 * HomepageDataContext
 * 
 * Provides a single source of truth for all homepage data.
 * Fetches all data in ONE API call instead of 6+ separate calls.
 * This dramatically improves initial page load performance.
 */

const HomepageDataContext = createContext(null);

export const HomepageDataProvider = ({ children }) => {
    const [data, setData] = useState({
        abouts: [],
        works: [],
        skills: [],
        experiences: [],
        awards: [],
        brands: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all homepage data in one request
    const fetchHomepageData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.homepage.getAll();

            if (response.success && response.data) {
                setData(response.data);
            }
        } catch (err) {
            console.error('Error fetching homepage data:', err);
            setError(err.message);

            // Fallback: fetch data individually if combined endpoint fails
            try {
                const [aboutsRes, worksRes, skillsRes, experiencesRes, awardsRes, brandsRes] = await Promise.all([
                    api.abouts.getAll(),
                    api.works.getAll(),
                    api.skills.getAll(),
                    api.experiences.getAll({ featured: true }),
                    api.awards.getAll(),
                    api.brands.getAll()
                ]);

                setData({
                    abouts: aboutsRes.data || [],
                    works: worksRes.data || [],
                    skills: skillsRes.data || [],
                    experiences: experiencesRes.data || [],
                    awards: awardsRes.data || [],
                    brands: brandsRes.data || []
                });
                setError(null);
            } catch (fallbackErr) {
                console.error('Fallback fetch also failed:', fallbackErr);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        fetchHomepageData();
    }, [fetchHomepageData]);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        ...data,
        loading,
        error,
        refetch: fetchHomepageData
    }), [data, loading, error, fetchHomepageData]);

    return (
        <HomepageDataContext.Provider value={value}>
            {children}
        </HomepageDataContext.Provider>
    );
};

/**
 * Hook to access homepage data
 * @returns {Object} Homepage data and loading state
 */
export const useHomepageData = () => {
    const context = useContext(HomepageDataContext);
    if (!context) {
        throw new Error('useHomepageData must be used within a HomepageDataProvider');
    }
    return context;
};

export default HomepageDataContext;
