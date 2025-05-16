import React, { useContext, useState } from 'react';
import Modal from 'react-modal';
import { NotificationContext } from './contexts/NotificationContext';
import './Notifications.css';
import { format } from 'date-fns';

const Notifications = () => {
  const { notifications, unseenCount, markAsSeen } = useContext(NotificationContext);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Count unseen notifications for each group
  const unseenTicketCount = notifications.filter(n => n.type === 'ticketPurchase' && !n.seen).length;
  const unseenVenueCount = notifications.filter(n => n.type === 'venueBooking' && !n.seen).length;

  const handleGroupClick = (group) => {
    setSelectedGroup(group);
  };

  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    if (!notification.seen) {
      markAsSeen(notification._id);
      notification.seen = true; // Mark as seen in the local state
    }
  };

  const closeDetailView = () => {
    setSelectedNotification(null);
  };

  return (
    <div className="notifications">
      <h2>Notifications ({unseenCount})</h2>

      {/* Group Notification Headers */}
      <div className="notification-groups">
        <h3 onClick={() => handleGroupClick('ticketPurchase')}>
          Ticket Purchases {unseenTicketCount > 0 && `(${unseenTicketCount} new)`}
        </h3>
        <h3 onClick={() => handleGroupClick('venueBooking')}>
          Venue Bookings {unseenVenueCount > 0 && `(${unseenVenueCount} new)`}
        </h3>
      </div>

      {/* Display Notifications based on Selected Group */}
      <div className="notification-list">
        {notifications
          .filter(n => n.type === selectedGroup)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${notification.seen ? 'seen' : 'unseen'}`}
              onClick={() => handleViewNotification(notification)}
              style={{
                backgroundColor: notification.seen ? '#f9f9f9' : '#e6f7ff'
              }}
            >
              <p>{notification.message}</p>
              <small>{new Date(notification.date).toLocaleString()}</small>
            </div>
          ))}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <Modal
          isOpen={!!selectedNotification}
          onRequestClose={closeDetailView}
          contentLabel="Notification Details"
          className="modal"
          overlayClassName="overlay"
        >
          <div className="notification-detail">
            <h3>Notification Details</h3>
            <p>{selectedNotification.message}</p>
            <p><strong>Date:</strong> {new Date(selectedNotification.date).toLocaleString()}</p>
            {selectedNotification.type === 'ticketPurchase' && (
              <div>
                <p><strong>Ticket Type:</strong> {selectedNotification.details.ticketType}</p>
                <p><strong>Quantity:</strong> {selectedNotification.details.quantity}</p>
                <p><strong>Email:</strong> {selectedNotification.details.email}</p>
                <p><strong>Phone:</strong> {selectedNotification.details.phone}</p>
                <p><strong>Payment Option:</strong> {selectedNotification.details.paymentOption}</p>
                <p><strong>Total Amount:</strong> Ksh.{selectedNotification.details.totalAmount}</p>
              </div>
            )}
            {selectedNotification.type === 'venueBooking' && (
              <div>
                <p><strong>Name:</strong> {selectedNotification.details.name}</p>
                <p><strong>Phone:</strong> {selectedNotification.details.phone}</p>
                <p><strong>Email:</strong> {selectedNotification.details.email}</p>
                <p><strong>Booked Date:</strong> {format(new Date(selectedNotification.details.bookingDate), 'dd/MM/yyyy')}</p>
                <p><strong>Duration:</strong> {selectedNotification.details.duration} hours</p>
                <p><strong>Total:</strong> Ksh.{selectedNotification.details.total}</p>
              </div>
            )}
            <button onClick={closeDetailView}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Notifications;