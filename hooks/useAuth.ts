// hooks/useAuth.ts
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { login, checkAuth, clearError, logoutUser } from '@/redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, error } = useAppSelector((state) => state.auth);
  console.log('[useAuth] isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    signIn: (email: string, password: string) => dispatch(login({ email, password })),
    logout: () => dispatch(logoutUser()),
    checkAuth: () => dispatch(checkAuth()),
    clearError: () => dispatch(clearError()),
  };
};