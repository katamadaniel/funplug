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
  // Determine ticket exports only when clearly ticket-related fields exist.
  // Some booking objects may include a `quantity` field for other reasons,
  // so require `ticketType` or `purchaseDate` to avoid misclassification.
  const isTicketExport = Boolean(sample.ticketType || sample.purchaseDate);

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

    // Format booking display values to match multi-day logic
    const isMultiple = booking.bookingType === 'multiple';
    const bookingDate = isMultiple
      ? `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`
      : formatDate(booking.bookingDate);

    const fromVal = isMultiple ? 'All day' : booking.from || '';
    const toVal = isMultiple ? 'All day' : booking.to || '';

    let durationVal = '';
    if (booking.duration != null) {
      const d = Number(booking.duration);
      if (!Number.isNaN(d)) {
        if (isMultiple) {
          // duration is stored as hours; convert to days
          const days = d / 24;
          durationVal = Number.isInteger(days)
            ? `${days} day(s) (${d} hrs)`
            : `${days.toFixed(2)} day(s) (${d} hrs)`;
        } else {
          durationVal = `${d} hrs`;
        }
      } else {
        durationVal = String(booking.duration);
      }
    }

    return {
      'Client Name': clientName,
      Email: email,
      Phone: phone,
      'Booking Type': booking.bookingType || 'single',
      'Start Date': formatDate(booking.startDate),
      'End Date': formatDate(booking.endDate),
      'Booking Date': bookingDate,
      From: fromVal,
      To: toVal,
      Duration: durationVal,
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
        'Booking Type',
        'Start Date',
        'End Date',
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
