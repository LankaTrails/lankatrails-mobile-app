import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { saveToken, getToken, clearAllTokens } from '@/utils/secureStore';
import api from '@/api/axiosInstance';
import { router } from 'expo-router';

// Tourist-specific user structure
export interface TouristUser {
    id: number;
    email: string;
    role: 'TOURIST';
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    country: string;
}

// Auth state strictly for tourists
interface AuthState {
    isAuthenticated: boolean;
    user: TouristUser | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
};

export const login = createAsyncThunk(
    'auth/login',
    async (
        { email, password }: { email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            // 1. Login call
            const loginResponse = await api.post('/auth/login', { email, password });
            const loginData = loginResponse.data.data;

            // 2. Role check
            if (loginData.role !== 'TOURIST') {
                return rejectWithValue('Only tourist accounts are allowed in this app.');
            }

            // 3. Save tokens
            await saveToken('ACCESS_TOKEN', loginData.jwtToken);
            await saveToken('REFRESH_TOKEN', loginData.refreshToken);

            // 4. Fetch full profile after login success
            const profileResponse = await api.get('/auth/logged-user');
            const profileData = profileResponse.data.data;

            // 5. Return full tourist user profile
            return {
                id: profileData.id,
                email: profileData.email,
                role: profileData.role,
                emailVerified: profileData.emailVerified,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                country: profileData.country,
            } as TouristUser;

        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                'Login failed. Please try again.'
            );
        }
    }
);


// Check authentication and get profile
export const checkAuth = createAsyncThunk(
    'auth/check',
    async (_, { rejectWithValue }) => {
        try {
            const token = await getToken('ACCESS_TOKEN');
            if (!token) throw new Error('No token found');

            const response = await api.get('/auth/logged-user');

            const data = response.data.data;

            // Return profile (must be tourist)
            return {
                id: data.id,
                email: data.email,
                role: data.role,
                emailVerified: data.emailVerified,
                firstName: data.firstName,
                lastName: data.lastName,
                country: data.country,
            } as TouristUser;
        } catch (error: any) {
            await clearAllTokens();
            return rejectWithValue(
                error.response?.data?.message ||
                'Session expired. Please login again.'
            );
        }
    }
);

// Logout async thunk (replace reducer version)
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch }) => {
        try {
            await api.post('/auth/logout');
            console.log('[AUTH] Backend logout successful');
        } catch (error: any) {
            console.warn('[AUTH] Backend logout failed or unauthorized:', error?.response?.data || error?.message);
        } finally {
            await clearAllTokens();
            router.replace('/signIn');
        }

        // Clear Redux state
        dispatch(authSlice.actions.clearSession());
    }
);


// Tourist-only auth slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSession: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login flow
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<TouristUser>) => {
                console.log('[AUTH SLICE] login.fulfilled, payload:', action.payload);
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // Check auth flow
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action: PayloadAction<TouristUser>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })

            // Logout flow
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.isLoading = false;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
