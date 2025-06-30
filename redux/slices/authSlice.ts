import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/api/axiosInstance';
import { saveToken, getToken, clearAllTokens } from '@/utils/secureStore';
import { router } from 'expo-router';

export interface TouristUser {
    id: number;
    email: string;
    role: 'TOURIST';
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    country: string;
}

export interface AuthState {
    user: TouristUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Async Thunks

export const login = createAsyncThunk<
    TouristUser,
    { email: string; password: string },
    { rejectValue: string }
>(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const loginResponse = await api.post('/auth/login', { email, password });
            const loginData = loginResponse.data.data;

            if (loginData.role !== 'ROLE_TOURIST') {
                return rejectWithValue('Only tourist accounts are allowed in this app.');
            }

            await saveToken('ACCESS_TOKEN', loginData.jwtToken);
            await saveToken('REFRESH_TOKEN', loginData.refreshToken);

            // Fetch full profile
            const profileResponse = await api.get('/auth/logged-user');
            const profileData = profileResponse.data.data;

            return {
                id: profileData.id,
                email: profileData.email,
                role: profileData.role,
                emailVerified: profileData.emailVerified,
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                country: profileData.country,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Login failed. Please try again.'
            );
        }
    }
);

export const googleLogin = createAsyncThunk<
    TouristUser,
    string,
    { rejectValue: string }
>('auth/googleLogin', async (idToken, { rejectWithValue }) => {
    try {
        const res = await api.post('/oauth2/authorization/google', { idToken });

        await saveToken('ACCESS_TOKEN', res.data.jwtToken);
        await saveToken('REFRESH_TOKEN', res.data.refreshToken);

        return {
            id: res.data.id,
            email: res.data.email,
            role: 'TOURIST',
            emailVerified: res.data.emailVerified,
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            country: res.data.country,
        };
    } catch (error: any) {
        await clearAllTokens();
        return rejectWithValue(error.message || 'Google login failed. Please try again.');
    }
});

export const checkAuth = createAsyncThunk<TouristUser, void, { rejectValue: string }>(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const token = await getToken('ACCESS_TOKEN');
            if (!token) throw new Error('No access token found');

            const response = await api.get('/auth/logged-user');
            const data = response.data.data;

            return {
                id: data.id,
                email: data.email,
                role: data.role,
                emailVerified: data.emailVerified,
                firstName: data.firstName,
                lastName: data.lastName,
                country: data.country,
            };
        } catch (error: any) {
            await clearAllTokens();
            return rejectWithValue(error.response?.data?.message || 'Session expired. Please login again.');
        }
    }
);

export const logoutUser = createAsyncThunk<void, void>(
    'auth/logoutUser',
    async (_, { dispatch }) => {
        try {
            await api.post('/auth/logout');
            console.info('[AUTH] Backend logout successful');
        } catch (error: any) {
            console.warn('[AUTH] Backend logout failed or unauthorized:', error?.message || error);
        } finally {
            await clearAllTokens();
            router.replace('/signIn');
            dispatch(authSlice.actions.clearSession());
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
        clearSession(state) {
            state.isAuthenticated = false;
            state.user = null;
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<TouristUser>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Login failed';
            })

            // Google login
            .addCase(googleLogin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action: PayloadAction<TouristUser>) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Google login failed';
            })

            // Check auth
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

            // Logout
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

// Selectors for ease of access
export const selectAuthState = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
