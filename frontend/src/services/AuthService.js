import axios from 'axios';

class AuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    
    // Set default authorization header
    if (this.accessToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
    }
  }

  // Login user
  async login(username, password) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/login`, {
        username,
        password
      });

      const { access_token, refresh_token } = response.data;
      
      // Store tokens
      this.setTokens(access_token, refresh_token);
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  }

  // Register user
  async register(username, email, password) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/register`, {
        username,
        email,
        password
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  }

  // Logout user
  async logout() {
    try {
      if (this.refreshToken) {
        await axios.post(`${this.baseURL}/auth/logout`, {
          refresh_token: this.refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refresh_token: this.refreshToken
      });

      const { access_token } = response.data;
      this.setAccessToken(access_token);
      
      return { success: true, access_token };
    } catch (error) {
      this.clearTokens();
      return { 
        success: false, 
        error: 'Token refresh failed' 
      };
    }
  }

  // Get current user info
  async getCurrentUser() {
    try {
      const response = await axios.get(`${this.baseURL}/auth/me`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get user info' 
      };
    }
  }

  // Verify token
  async verifyToken() {
    try {
      const response = await axios.get(`${this.baseURL}/auth/verify`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: 'Token verification failed' 
      };
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }

  // Get stored tokens
  getTokens() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken
    };
  }

  // Set tokens
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  // Set access token only
  setAccessToken(accessToken) {
    this.accessToken = accessToken;
    localStorage.setItem('access_token', accessToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  // Clear tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    delete axios.defaults.headers.common['Authorization'];
  }

  // Setup axios interceptors for automatic token refresh
  setupInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshResult = await this.refreshAccessToken();
          if (refreshResult.success) {
            originalRequest.headers.Authorization = `Bearer ${refreshResult.access_token}`;
            return axios(originalRequest);
          } else {
            this.clearTokens();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export default AuthService;
