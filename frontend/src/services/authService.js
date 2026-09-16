import api from './apiClient';

export const authService = {
  async requestOtp(email) {
    return api.post('/auth/request-otp', { email });
  },

  async verifyOtp(email, otp) {
    const data = await api.post('/auth/verify-otp', { email, otp });
    if (data && data.access_token) {
      api.setTokens(data.access_token, data.refresh_token);
      localStorage.setItem('tootler_user', JSON.stringify({ email }));
    }
    return data;
  },

  async logout() {
    const refreshToken = api.getRefreshToken();
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (err) {
        console.warn('Backend logout notification failed:', err);
      }
    }
    api.clearTokens();
  },

  getCurrentUser() {
    const raw = localStorage.getItem('tootler_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!api.getToken();
  },
};

export default authService;
