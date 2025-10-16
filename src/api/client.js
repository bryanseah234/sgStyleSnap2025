// Standalone API client for StyleSnap
// Local data management with localStorage persistence

class StyleSnapAPI {
  constructor() {
    this.auth = new AuthService();
    this.entities = {
      ClothingItem: new EntityService('clothing-items'),
      Outfit: new EntityService('outfits'),
      Friendship: new EntityService('friendships')
    };
    this.integrations = {
      Core: {
        UploadFile: async ({ file }) => {
          // Convert file to base64 for local storage
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ file_url: reader.result });
            };
            reader.readAsDataURL(file);
          });
        }
      }
    };
  }
}

class AuthService {
  constructor() {
    this.currentUser = this.loadUser();
  }

  loadUser() {
    const stored = localStorage.getItem('stylesnap_user');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      email: 'demo@stylesnap.com',
      full_name: 'Demo User',
      id: 'user-demo',
      bio: 'Welcome to StyleSnap!',
      gender: '',
      profile_image: ''
    };
  }

  saveUser(user) {
    localStorage.setItem('stylesnap_user', JSON.stringify(user));
    this.currentUser = user;
  }

  async me() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.currentUser;
  }

  async updateMe(data) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const updatedUser = { ...this.currentUser, ...data };
    this.saveUser(updatedUser);
    return updatedUser;
  }

  async login(email, password) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = {
      email,
      full_name: email.split('@')[0],
      id: 'user-' + Date.now(),
      bio: '',
      gender: '',
      profile_image: ''
    };
    this.saveUser(user);
    return user;
  }

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 100));
    localStorage.removeItem('stylesnap_user');
    this.currentUser = null;
    return true;
  }
}

class EntityService {
  constructor(entityName) {
    this.entityName = entityName;
    this.storageKey = `stylesnap_${entityName}`;
    this.data = this.loadData();
  }

  loadData() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    return this.getDefaultData();
  }

  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  getDefaultData() {
    if (this.entityName === 'clothing-items') {
      return [
        {
          id: '1',
          name: 'Blue Jeans',
          category: 'bottoms',
          brand: 'Levi\'s',
          image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
          created_by: 'demo@stylesnap.com',
          created_date: new Date().toISOString(),
          is_favorite: false
        },
        {
          id: '2',
          name: 'White T-Shirt',
          category: 'tops',
          brand: 'Uniqlo',
          image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
          created_by: 'demo@stylesnap.com',
          created_date: new Date().toISOString(),
          is_favorite: true
        },
        {
          id: '3',
          name: 'Black Jacket',
          category: 'outerwear',
          brand: 'Zara',
          image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
          created_by: 'demo@stylesnap.com',
          created_date: new Date().toISOString(),
          is_favorite: false
        }
      ];
    } else if (this.entityName === 'outfits') {
      return [
        {
          id: '1',
          name: 'Casual Friday',
          created_by: 'demo@stylesnap.com',
          created_date: new Date().toISOString(),
          is_favorite: true,
          items: [
            { item_id: '1', x: 100, y: 100, scale: 1, rotation: 0, z_index: 0 },
            { item_id: '2', x: 200, y: 150, scale: 1, rotation: 0, z_index: 1 }
          ]
        }
      ];
    } else if (this.entityName === 'friendships') {
      return [
        {
          id: '1',
          created_by: 'demo@stylesnap.com',
          friend_email: 'friend@example.com',
          friend_name: 'Friend User',
          status: 'accepted',
          created_date: new Date().toISOString()
        }
      ];
    }
    return [];
  }

  async list(sortBy = '-created_date', limit = null) {
    await new Promise(resolve => setTimeout(resolve, 200));
    let result = [...this.data];
    
    if (sortBy.startsWith('-')) {
      const field = sortBy.substring(1);
      result.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    } else {
      result.sort((a, b) => new Date(a[sortBy]) - new Date(b[sortBy]));
    }
    
    if (limit) {
      result = result.slice(0, limit);
    }
    
    return result;
  }

  async filter(filters, sortBy = '-created_date', limit = null) {
    await new Promise(resolve => setTimeout(resolve, 200));
    let result = this.data.filter(item => {
      return Object.keys(filters).every(key => item[key] === filters[key]);
    });
    
    if (sortBy.startsWith('-')) {
      const field = sortBy.substring(1);
      result.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    } else {
      result.sort((a, b) => new Date(a[sortBy]) - new Date(b[sortBy]));
    }
    
    if (limit) {
      result = result.slice(0, limit);
    }
    
    return result;
  }

  async create(data) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newItem = {
      id: Date.now().toString(),
      ...data,
      created_date: new Date().toISOString()
    };
    this.data.push(newItem);
    this.saveData();
    return newItem;
  }

  async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates };
      this.saveData();
      return this.data[index];
    }
    throw new Error('Item not found');
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
      this.saveData();
      return true;
    }
    throw new Error('Item not found');
  }
}

// Export the API client
export const api = new StyleSnapAPI();