import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PurchaseDetailsModal.css';

const PURCHASES_API_URL = 'http://localhost:5000/api/ticket_purchases';

const PurchaseDetailsModal = ({ isOpen, onClose, eventId, eventTitle }) => {
  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch purchase details from the backend for the specific event
  const fetchPurchaseDetails = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${PURCHASES_API_URL}/event/${eventId}`, config); // Pass config here
      setPurchaseDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching purchase details:', error.message);
      setLoading(false);
    }
  }, [eventId]); // Add eventId as a dependency

  // Fetch purchase details when the modal is opened and the eventId is available
  useEffect(() => {
    if (isOpen && eventId) {
      fetchPurchaseDetails();
    }
  }, [isOpen, eventId, fetchPurchaseDetails]); // Add fetchPurchaseDetails as a dependency

  return (
    isOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <button className="close-button" onClick={onClose}>X</button>
          <h2>Purchase Details for {eventTitle}</h2>
          {loading ? (
            <div className="loader">Loading...</div>
          ) : (
            <table className="purchase-details-table">
              <thead>
                <tr>
                  <th>Ticket Type</th>
                  <th>Quantity</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Payment Option</th>
                  <th>Total Amount</th>
                  <th>Purchase Date</th>
                </tr>
              </thead>
              <tbody>
                {purchaseDetails.map((purchase) => (
                  <tr key={purchase._id}>
                    <td>{purchase.ticketType}</td>
                    <td>{purchase.quantity}</td>
                    <td>{purchase.email}</td>
                    <td>{purchase.phone}</td>
                    <td>{purchase.paymentOption}</td>
                    <td>Ksh.{purchase.totalAmount.toFixed(2)}</td>
                    <td>{new Date(purchase.purchaseDate).toLocaleString()}</td>
                  </tr>
                ))}

              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  );
};

export default PurchaseDetailsModal;
