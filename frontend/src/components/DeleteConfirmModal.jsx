import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';

/**
 * DeleteConfirmModal presents a verification modal prior to vehicle deletion.
 * Disables form triggers and updates text to 'Deleting...' when in progress.
 */
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, vehicle }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !vehicle) return null;

  const handleConfirm = async () => {
    setError('');
    setIsDeleting(true);
    const result = await onConfirm(vehicle._id);
    setIsDeleting(false);
    if (!result.success) {
      setError(result.error || 'Failed to delete vehicle.');
    }
  };

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: '400px' }}>
          <div className="modal-content border-0 shadow-lg rounded-3">
            
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title fw-bold">Delete Vehicle?</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={onClose}
                disabled={isDeleting}
              ></button>
            </div>

            <div className="modal-body p-4 text-center">
              {error && (
                <div className="alert alert-danger py-2 small mb-3 text-start" role="alert">
                  {error}
                </div>
              )}
              <div className="fs-1 text-danger mb-3">⚠️</div>
              <p className="mb-1 fw-semibold text-dark">
                Are you sure you want to delete this vehicle?
              </p>
              <p className="text-muted small mb-0">
                This action cannot be undone. <strong>{vehicle.make} {vehicle.model}</strong> will be permanently removed from the catalog.
              </p>
            </div>

            <div className="modal-footer bg-light p-3 justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3"
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm px-4 fw-semibold d-flex align-items-center gap-2"
                onClick={handleConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FaTrash />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
    </>
  );
};

export default DeleteConfirmModal;
