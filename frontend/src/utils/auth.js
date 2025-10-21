// Authentication utility functions
export const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
  localStorage.setItem('authToken', token); // For backward compatibility
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Basic token validation (check if it's not expired)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Invalid token format:', error);
    return false;
  }
};

export const getUserFromToken = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      exp: payload.exp
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

export const redirectToLogin = () => {
  removeAuthToken();
  window.location.href = '/login';
};
