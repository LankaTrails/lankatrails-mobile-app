import api from "@/api/axiosInstance";
import { FavoriteItem } from "@/types/triptypes";


export const getFavorites = async (): Promise<FavoriteItem[]> => {
    try {
        console.log('Fetching favorite items for user');
        const response = await api.get('/tourist/favourites' );
        console.log('getFavorites response: ', response);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching favorite items: ', error);
        throw new Error('Failed to fetch favorite items');
    }
}
    
export const addFavorites = async (favouriteItem: FavoriteItem): Promise<FavoriteItem[]> => {
    try {
        console.log('Adding favorite item for user');
        const response = await api.post('/tourist/add-favourites', favouriteItem);
        console.log('addFavorites response: ', response);
        return response.data.data;
    } catch (error) {
        console.error('Error adding favorite item: ', error);
        throw new Error('Failed to add favorite item');
    }
}

export const removeFavorites = async (favouriteItem: FavoriteItem): Promise<FavoriteItem[]> => {
    try {
        console.log('Removing favorite item for user');
        const response = await api.delete('/tourist/remove-favourite', { data: favouriteItem });
        console.log('removeFavorites response: ', response);
        return response.data.data;
    } catch (error) {
        console.error('Error removing favorite item: ', error);
        throw new Error('Failed to remove favorite item');
    }
}
