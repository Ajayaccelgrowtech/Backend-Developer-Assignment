import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('crm_user') || 'null'),
  token: localStorage.getItem('crm_token') || null,
  refreshToken: localStorage.getItem('crm_refresh_token') || null,
  isAuthenticated: !!localStorage.getItem('crm_token')
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken?: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.token = accessToken;
      if (refreshToken) state.refreshToken = refreshToken;
      state.isAuthenticated = true;

      localStorage.setItem('crm_user', JSON.stringify(user));
      localStorage.setItem('crm_token', accessToken);
      if (refreshToken) localStorage.setItem('crm_refresh_token', refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem('crm_user');
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_refresh_token');
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
