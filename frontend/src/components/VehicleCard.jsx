import React from 'react';

/**
 * VehicleCard renders a single car's details, handles display formatting
 * (e.g. price currency format, truncated MongoDB ID), and determines
 * the availability badges and purchase button states.
 */
const VehicleCard = ({ vehicle, isAdmin, onEdit, onDelete, onPurchase, onRestock }) => {
  const { _id, make, model, category, price, quantity } = vehicle;

  // Determine stock status and badge colors
  let stockBadgeClass = 'bg-success';
  let stockLabel = 'In Stock';

  if (quantity === 0) {
    stockBadgeClass = 'bg-danger';
    stockLabel = 'Out of Stock';
  } else if (quantity <= 5) {
    stockBadgeClass = 'bg-warning text-dark';
    stockLabel = 'Low Stock';
  }

  // Format price as locale Indian currency string
  const formattedPrice = `₹${price.toLocaleString('en-IN')}`;

  // Truncate Vehicle ID for clean display, maintaining original ID as tooltip
  const displayId = _id && _id.length > 5 ? `...${_id.slice(-5)}` : _id;

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
        <div className="card-body d-flex flex-column p-4">
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="badge bg-secondary text-capitalize">{category}</span>
            <span className={`badge ${stockBadgeClass}`}>{stockLabel}</span>
          </div>

          <h5 className="card-title fw-bold text-dark mb-1">
            {make} {model}
          </h5>
          <p className="card-text text-muted small mb-3" title={`Full ID: ${_id}`}>
            ID: {displayId}
          </p>

          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small">Price</span>
              <span className="fs-5 fw-bold text-primary">{formattedPrice}</span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-secondary small">Available Stock</span>
              <span className={`fw-semibold ${quantity === 0 ? 'text-danger' : 'text-dark'}`}>
                {quantity} {quantity === 1 ? 'unit' : 'units'}
              </span>
            </div>

            {isAdmin ? (
              <div className="d-flex gap-2">
                <button 
                  type="button"
                  className="btn btn-outline-primary btn-sm fw-semibold flex-grow-1"
                  onClick={() => onPurchase(vehicle)}
                  disabled={quantity === 0}
                >
                  {quantity === 0 ? 'Out of Stock' : 'Purchase'}
                </button>
                <button 
                  type="button"
                  className="btn btn-primary btn-sm fw-semibold flex-grow-1"
                  onClick={() => onRestock(vehicle)}
                >
                  Restock
                </button>
              </div>
            ) : (
              <button 
                type="button"
                className="btn btn-outline-primary w-100 fw-semibold"
                onClick={() => onPurchase(vehicle)}
                disabled={quantity === 0}
              >
                {quantity === 0 ? 'Out of Stock' : 'Purchase'}
              </button>
            )}

            {isAdmin && (
              <div className="d-flex gap-2 mt-3 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-warning btn-sm fw-semibold flex-grow-1"
                  onClick={() => onEdit(vehicle)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm fw-semibold flex-grow-1"
                  onClick={() => onDelete(vehicle)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
