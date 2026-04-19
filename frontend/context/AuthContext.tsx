'use client';

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { IUser, AuthState, LoginPayload, RegisterPayload } from '@/types';
import { authAPI } from '@/lib/api';
import { saveToken, saveUser, clearAuth, getSavedUser, getToken, isTokenExpired, getDashboardPath } from '@/lib/auth';
import { useRouter } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login:    (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout:   () => void;
  refreshUser: () => Promise<void>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: IUser; token: string; providerId?: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_USER'; payload: Partial<IUser> };

// ── Initial State ─────────────────────────────────────────────────────────────
const initialState: AuthState = {
  user:            null,
  token:           null,
  isAuthenticated: false,
  isLoading:       true,
};

// ── Reducer ───────────────────────────────────────────────────────────────────
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user:            action.payload.user,
        token:           action.payload.token,
        providerId:      action.payload.providerId,
        isAuthenticated: true,
        isLoading:       false,
      };
    case 'CLEAR_USER':
      return { ...initialState, isLoading: false };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();

  // Hydrate from localStorage on mount
  useEffect(() => {
    const token = getToken();
    const user  = getSavedUser();

    if (token && user && !isTokenExpired(token)) {
      dispatch({ type: 'SET_USER', payload: { user, token } });
    } else {
      clearAuth();
      dispatch({ type: 'CLEAR_USER' });
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res  = await authAPI.login(payload);
      const { token, user, providerId } = res.data.data;
      saveToken(token);
      saveUser(user);
      dispatch({ type: 'SET_USER', payload: { user, token, providerId } });
      router.push(getDashboardPath(user.role));
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  }, [router]);

  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res  = await authAPI.register(payload);
      const { token, user } = res.data.data;
      saveToken(token);
      saveUser(user);
      dispatch({ type: 'SET_USER', payload: { user, token } });
      router.push(getDashboardPath(user.role));
    } catch (err) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw err;
    }
  }, [router]);

  const logout = useCallback((): void => {
    authAPI.logout().catch(() => {});
    clearAuth();
    dispatch({ type: 'CLEAR_USER' });
    router.push('/login');
  }, [router]);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const res  = await authAPI.getMe();
      const user = res.data.data.user as IUser;
      saveUser(user);
      dispatch({ type: 'UPDATE_USER', payload: user });
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
