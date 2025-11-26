import instance from './axios';

/**
 * Get current user profile
 * @returns {Promise} Response with user profile data
 */
export const getProfile = async () => {
  const response = await instance.get('/api/profile');
  return response.data;
};

/**
 * Update current user profile
 * @param {Object} data - Profile update data
 * @param {string} [data.username] - New username (3-150 characters)
 * @param {string} [data.password] - New password (min 6 characters)
 * @returns {Promise} Response with updated user data
 */
export const updateProfile = async (data) => {
  const response = await instance.put('/api/profile', data);
  return response.data;
};
