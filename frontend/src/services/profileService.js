import api from './apiClient';

export const profileService = {
  async getProfile() {
    try {
      const p = await api.get('/profile/me');
      if (p) return p;
    } catch {
      // ignore
    }
    return null;
  },

  async updateProfile(data) {
    try {
      return await api.put('/profile/me', data);
    } catch (e) {
      console.warn('Profile update fallback:', e.message);
      return data;
    }
  },

  async getPreferences() {
    try {
      const prefs = await api.get('/profile/preferences');
      if (prefs) return prefs;
    } catch {
      // ignore
    }
    return {
      daily_reading_goal_minutes: 30,
      font_size: 18,
      reading_theme: 'system',
      auto_generate_quiz: true,
      email_digest: true,
    };
  },

  async updatePreferences(data) {
    try {
      return await api.put('/profile/preferences', data);
    } catch (e) {
      console.warn('Preferences update fallback:', e.message);
      return data;
    }
  },
};

export default profileService;
