const bcrypt = require('bcryptjs');
const { readData, writeData } = require('../config/database');

class User {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.name = data.name;
    this.email = data.email?.toLowerCase();
    this.password = data.password;
    this.role = data.role || 'user';
    this.phone = data.phone;
    this.avatar = data.avatar || 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=User';
    this.address = data.address || {};
    this.preferences = data.preferences || { newsletter: true };
    this.orderHistory = data.orderHistory || [];
    this.wishlist = data.wishlist || [];
    this.loyaltyPoints = data.loyaltyPoints || 0; 
    this.isActive = data.isActive !== false;
    this.lastLogin = data.lastLogin;
    this.emailVerified = data.emailVerified || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Статические методы для работы с JSON
  static async create(userData) {
    const user = new User(userData);
    await user.hashPassword();
    
    const users = readData('users');
    
    // Проверка уникальности email
    if (users.find(u => u.email === user.email)) {
      throw new Error('Пользователь с таким email уже существует');
    }
    
    users.push(user);
    writeData('users', users);
    
    // Удаляем пароль из ответа
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static findOne(query) {
    const users = readData('users');
    return users.find(user => {
      return Object.keys(query).every(key => user[key] === query[key]);
    });
  }

  static findById(id) {
    const users = readData('users');
    return users.find(user => user.id === id);
  }

  static findByIdAndUpdate(id, updates) {
    const users = readData('users');
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;
    
    users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() };
    writeData('users', users);
    
    return users[userIndex];
  }

  addToWishlist(productId) {
    if (!this.wishlist.includes(productId)) {
      this.wishlist.push(productId);
      this.save();
    }
  }

  removeFromWishlist(productId) {
    this.wishlist = this.wishlist.filter(id => id !== productId);
    this.save();
  }

  save() {
    const users = readData('users');
    const userIndex = users.findIndex(user => user.id === this.id);
    
    this.updatedAt = new Date().toISOString();
    
    if (userIndex === -1) {
      users.push(this);
    } else {
      users[userIndex] = this;
    }
    
    writeData('users', users);
    return this;
  }

  updateLastLogin() {
    this.lastLogin = new Date().toISOString();
    return this.save();
  }
}

module.exports = User;