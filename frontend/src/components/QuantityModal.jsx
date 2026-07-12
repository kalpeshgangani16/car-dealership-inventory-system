import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaBoxes } from 'react-icons/fa';

/**
 * QuantityModal renders a modal dialog requesting a purchase or restock quantity.
 * Supports frontend constraints validation and disabled loading states during request processing.
 */
const QuantityModal = ({ isOpen, onClose, onConfirm, vehicle, action }) => {
  const isPurchase = action === 'purchase';

  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset fields when active target or action toggles
  useEffect(() => {
    setQuantity('1');
    setError('');
    setIsSubmitting(false);
  }, [isOpen, vehicle, action]);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qtyNum = parseInt(quantity, 10);

    // Quantity validation checks
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Quantity must be a valid integer greater than 0.');
      return;
    }

    if (isPurchase && qtyNum > vehicle.quantity) {
      setError('Cannot purchase more than available stock.');
      return;
    }

    setIsSubmitting(true);
    const result = await onConfirm(vehicle._id, qtyNum);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || `Failed to perform ${action} operation.`);
    }
  };

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '400px' }}>
          <div className="modal-content border-0 shadow-lg rounded-3">
            
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-bold text-capitalize">
                {isPurchase ? 'Purchase Vehicle' : 'Restock Vehicle'}
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

                <div className="text-center mb-3">
                  <h6 className="fw-bold mb-1">{vehicle.make} {vehicle.model}</h6>
                  <p className="text-muted small mb-0">
                    Category: <span className="text-capitalize">{vehicle.category}</span>
                  </p>
                  <p className="text-muted small">
                    Available Stock: <strong>{vehicle.quantity} {vehicle.quantity === 1 ? 'unit' : 'units'}</strong>
                  </p>
                </div>

                <div className="mb-3">
                  <label htmlFor="modalQuantity" className="form-label small fw-medium text-secondary">
                    {isPurchase ? 'Enter Quantity to Purchase' : 'Enter Quantity to Restock'}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="modalQuantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={isSubmitting}
                    min="1"
                    step="1"
                    required
                    autoFocus
                  />
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
                      <span>{isPurchase ? 'Purchasing...' : 'Restocking...'}</span>
                    </>
                  ) : (
                    isPurchase ? (
                      <>
                        <FaShoppingCart />
                        <span>Purchase</span>
                      </>
                    ) : (
                      <>
                        <FaBoxes />
                        <span>Restock</span>
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

export default QuantityModal;
