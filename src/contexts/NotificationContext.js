import React, { createContext, useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";

export const NotificationContext = createContext();

const API_URL = process.env.REACT_APP_API_URL;

const SOURCES = {
  ticketPurchase: {
    list: `${API_URL}/api/ticket_purchases`,
    label: (p) => `Ticket purchased for event: ${p.eventTitle}`,
    date: (p) => p.purchaseDate,
    details: (p) => ({
      ticketType: p.ticketType,
      quantity: p.quantity,
      email: p.email,
      phone: p.phone,
      paymentOption: p.paymentOption,
      totalAmount: p.totalAmount,
    }),
  },
  venueBooking: {
    list: `${API_URL}/api/venue_bookings`,
    label: (b) => `Venue booked: ${b.venueTitle}`,
    date: (b) => b.createdAt,
    details: (b) => ({
      name: b.name,
      phone: b.phone,
      email: b.email,
      bookingDate: b.bookingDate,
      duration: b.duration,
      total: b.total,
    }),
  },
  performanceBooking: {
    list: `${API_URL}/api/performance_bookings`,
    label: (b) => `Performance booked: ${b.artType}`,
    date: (b) => b.createdAt,
    details: (b) => ({
       name: b.clientName,
      date: b.bookingDate,
      duration: b.duration,
      total: b.totalAmount,
    }),
  },
  serviceBooking: {
    list: `${API_URL}/api/service_bookings`,
    label: (b) => `Service booked: ${b.serviceType}`,
    date: (b) => b.createdAt,
    details: (b) => ({
      name: b.clientName,
      date: b.bookingDate,
      duration: b.duration,
      total: b.totalAmount,
    }),
  },
};

export const NotificationProvider = ({ children, userId, token }) => {
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    if (!token || !userId) return;

    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          Object.entries(SOURCES).map(async ([type, cfg]) => {
            const res = await axiosInstance.get(`${cfg.list}/user/${userId}`);
            return res.data.map((item) => ({
              _id: item._id,
              type,
              seen: item.seen,
              message: cfg.label(item),
              date: cfg.date(item),
              details: cfg.details(item),
            }));
          })
        );

        const merged = results.flat().sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setNotifications(merged);
        setUnseenCount(merged.filter((n) => !n.seen).length);
      } catch (err) {
        console.error("Notification fetch failed:", err);
      }
    };

    fetchAll();
  }, [userId, token]);

  const markAsSeen = async (notification) => {
    if (notification.seen) return;

    const endpoint = SOURCES[notification.type].list;

    await axiosInstance.put(`${endpoint}/${notification._id}/seen`);

    setNotifications((prev) =>
      prev.map((n) =>
        n._id === notification._id ? { ...n, seen: true } : n
      )
    );

    setUnseenCount((c) => Math.max(c - 1, 0));
  };

  const markAllAsSeen = async (type) => {
    const endpoint = SOURCES[type].list;

    await axiosInstance.put(`${endpoint}/user/${userId}/seen`);

    setNotifications((prev) =>
      prev.map((n) => (n.type === type ? { ...n, seen: true } : n))
    );

    setUnseenCount((prev) =>
      Math.max(
        prev -
          notifications.filter((n) => n.type === type && !n.seen).length,
        0
      )
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unseenCount,
        markAsSeen,
        markAllAsSeen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
