import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  getAllVehicles, 
  searchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle
} from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';
import VehicleFormModal from '../components/VehicleFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import QuantityModal from '../components/QuantityModal';
import { FaPlus, FaSearch, FaUndo } from 'react-icons/fa';

/**
 * DashboardPage displays the main vehicle catalog.
 * It renders search/filtering forms, binds purchase clicks for all users,
 * and mounts create, update, delete, and restock actions for admins.
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states for filtering
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modal controls
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formVehicle, setFormVehicle] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteVehicleTarget, setDeleteVehicleTarget] = useState(null);

  // Quantity modal controls (Purchase & Restock)
  const [isQtyOpen, setIsQtyOpen] = useState(false);
  const [qtyVehicle, setQtyVehicle] = useState(null);
  const [qtyAction, setQtyAction] = useState('purchase'); // 'purchase' or 'restock'

  // Status alerts
  const [successAlert, setSuccessAlert] = useState('');

  // Fetch all vehicles
  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllVehicles();
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

  // Display success message and auto-dismiss
  const triggerSuccessAlert = (message) => {
    setSuccessAlert(message);
    const timer = setTimeout(() => {
      setSuccessAlert('');
    }, 4000);
    return () => clearTimeout(timer);
  };

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

  // Trigger Add Modal
  const handleAddClick = () => {
    setFormVehicle(null);
    setIsFormOpen(true);
  };

  // Trigger Edit Modal
  const handleEditClick = (vehicle) => {
    setFormVehicle(vehicle);
    setIsFormOpen(true);
  };

  // Trigger Delete Confirmation Modal
  const handleDeleteClick = (vehicle) => {
    setDeleteVehicleTarget(vehicle);
    setIsDeleteOpen(true);
  };

  // Trigger Purchase Modal
  const handlePurchaseClick = (vehicle) => {
    setQtyVehicle(vehicle);
    setQtyAction('purchase');
    setIsQtyOpen(true);
  };

  // Trigger Restock Modal
  const handleRestockClick = (vehicle) => {
    setQtyVehicle(vehicle);
    setQtyAction('restock');
    setIsQtyOpen(true);
  };

  // Create or Update Vehicle handler passed to VehicleFormModal
  const handleSaveVehicle = async (vehicleData) => {
    try {
      if (formVehicle) {
        // Edit mode
        await updateVehicle(formVehicle._id, vehicleData);
        triggerSuccessAlert('Vehicle updated successfully!');
      } else {
        // Add mode
        await createVehicle(vehicleData);
        triggerSuccessAlert('Vehicle added successfully!');
      }
      setIsFormOpen(false);
      fetchAll(); // Refresh inventory list
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save vehicle details.';
      return { success: false, error: msg };
    }
  };

  // Delete vehicle handler passed to DeleteConfirmModal
  const handleDeleteConfirm = async (id) => {
    try {
      await deleteVehicle(id);
      triggerSuccessAlert('Vehicle deleted successfully!');
      setIsDeleteOpen(false);
      fetchAll(); // Refresh inventory list
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete vehicle.';
      return { success: false, error: msg };
    }
  };

  // Purchase/Restock quantity confirm handler passed to QuantityModal
  const handleQuantityConfirm = async (id, quantity) => {
    try {
      if (qtyAction === 'purchase') {
        await purchaseVehicle(id, quantity);
        triggerSuccessAlert('Vehicle purchased successfully!');
      } else {
        await restockVehicle(id, quantity);
        triggerSuccessAlert('Vehicle restocked successfully!');
      }
      setIsQtyOpen(false);
      fetchAll(); // Refresh inventory list to auto-update badges & button states
      return { success: true };
    } catch (err) {
      // Return exact backend validation message returned by the API
      const msg = err.response?.data?.message || `Failed to perform ${qtyAction} operation.`;
      return { success: false, error: msg };
    }
  };

  return (
    <div className="container py-2">
      {/* Success Banner */}
      {successAlert && (
        <div className="alert alert-success alert-dismissible fade show shadow-sm mb-4" role="alert">
          <strong>Success!</strong> {successAlert}
          <button 
            type="button" 
            className="btn-close" 
            aria-label="Close"
            onClick={() => setSuccessAlert('')}
          ></button>
        </div>
      )}

      {/* Title Header and Admin Action */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark mb-0">Vehicle Inventory</h2>
        {isAdmin && (
          <button 
            type="button" 
            className="btn btn-primary px-4 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
            onClick={handleAddClick}
          >
            <FaPlus />
            <span>Add Vehicle</span>
          </button>
        )}
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
                className="btn btn-outline-secondary btn-sm px-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                onClick={handleClear}
                disabled={loading}
              >
                <FaUndo />
                <span>Clear Filters</span>
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm px-4 fw-semibold d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                <FaSearch />
                <span>Search</span>
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
            <VehicleCard 
              key={vehicle._id} 
              vehicle={vehicle} 
              isAdmin={isAdmin}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onPurchase={handlePurchaseClick}
              onRestock={handleRestockClick}
            />
          ))}
        </div>
      )}

      {/* Admin Modals */}
      <VehicleFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveVehicle} 
        vehicle={formVehicle} 
      />

      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDeleteConfirm} 
        vehicle={deleteVehicleTarget} 
      />

      {/* Quantity Modal (Purchase & Restock) */}
      <QuantityModal 
        isOpen={isQtyOpen} 
        onClose={() => setIsQtyOpen(false)} 
        onConfirm={handleQuantityConfirm} 
        vehicle={qtyVehicle} 
        action={qtyAction} 
      />
    </div>
  );
};

export default DashboardPage;
