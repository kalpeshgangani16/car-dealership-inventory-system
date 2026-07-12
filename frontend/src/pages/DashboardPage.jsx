import { useEffect, useState } from 'react';
import { getAllVehicles, searchVehicles } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';

/**
 * DashboardPage displays the Vehicle Inventory header, search/filtering options,
 * and lists matching vehicles using the VehicleCard component. It coordinates
 * loading states, empty search fallbacks, and backend API error display.
 */
const DashboardPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states for filtering
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Fetch all vehicles
  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllVehicles();
      // Support raw arrays or wrapped responses e.g. { vehicles: [...] }
      setVehicles(data.vehicles || data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch vehicles. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Submit filters
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const filters = { make, model, category, minPrice, maxPrice };
      const data = await searchVehicles(filters);
      setVehicles(data.vehicles || data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Search failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleClear = () => {
    setMake('');
    setModel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    fetchAll();
  };

  return (
    <div className="container py-2">
      {/* Title Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark mb-0">Vehicle Inventory</h2>
      </div>

      {/* Filter Options Panel */}
      <div className="card shadow-sm border-0 rounded-3 mb-4">
        <div className="card-body p-4">
          <h5 className="card-title fw-bold mb-3 text-secondary">Filter Vehicles</h5>
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-4 col-sm-6">
                <label htmlFor="filterMake" className="form-label small fw-medium text-muted">Make</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="filterMake"
                  placeholder="e.g. Ford, Maruti"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                />
              </div>

              <div className="col-md-4 col-sm-6">
                <label htmlFor="filterModel" className="form-label small fw-medium text-muted">Model</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="filterModel"
                  placeholder="e.g. Mustang, Swift"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>

              <div className="col-md-4 col-sm-6">
                <label htmlFor="filterCategory" className="form-label small fw-medium text-muted">Category</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  id="filterCategory"
                  placeholder="e.g. Sports, Hatchback"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="col-md-6 col-sm-6">
                <label htmlFor="filterMinPrice" className="form-label small fw-medium text-muted">Minimum Price (₹)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  id="filterMinPrice"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
              </div>

              <div className="col-md-6 col-sm-12">
                <label htmlFor="filterMaxPrice" className="form-label small fw-medium text-muted">Maximum Price (₹)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  id="filterMaxPrice"
                  placeholder="No limit"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3 fw-semibold"
                onClick={handleClear}
                disabled={loading}
              >
                Clear Filters
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm px-4 fw-semibold"
                disabled={loading}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Vehicles Grid list, loader, error or empty states */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5 my-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading inventory...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger shadow-sm py-3 px-4 rounded-3 d-flex align-items-center gap-2" role="alert">
          <span className="fs-5">⚠️</span>
          <div>
            <strong>Error loading inventory:</strong> {error}
          </div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="card shadow-sm border-0 rounded-3 text-center p-5 my-4">
          <div className="card-body">
            <div className="fs-1 mb-3">🔍</div>
            <h4 className="fw-bold mb-2">No Vehicles Found</h4>
            <p className="text-muted mb-0">
              We couldn't find any vehicles matching your search criteria. Try modifying your filters or clearing them to see all results.
            </p>
          </div>
        </div>
      ) : (
        <div className="row">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle._id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
