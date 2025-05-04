import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import './EventFormModal.css';

const categoryData = {
  'Social Event': ['Casual Gathering', 'Celebration', 'Reunion', 'Charity/Fundraiser', 'Activity-Based Event'],
  'Corporate Event': ['Company meeting', 'Team-building', 'Networking event', 'Seminar/Workshop', 'Trade Show', 'Conference'],
  'Community Event': ['Fundraiser', 'Community Outreach', 'Cultural Event'],
  'Food and Drinks Event': ['Food festival', 'Wine tasting'],
  'Festival': ['Music festival', 'Beer festival'],
  'Performance': ['Theatre performance', 'Dance performance', 'Music performance', 'Comedy performance'],
  'Virtual Event': ['Webinar', 'Virtual quizze', 'Virtual conference'],
  'Outdoor Event': ['Guided tour', 'Sports event', 'Outdoor cinema'],
  'Kids Event': ['Fun festival', 'Bootcamp', 'Class']
};

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
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: formData,
  });

  // State to manage selected ticket options
  const [selectedOptions, setSelectedOptions] = useState({
    regular: false,
    vip: false,
    vvip: false,
  });

  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    reset(formData);
    if (formData?.category) {
      setSelectedCategory(formData.category);
    }
  }, [formData, reset]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setValue('category', category);
    setValue('subCategory', ''); // Reset sub-category
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset();
  };

  const toggleOption = (option) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  if (!isOpen) return null;

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

          <div className="dropdown-group">
            <label>Category</label>
            <select
              {...register('category', { required: 'Category is required' })}
              onChange={handleCategoryChange}
              value={selectedCategory}
            >
              <option value="">Select Category</option>
              {Object.keys(categoryData).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="error">{errors.category.message}</span>}
          </div>

          {/* Sub-Category Dropdown */}
          {selectedCategory && (
            <div className="dropdown-group">
              <label>Sub-Category</label>
              <select
                {...register('subCategory', { required: 'Sub-category is required' })}
              >
                <option value="">Select Sub-category</option>
                {categoryData[selectedCategory].map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {errors.subCategory && <span className="error">{errors.subCategory.message}</span>}
            </div>
          )}

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
