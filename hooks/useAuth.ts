import { useCallback } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import {
  login,
  googleLogin,
  logoutUser,
  checkAuth,
  clearError,
  selectIsAuthenticated,
  selectAuthUser,
  selectAuthLoading,
  selectAuthError,
} from '@/redux/slices/authSlice';
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select auth state slices with shallowEqual to prevent extra renders
  const isAuthenticated = useSelector(selectIsAuthenticated, shallowEqual);
  const user = useSelector(selectAuthUser, shallowEqual);
  const isLoading = useSelector(selectAuthLoading, shallowEqual);
  const error = useSelector(selectAuthError, shallowEqual);

  // Stable callbacks to prevent re-creation on every render
  const signIn = useCallback(
    (email: string, password: string) => {
      dispatch(login({ email, password }));
    },
    [dispatch]
  );

  const signInWithGoogle = useCallback(
    (idToken: string) => {
      dispatch(googleLogin(idToken));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  const checkAuthentication = useCallback(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    signIn,
    signInWithGoogle,
    logout,
    checkAuth: checkAuthentication,
    clearError: clearAuthError,
  };
};
