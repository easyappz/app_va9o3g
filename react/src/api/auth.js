import instance from './axios';

/**
 * Register a new user
 * @param {Object} data - Registration data
 * @param {string} data.username - Username (3-150 characters)
 * @param {string} data.password - Password (min 6 characters)
 * @returns {Promise} Response with user data
 */
export const register = async (data) => {
  const response = await instance.post('/api/auth/register', data);
  return response.data;
};

/**
 * Login user
 * @param {Object} data - Login credentials
 * @param {string} data.username - Username
 * @param {string} data.password - Password
 * @returns {Promise} Response with token and user data
 */
export const login = async (data) => {
  const response = await instance.post('/api/auth/login', data);
  return response.data;
};

/**
 * Logout current user
 * @returns {Promise} Response with success message
 */
export const logout = async () => {
  const response = await instance.post('/api/auth/logout');
  return response.data;
};
