export const filterSuccessfulBookings = (bookings) =>
  bookings.filter((b) => b.paymentStatus === 'Success');

export const calculateStats = (bookings) => ({
  bookingCount: bookings.length,
  totalAmount: bookings.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0
  ),
});

export const exportBookingsToCSV = (bookings, filename = 'bookings.csv') => {
  if (!bookings.length) return;

  const headers = Object.keys(bookings[0]);
  const rows = bookings.map((b) =>
    headers.map((h) => JSON.stringify(b[h] ?? '')).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
