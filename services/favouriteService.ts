import api from "@/api/axiosInstance";
import { FavoriteItem } from "@/types/triptypes";
import { logger } from "@/utils/logger";


export const getFavorites = async (): Promise<FavoriteItem[]> => {
    try {
        const response = await api.get('/tourist/favourites' );
        return response.data.data;
    } catch (error) {
        logger.error('Error fetching favorite items: ', error);
        throw new Error('Failed to fetch favorite items');
    }
}
    
export const addFavorites = async (favouriteItem: FavoriteItem): Promise<FavoriteItem[]> => {
    try {
        const response = await api.post('/tourist/add-favourites', favouriteItem);
        return response.data.data;
    } catch (error) {
        logger.error('Error adding favorite item: ', error);
        throw new Error('Failed to add favorite item');
    }
}

export const removeFavorites = async (favouriteItem: FavoriteItem): Promise<FavoriteItem[]> => {
    try {
        const response = await api.delete('/tourist/remove-favourite', { data: favouriteItem });
        return response.data.data;
    } catch (error) {
        logger.error('Error removing favorite item: ', error);
        throw new Error('Failed to remove favorite item');
    }
}
