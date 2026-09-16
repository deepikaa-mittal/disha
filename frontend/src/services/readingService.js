import api from './apiClient';

export const readingService = {
  async getSavedItems() {
    try {
      return await api.get('/reading/saved-items');
    } catch {
      return [];
    }
  },

  async saveItem(data) {
    try {
      return await api.post('/reading/saved-items', data);
    } catch (e) {
      console.warn('Save item offline fallback:', e.message);
      return { id: 'saved-' + Date.now(), ...data };
    }
  },

  async deleteSavedItem(id) {
    try {
      return await api.delete(`/reading/saved-items/${id}`);
    } catch (e) {
      console.warn('Delete saved item offline fallback:', e.message);
      return true;
    }
  },

  async updateProgress(readingEntityId, progressPercent, minutesSpent) {
    try {
      return await api.put('/reading/progress', {
        reading_entity_id: readingEntityId,
        progress_percent: progressPercent,
        minutes_spent: minutesSpent,
        last_opened_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Progress tracking fallback:', e.message);
      return { reading_entity_id: readingEntityId, progress_percent: progressPercent };
    }
  },

  async getAnnotations(readingEntityId) {
    try {
      return await api.get(`/annotations${readingEntityId ? `?reading_entity_id=${readingEntityId}` : ''}`);
    } catch {
      return [];
    }
  },

  async createAnnotation(data) {
    try {
      return await api.post('/annotations', data);
    } catch (e) {
      console.warn('Create annotation fallback:', e.message);
      return { id: 'anno-' + Date.now(), ...data };
    }
  },
};

export default readingService;
