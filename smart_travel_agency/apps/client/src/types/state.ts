import { UserInfo } from './auth';
import { UserRoles } from './enums';

export interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
}

export type AuthActionType = 
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS', payload: UserInfo }
  | { type: 'LOGIN_FAILURE', error: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER', payload: UserInfo };