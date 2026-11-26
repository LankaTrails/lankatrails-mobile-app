import api from '@/api/axiosInstance';
import { clearAllTokens, getToken, saveToken } from '@/utils/tokenStorage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

/** The only role allowed in the mobile app (the backend's role name). */
export const TOURIST_ROLE = 'ROLE_TOURIST';

export interface TouristUser {
    id: number;
    email: string;
    role: typeof TOURIST_ROLE;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    country: string;
    phone: string;
    profilePicUrl?: string;
}

export interface AuthState {
    user: TouristUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    /** True once the stored session has been checked on startup. */
    initialized: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    initialized: false,
    error: null,
};

const NOT_TOURIST = 'Only tourist accounts can sign in to the LankaTrails app.';

interface LoggedUserResponse {
    id: number;
    email: string;
    role: string;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    country: string;
    phoneNumber: string;
    profilePictureUrl?: string;
}

async function fetchProfile(): Promise<TouristUser> {
    const { data } = await api.get<{ data: LoggedUserResponse }>('/auth/logged-user');
    const profile = data.data;
    if (profile.role !== TOURIST_ROLE) throw new Error(NOT_TOURIST);
    return {
        id: profile.id,
        email: profile.email,
        role: TOURIST_ROLE,
        emailVerified: profile.emailVerified,
        firstName: profile.firstName,
        lastName: profile.lastName,
        country: profile.country,
        phone: profile.phoneNumber,
        profilePicUrl: profile.profilePictureUrl,
    };
}

function messageOf(error: unknown, fallback: string): string {
    const e = error as { response?: { data?: { message?: string } }; message?: string } | undefined;
    return e?.response?.data?.message || e?.message || fallback;
}

export const login = createAsyncThunk<TouristUser, { email: string; password: string }, { rejectValue: string }>(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/auth/login', { email: email.trim(), password });
            const session = data.data;
            if (session.role !== TOURIST_ROLE) return rejectWithValue(NOT_TOURIST);

            await saveToken('ACCESS_TOKEN', session.jwtToken);
            await saveToken('REFRESH_TOKEN', session.refreshToken);
            return await fetchProfile();
        } catch (error) {
            await clearAllTokens();
            return rejectWithValue(messageOf(error, 'Sign in failed. Please try again.'));
        }
    }
);

/** Restores the stored session on startup. */
export const checkAuth = createAsyncThunk<TouristUser, void, { rejectValue: string }>(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            if (!(await getToken('ACCESS_TOKEN')) && !(await getToken('REFRESH_TOKEN'))) {
                return rejectWithValue('');
            }
            return await fetchProfile();
        } catch (error) {
            const e = error as { isNetworkError?: boolean };
            // Keep the tokens when the server is merely unreachable, so the next launch can retry
            if (!e?.isNetworkError) await clearAllTokens();
            return rejectWithValue(messageOf(error, 'Session expired. Please sign in again.'));
        }
    }
);

/** Re-reads the profile after an edit, without touching the global loading flag. */
export const refreshProfile = createAsyncThunk<TouristUser, void, { rejectValue: string }>(
    'auth/refreshProfile',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchProfile();
        } catch (error) {
            return rejectWithValue(messageOf(error, 'Could not refresh your profile.'));
        }
    }
);

export const logoutUser = createAsyncThunk<void, void>('auth/logoutUser', async () => {
    try {
        await api.post('/auth/logout');
    } catch {
        // signing out locally is enough when the server call fails
    } finally {
        await clearAllTokens();
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError(state) {
            state.error = null;
        },
        /** Used when the refresh token is rejected: drop the user but keep the app initialized. */
        clearSession(state) {
            state.isAuthenticated = false;
            state.user = null;
            state.isLoading = false;
            state.error = null;
            state.initialized = true;
        },
    },
    extraReducers: (builder) => {
        builder
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
                state.error = action.payload || 'Sign in failed';
            })
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action: PayloadAction<TouristUser>) => {
                state.isLoading = false;
                state.initialized = true;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false;
                state.initialized = true;
                state.isAuthenticated = false;
                state.user = null;
            })
            .addCase(refreshProfile.fulfilled, (state, action: PayloadAction<TouristUser>) => {
                state.user = action.payload;
            })
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthInitialized = (state: { auth: AuthState }) => state.auth.initialized;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export const { clearError, clearSession } = authSlice.actions;
export default authSlice.reducer;
