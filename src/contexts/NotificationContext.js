import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (token) {
        try {
          const [ticketPurchasesResponse, venueBookingsResponse] = await Promise.all([
            axios.get(`http://localhost:5000/api/ticket_purchases/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`http://localhost:5000/api/venue_bookings/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const ticketPurchases = ticketPurchasesResponse.data.map(purchase => ({
            _id: purchase._id,
            type: 'ticketPurchase',
            message: `Ticket purchased for event: ${purchase.eventTitle}`,
            date: purchase.purchaseDate,
            seen: purchase.seen,
            details: {
              ticketType: purchase.ticketType,
              quantity: purchase.quantity,
              email: purchase.email,
              phone: purchase.phone,
              paymentOption: purchase.paymentOption,
              totalAmount: purchase.totalAmount,
            },
          }));

          const venueBookings = venueBookingsResponse.data.map(booking => ({
            _id: booking._id,
            type: 'venueBooking',
            message: `Venue booked: ${booking.venueTitle}`,
            date: booking.createdAt,
            seen: booking.seen,
            details: {
              name: booking.name,
              phone: booking.phone,
              email: booking.email,
              bookingDate: booking.bookingDate,
              duration: booking.duration,
              total: booking.total,
            },
          }));

          const allNotifications = [...ticketPurchases, ...venueBookings]
            .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent

          setNotifications(allNotifications);
          setUnseenCount(allNotifications.filter(n => !n.seen).length);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };

    fetchNotifications();
  }, [token, userId]);

  const markAsSeen = async (id) => {
    if (token) {
      try {
        await axios.put(
          `http://localhost:5000/api/notifications/${id}/seen`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Update seen status locally
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === id ? { ...notification, seen: true } : notification
          )
        );

        // Adjust unseen count
        setUnseenCount(prevUnseenCount => Math.max(prevUnseenCount - 1, 0));
      } catch (error) {
        console.error('Error marking notification as seen:', error);
      }
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unseenCount, markAsSeen }}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationContext, NotificationProvider };
