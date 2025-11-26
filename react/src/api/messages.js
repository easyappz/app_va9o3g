import instance from './axios';

/**
 * Get messages history
 * @param {Object} params - Query parameters
 * @param {number} [params.limit=100] - Maximum number of messages (1-1000)
 * @param {number} [params.offset=0] - Number of messages to skip
 * @returns {Promise} Response with messages array and total count
 */
export const getMessages = async (params = {}) => {
  const response = await instance.get('/api/messages', { params });
  return response.data;
};

/**
 * Send a new message
 * @param {Object} data - Message data
 * @param {string} data.text - Message text (1-5000 characters)
 * @returns {Promise} Response with created message
 */
export const sendMessage = async (data) => {
  const response = await instance.post('/api/messages', data);
  return response.data;
};
