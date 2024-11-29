import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import './EventFormModal.css';

const EventFormModal = ({
  isOpen,
  onClose,
  formData,
  onSubmit,
  onCancel,
  editingEventId,
  statusMessage,
  onTicketTypeChange,
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: formData,
  });

  // State to manage selected ticket options
  const [selectedOptions, setSelectedOptions] = useState({
    regular: false,
    vip: false,
    vvip: false,
  });

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  // Toggle selection of ticket types
  const toggleOption = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{editingEventId ? 'Edit Event' : 'Add Event'}</h2>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="event-form">
          <div className="ticket-type">
            <label>Ticket Type</label>
            <select
              {...register('ticketType', { required: true })}
              onChange={onTicketTypeChange}
            >
              <option value="paid">Paid</option>
              <option value="free">Free</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Event Title"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && <span className="error">{errors.title.message}</span>}

          <input
            type="file"
            {...register('image', { required: 'Image is required' })}
          />
          {errors.image && <span className="error">{errors.image.message}</span>}

          <textarea
            placeholder="Event Description"
            {...register('description', { required: 'Description is required' })}
          ></textarea>
          {errors.description && <span className="error">{errors.description.message}</span>}

          <input
            type="text"
            placeholder="Event Venue"
            {...register('venue', { required: 'Venue is required' })}
          />
          {errors.venue && <span className="error">{errors.venue.message}</span>}

          <input
            type="date"
            {...register('date', { required: 'Date is required' })}
          />
          {errors.date && <span className="error">{errors.date.message}</span>}

          <input
            type="time"
            placeholder="Start Time"
            {...register('startTime', { required: 'Start time is required' })}
          />
          {errors.startTime && <span className="error">{errors.startTime.message}</span>}

          <input
            type="time"
            placeholder="End Time"
            {...register('endTime', { required: 'End time is required' })}
          />
          {errors.endTime && <span className="error">{errors.endTime.message}</span>}

          {formData.ticketType === 'paid' && (
            <div className="ticket-options">
              <label>
                <input
                  type="checkbox"
                  checked={selectedOptions.regular}
                  onChange={() => toggleOption('regular')}
                />
                Regular Ticket
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedOptions.vip}
                  onChange={() => toggleOption('vip')}
                />
                VIP Ticket
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={selectedOptions.vvip}
                  onChange={() => toggleOption('vvip')}
                />
                VVIP Ticket
              </label>
            </div>
          )}

          {/* Conditional Inputs for Regular Tickets */}
          {selectedOptions.regular && (
            <>
              <input
                type="number"
                placeholder="Regular Price"
                {...register('regularPrice', { required: true, valueAsNumber: true })}
              />
              {errors.regularPrice && <span className="error">{errors.regularPrice.message}</span>}
              <input
                type="number"
                placeholder="Regular Slots"
                {...register('regularSlots', { required: true, valueAsNumber: true })}
              />
              {errors.regularSlots && <span className="error">{errors.regularSlots.message}</span>}
            </>
          )}

          {/* Conditional Inputs for VIP Tickets */}
          {selectedOptions.vip && (
            <>
              <input
                type="number"
                placeholder="VIP Price"
                {...register('vipPrice', { required: true, valueAsNumber: true })}
              />
              {errors.vipPrice && <span className="error">{errors.vipPrice.message}</span>}
              <input
                type="number"
                placeholder="VIP Slots"
                {...register('vipSlots', { required: true, valueAsNumber: true })}
              />
              {errors.vipSlots && <span className="error">{errors.vipSlots.message}</span>}
            </>
          )}

          {/* Conditional Inputs for VVIP Tickets */}
          {selectedOptions.vvip && (
            <>
              <input
                type="number"
                placeholder="VVIP Price"
                {...register('vvipPrice', { required: true, valueAsNumber: true })}
              />
              {errors.vvipPrice && <span className="error">{errors.vvipPrice.message}</span>}
              <input
                type="number"
                placeholder="VVIP Slots"
                {...register('vvipSlots', { required: true, valueAsNumber: true })}
              />
              {errors.vvipSlots && <span className="error">{errors.vvipSlots.message}</span>}
            </>
          )}

          {formData.ticketType === 'free' && (
            <input
              type="number"
              placeholder="Total Slots for Free Event"
              {...register('freeSlots', { required: 'Free are required for free events', valueAsNumber: true })}
            />
          )}
          {errors.totalSlots && <span className="error">{errors.totalSlots.message}</span>}

          <div className="button-container">
            <button type="submit">{editingEventId ? 'Update Event' : 'Create Event'}</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    </div>
  );
};

export default EventFormModal;
