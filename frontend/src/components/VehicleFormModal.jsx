import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit } from 'react-icons/fa';

/**
 * VehicleFormModal renders a modal dialog for adding a new vehicle or editing
 * an existing vehicle's attributes. Validates positive price, non-negative quantity,
 * and handles submit loading feedback.
 */
const VehicleFormModal = ({ isOpen, onClose, onSave, vehicle }) => {
  const isEdit = !!vehicle;

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with vehicle data when modal opens or editing target changes
  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make || '');
      setModel(vehicle.model || '');
      setCategory(vehicle.category || '');
      setPrice(vehicle.price || '');
      setQuantity(vehicle.quantity || '');
    } else {
      setMake('');
      setModel('');
      setCategory('');
      setPrice('');
      setQuantity('');
    }
    setError('');
    setIsSubmitting(false);
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field requirements validation
    if (!make.trim() || !model.trim() || !category.trim() || price === '' || quantity === '') {
      setError('All fields are required.');
      return;
    }

    const priceNum = parseFloat(price);
    const qtyNum = parseInt(quantity, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    if (isNaN(qtyNum) || qtyNum < 0) {
      setError('Quantity must be greater than or equal to 0.');
      return;
    }

    setIsSubmitting(true);
    const vehicleData = {
      make: make.trim(),
      model: model.trim(),
      category: category.trim(),
      price: priceNum,
      quantity: qtyNum
    };

    const result = await onSave(vehicleData);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Failed to save vehicle data.');
    }
  };

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content border-0 shadow-lg rounded-3">
            
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-bold">
                {isEdit ? 'Edit Vehicle Details' : 'Add New Vehicle'}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onClose}
                disabled={isSubmitting}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body p-4">
                
                {error && (
                  <div className="alert alert-danger py-2 small mb-3" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="modalMake" className="form-label small fw-medium text-secondary">Make</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="modalMake"
                    placeholder="e.g. Ford, Toyota"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="modalModel" className="form-label small fw-medium text-secondary">Model</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="modalModel"
                    placeholder="e.g. Mustang, Corolla"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="modalCategory" className="form-label small fw-medium text-secondary">Category</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="modalCategory"
                    placeholder="e.g. SUV, Sports, Hatchback"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label htmlFor="modalPrice" className="form-label small fw-medium text-secondary">Price (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      id="modalPrice"
                      placeholder="e.g. 750000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={isSubmitting}
                      min="0.01"
                      step="any"
                      required
                    />
                  </div>

                  <div className="col-6">
                    <label htmlFor="modalQuantity" className="form-label small fw-medium text-secondary">Quantity</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      id="modalQuantity"
                      placeholder="e.g. 5"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      disabled={isSubmitting}
                      min="0"
                      required
                    />
                  </div>
                </div>

              </div>

              <div className="modal-footer bg-light p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm px-4 fw-semibold d-flex align-items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>{isEdit ? 'Updating...' : 'Saving...'}</span>
                    </>
                  ) : (
                    isEdit ? (
                      <>
                        <FaEdit />
                        <span>Update Vehicle</span>
                      </>
                    ) : (
                      <>
                        <FaPlus />
                        <span>Save Vehicle</span>
                      </>
                    )
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
    </>
  );
};

export default VehicleFormModal;
