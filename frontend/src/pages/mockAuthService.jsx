// mockAuthService.js

// Simulate a database of users
const getStoredUsers = () => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  };
  
  const saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  };
  
  // Simulate API delay
  const simulateApiCall = (data, shouldSucceed = true) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldSucceed) {
          resolve(data);
        } else {
          reject(new Error('API Error'));
        }
      }, 1000); // Simulate 1 second delay
    });
  };
  
  export const mockAuthService = {
    // Login service
    login: async (credentials) => {
      const users = getStoredUsers();
      const user = users.find(u => u.email === credentials.email);
  
      if (!user) {
        throw new Error('User not found');
      }
  
      if (user.password !== credentials.password) {
        throw new Error('Invalid password');
      }
  
      // Simulate successful login
      const authData = {
        token: `mock-token-${Date.now()}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      };
  
      return simulateApiCall(authData);
    },
  
    // Signup service
    signup: async (userData) => {
      const users = getStoredUsers();
      
      // Check if user already exists
      if (users.some(u => u.email === userData.email)) {
        throw new Error('Email already registered');
      }
  
      // Create new user
      const newUser = {
        id: Date.now(),
        ...userData
      };
  
      // Save to "database"
      users.push(newUser);
      saveUsers(users);
  
      // Simulate successful signup
      const authData = {
        token: `mock-token-${Date.now()}`,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      };
  
      return simulateApiCall(authData);
    },
  
    // Google OAuth simulation
    googleAuth: async () => {
      // Simulate Google OAuth flow
      const mockGoogleUser = {
        token: `google-mock-token-${Date.now()}`,
        user: {
          id: `google-${Date.now()}`,
          name: 'Google User',
          email: 'google.user@example.com'
        }
      };
  
      return simulateApiCall(mockGoogleUser);
    }
  };