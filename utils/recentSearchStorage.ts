import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from "@/utils/logger";

export interface RecentSearch {
    id: string;
    name: string;
    searchQuery: string;
    timestamp: number;
    searchType: 'location' | 'nearby';
    coordinates?: {
        lat: number;
        lng: number;
    };
}

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const saveRecentSearch = async (search: Omit<RecentSearch, 'id' | 'timestamp'>): Promise<void> => {
    try {
        const existingSearches = await getRecentSearches();

        // Check if this search already exists (by name)
        const existingIndex = existingSearches.findIndex(
            item => item.name.toLowerCase() === search.name.toLowerCase()
        );

        // Create new search item
        const newSearch: RecentSearch = {
            ...search,
            id: Date.now().toString(),
            timestamp: Date.now(),
        };

        let updatedSearches: RecentSearch[];

        if (existingIndex !== -1) {
            // Update existing search timestamp and move to top
            updatedSearches = [newSearch, ...existingSearches.filter((_, index) => index !== existingIndex)];
        } else {
            // Add new search to the beginning
            updatedSearches = [newSearch, ...existingSearches];
        }

        // Keep only the most recent searches
        updatedSearches = updatedSearches.slice(0, MAX_RECENT_SEARCHES);

        await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
        logger.error('Error saving recent search:', error);
    }
};

export const getRecentSearches = async (): Promise<RecentSearch[]> => {
    try {
        const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
            const searches: RecentSearch[] = JSON.parse(stored);
            // Sort by timestamp (most recent first)
            return searches.sort((a, b) => b.timestamp - a.timestamp);
        }
        return [];
    } catch (error) {
        logger.error('Error getting recent searches:', error);
        return [];
    }
};

export const removeRecentSearch = async (searchId: string): Promise<void> => {
    try {
        const existingSearches = await getRecentSearches();
        const updatedSearches = existingSearches.filter(search => search.id !== searchId);
        await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
        logger.error('Error removing recent search:', error);
    }
};

export const clearRecentSearches = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
        logger.error('Error clearing recent searches:', error);
    }
};

// Helper function to get location icon based on search type or location name
export const getLocationIcon = (search: RecentSearch): string => {
    if (search.searchType === 'nearby') {
        return '📍';
    }

    const name = search.name.toLowerCase();

    // Sri Lankan locations with specific icons
    if (name.includes('colombo')) return '🏙️';
    if (name.includes('kandy')) return '🏛️';
    if (name.includes('ella')) return '🏔️';
    if (name.includes('galle')) return '🏰';
    if (name.includes('sigiriya')) return '🗿';
    if (name.includes('anuradhapura')) return '🏛️';
    if (name.includes('polonnaruwa')) return '🏛️';
    if (name.includes('dambulla')) return '🗿';
    if (name.includes('nuwara eliya')) return '🏔️';
    if (name.includes('bentota')) return '🏖️';
    if (name.includes('mirissa')) return '🐋';
    if (name.includes('arugam bay')) return '🏄‍♂️';
    if (name.includes('yala')) return '🐆';
    if (name.includes('udawalawe')) return '🐘';
    if (name.includes('beach') || name.includes('bay')) return '🏖️';
    if (name.includes('national park') || name.includes('safari')) return '🦁';
    if (name.includes('temple') || name.includes('dagoba')) return '🛕';
    if (name.includes('mountain') || name.includes('peak')) return '⛰️';
    if (name.includes('waterfall') || name.includes('falls')) return '💧';
    if (name.includes('lake')) return '🏞️';

    // Default location icon
    return '📍';
};
