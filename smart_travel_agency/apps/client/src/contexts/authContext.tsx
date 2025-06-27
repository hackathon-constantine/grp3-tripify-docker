"use client";

import { createContext, useContext, useReducer, ReactNode, useEffect, JSX } from 'react';
import { AuthState, AuthActionType } from '../types/state';
import { UserInfo } from '../types/auth';
import { UserRoles } from '../types/enums';
import { authService } from '../lib/authService';

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  loading: true,
  error: null,
};

// Create context
const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
} | undefined>(undefined);

// Reducer function
function authReducer(state: AuthState, action: AuthActionType): AuthState {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      if (!action.payload) {
        console.error("LOGIN_SUCCESS action missing payload");
        return {
          ...state,
          isAuthenticated: false,
          loading: false,
          error: "Authentication failed - missing user data",
        };
      }
      return {
        ...state,
        isAuthenticated: true,
        isAdmin: action.payload.role === UserRoles.Admin || action.payload.role === UserRoles.Vendeur,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        loading: false,
        error: action.error,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        loading: false,
        error: null,
      };
    case 'SET_USER':
      if (!action.payload) {
        console.error("SET_USER action missing payload");
        return {
          ...state,
          isAuthenticated: false,
          loading: false,
          error: "Failed to set user - missing user data",
        };
      }
      return {
        ...state,
        isAuthenticated: true,
        isAdmin: action.payload.role === UserRoles.Admin || action.payload.role === UserRoles.Vendeur,
        user: action.payload,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
}

// Provider component with explicit return type
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.data) {
          const userData: UserInfo = {
            id: response.data.sub,
            email: response.data.email,
            role: response.data.role,
            name: response.data.name || '',
            credit: response.data.credit || 0
          };
          dispatch({ type: 'SET_USER', payload: userData });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.log('Auth check failed, user not authenticated');
        dispatch({ type: 'LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const response = await authService.login({ email, password });
      console.log('Login response:', response);
      if (response.user) {
        const userData: UserInfo = {
          id: response.user.id,
          email: response.user.email,
          role: response.user.role,
          name: response.user.name || '',
          credit: response.user.credit || 0
        };
        console.log('Setting user data:', userData);
        dispatch({ type: 'SET_USER', payload: userData });
      } else {
        console.error('Login response missing user data:', response);
        throw new Error('Login response missing user data');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'LOGIN_FAILURE', error: error.message });
      throw error;
    }
  };

  // Admin login function
  const adminLogin = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const response = await authService.adminLogin({ email, password });
      if (response.user) {
        const userData: UserInfo = {
          id: response.user.id,
          email: response.user.email,
          role: response.user.role,
          name: response.user.name || '',
          credit: response.user.credit || 0
        };
        dispatch({ type: 'SET_USER', payload: userData });
      } else {
        throw new Error('Admin login response missing user data');
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', error: error.message });
      throw error;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const response = await authService.register({ name, email, password });
      if (response.user) {
        const userData: UserInfo = {
          id: response.user.id,
          email: response.user.email,
          role: response.user.role,
          name: response.user.name || '',
          credit: response.user.credit || 0
        };
        dispatch({ type: 'SET_USER', payload: userData });
      } else {
        throw new Error('Registration response missing user data');
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', error: error.message });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, adminLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}