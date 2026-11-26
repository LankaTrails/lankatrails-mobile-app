import { useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import {
  login,
  logoutUser,
  checkAuth,
  refreshProfile,
  clearError,
  selectIsAuthenticated,
  selectAuthUser,
  selectAuthLoading,
  selectAuthInitialized,
  selectAuthError,
} from '@/redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  const isAuthenticated = useSelector(selectIsAuthenticated, shallowEqual);
  const user = useSelector(selectAuthUser, shallowEqual);
  const isLoading = useSelector(selectAuthLoading, shallowEqual);
  const initialized = useSelector(selectAuthInitialized, shallowEqual);
  const error = useSelector(selectAuthError, shallowEqual);

  const signIn = useCallback(
    (email: string, password: string) => dispatch(login({ email, password })),
    [dispatch]
  );
  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);
  const checkAuthentication = useCallback(() => dispatch(checkAuth()), [dispatch]);
  const reloadProfile = useCallback(() => dispatch(refreshProfile()), [dispatch]);
  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    isAuthenticated,
    user,
    isLoading,
    initialized,
    error,
    signIn,
    logout,
    checkAuth: checkAuthentication,
    refreshProfile: reloadProfile,
    clearError: clearAuthError,
  };
};
