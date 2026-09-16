import api from './apiClient';

export const libraryService = {
  async getBooks() {
    try {
      return await api.get('/library/books');
    } catch {
      return [
        {
          id: 'b1',
          title: 'Foundations of Modern Statecraft',
          author: 'Dr. Evelyn Vance',
          category: 'Political Theory',
          coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
          progressPercent: 68,
          totalPages: 320,
          currentPage: 218,
          lastReadAt: new Date().toISOString(),
        },
        {
          id: 'b2',
          title: 'Macroeconomic Principles & Monetary Policy',
          author: 'Prof. Julian Sterling',
          category: 'Economics',
          coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=400&q=80',
          progressPercent: 35,
          totalPages: 440,
          currentPage: 154,
          lastReadAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'b3',
          title: 'The Architecture of Artificial Intelligence',
          author: 'S. Alistair Chen',
          category: 'Technology',
          coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
          progressPercent: 92,
          totalPages: 280,
          currentPage: 258,
          lastReadAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ];
    }
  },

  async getCollections() {
    try {
      return await api.get('/library/collections');
    } catch {
      return [
        { id: 'c1', name: 'High Priority UPSC Prelims', bookCount: 5, updatedAt: new Date().toISOString() },
        { id: 'c2', name: 'Deep Tech & Semiconductors', bookCount: 3, updatedAt: new Date().toISOString() },
        { id: 'c3', name: 'Constitutional Precedents', bookCount: 4, updatedAt: new Date().toISOString() },
      ];
    }
  },

  async getReadingLists() {
    try {
      return await api.get('/library/reading-lists');
    } catch {
      return [
        { id: 'rl1', title: 'Weekend Long-form Reads', itemCount: 6 },
        { id: 'rl2', title: 'Daily Current Affairs Revision', itemCount: 12 },
      ];
    }
  },
};

export default libraryService;
