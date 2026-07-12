const TOKEN_KEY = 'car_dealership_token';
const USER_KEY = 'car_dealership_user';

/**
 * Gets the stored JWT token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Stores the JWT token
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Removes the JWT token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Gets the stored user object
 */
export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  try {
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

/**
 * Stores the user object
 */
export const setUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Removes the user object
 */
export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Clears all authentication details from storage
 */
export const clearAuth = () => {
  removeToken();
  removeUser();
};
