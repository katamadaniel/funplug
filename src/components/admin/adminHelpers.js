export const filterSuccessfulBookings = (bookings) =>
  bookings.filter((b) => b.paymentStatus === 'Success');

export const calculateStats = (bookings) => ({
  bookingCount: bookings.length,
  totalAmount: bookings.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0
  ),
});

const formatCsvValue = (value) => {
  if (value == null) return '';
  const stringValue =
    typeof value === 'string'
      ? value
      : typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : value instanceof Date
      ? value.toISOString()
      : String(value);

  return `"${stringValue.replace(/"/g, '""')}"`;
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const buildExportRows = (bookings) => {
  const sample = bookings[0] || {};
  const isTicketExport =
    sample.ticketType || sample.quantity !== undefined || sample.purchaseDate;

  const rows = bookings.map((booking) => {
    const clientName = booking.clientName || booking.customerName || booking.name || '';
    const email = booking.email || '';
    const phone = booking.phone || '';

    if (isTicketExport) {
      return {
        'Client Name': clientName,
        Email: email,
        Phone: phone,
        'Ticket Type': booking.ticketType || '',
        Quantity: booking.quantity ?? '',
        'Total Amount': booking.totalAmount != null ? booking.totalAmount.toFixed(2) : '',
        'Purchase Date': formatDate(booking.purchaseDate),
      };
    }

    return {
      'Client Name': clientName,
      Email: email,
      Phone: phone,
      'Booking Date': formatDate(booking.bookingDate),
      From: booking.from || '',
      To: booking.to || '',
      Duration: booking.duration || '',
      'Total Amount': booking.totalAmount != null ? booking.totalAmount.toFixed(2) : '',
    };
  });

  const headers = isTicketExport
    ? [
        'Client Name',
        'Email',
        'Phone',
        'Ticket Type',
        'Quantity',
        'Total Amount',
        'Purchase Date',
      ]
    : [
        'Client Name',
        'Email',
        'Phone',
        'Booking Date',
        'From',
        'To',
        'Duration',
        'Total Amount',
      ];

  return { headers, rows };
};

export const exportBookingsToCSV = (bookings, filename = 'bookings.csv') => {
  if (!bookings.length) return;

  const { headers, rows } = buildExportRows(bookings);
  const csvRows = rows.map((row) => headers.map((header) => formatCsvValue(row[header])).join(','));
  const csv = [headers.map((h) => formatCsvValue(h)).join(','), ...csvRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
