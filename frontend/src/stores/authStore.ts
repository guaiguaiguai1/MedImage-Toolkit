import { create } from 'zustand';
import { authApi } from '../services/api';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  username: localStorage.getItem('username'),

  login: async (username: string, password: string) => {
    const data = await authApi.login(username, password);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('username', username);
    set({
      token: data.access_token,
      isAuthenticated: true,
      username,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    set({
      token: null,
      isAuthenticated: false,
      username: null,
    });
  },
}));
