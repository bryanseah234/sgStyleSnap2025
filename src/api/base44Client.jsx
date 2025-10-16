// Mock Base44 API client for development and testing
// Replace this with your actual Base44 client implementation

class MockBase44Client {
  constructor() {
    this.auth = new MockAuth();
    this.entities = {
      ClothingItem: new MockEntity('clothing-items'),
      Outfit: new MockEntity('outfits'),
      Friendship: new MockEntity('friendships')
    };
  }
}

class MockAuth {
  constructor() {
    this.currentUser = {
      email: 'test@example.com',
      full_name: 'Test User',
      id: 'user-123'
    };
  }

  async me() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.currentUser;
  }

  async login(email, password) {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.currentUser = {
      email,
      full_name: email.split('@')[0],
      id: 'user-' + Date.now()
    };
    return this.currentUser;
  }

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.currentUser = null;
    return true;
  }
}

class MockEntity {
  constructor(entityName) {
    this.entityName = entityName;
    this.data = this.getMockData();
  }

  getMockData() {
    if (this.entityName === 'clothing-items') {
      return [
        {
          id: '1',
          name: 'Blue Jeans',
          category: 'bottoms',
          image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop',
          created_by: 'test@example.com',
          created_date: new Date().toISOString(),
          is_favorite: false
        },
        {
          id: '2',
          name: 'White T-Shirt',
          category: 'tops',
          image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
          created_by: 'test@example.com',
          created_date: new Date().toISOString(),
          is_favorite: true
        },
        {
          id: '3',
          name: 'Black Jacket',
          category: 'outerwear',
          image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop',
          created_by: 'test@example.com',
          created_date: new Date().toISOString(),
          is_favorite: false
        }
      ];
    } else if (this.entityName === 'outfits') {
      return [
        {
          id: '1',
          name: 'Casual Friday',
          created_by: 'test@example.com',
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
          created_by: 'test@example.com',
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
    return newItem;
  }

  async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates };
      return this.data[index];
    }
    throw new Error('Item not found');
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
      return true;
    }
    throw new Error('Item not found');
  }
}

// Export the mock client
export const base44 = new MockBase44Client();
