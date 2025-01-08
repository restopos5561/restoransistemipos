export const tokenService = {
  setTokens(accessToken?: string, refreshToken?: string) {
    if (!accessToken || !refreshToken) {
      console.warn('Invalid tokens provided:', { accessToken, refreshToken });
      this.clearTokens(); // Geçersiz token durumunda mevcut token'ları temizle
      return false;
    }
    
    try {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      return true;
    } catch (error) {
      console.error('Error setting tokens:', error);
      return false;
    }
  },
  
  getAccessToken() {
    try {
      return localStorage.getItem('accessToken') || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },
  
  getRefreshToken() {
    try {
      return localStorage.getItem('refreshToken') || null;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },
  
  clearTokens() {
    try {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('restaurantId');
      return true;
    } catch (error) {
      console.error('Error clearing tokens:', error);
      return false;
    }
  },

  hasValidTokens() {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}; 