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

/**
 * Creates a new vehicle in the inventory (Admin only).
 * @param {Object} vehicleData - The vehicle information (make, model, category, price, quantity)
 */
export const createVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data;
};

/**
 * Updates an existing vehicle's details (Admin only).
 * @param {string} id - The ID of the vehicle to update
 * @param {Object} vehicleData - The updated vehicle information
 */
export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data;
};

/**
 * Deletes a vehicle from the catalog (Admin only).
 * @param {string} id - The ID of the vehicle to delete
 */
export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};
