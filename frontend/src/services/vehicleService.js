import api from '../api/api';

/**
 * Fetches all vehicles from the backend catalog.
 */
export const getAllVehicles = async () => {
  const response = await api.get('/vehicles');
  return response.data;
};

/**
 * Searches vehicles in the catalog using optional query filters.
 * @param {Object} filters - Search parameters (make, model, category, minPrice, maxPrice)
 */
export const searchVehicles = async (filters) => {
  const params = {};
  Object.keys(filters).forEach((key) => {
    const value = filters[key];
    if (value !== '' && value !== null && value !== undefined) {
      params[key] = value;
    }
  });

  const response = await api.get('/vehicles/search', { params });
  return response.data;
};
