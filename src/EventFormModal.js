import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useForm, Controller } from "react-hook-form";
import EventAgreementDialog from "./EventAgreementDialog";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const categoryData = {
  "Social Event": [
    "Casual Gathering",
    "Celebration",
    "Reunion",
    "Charity/Fundraiser",
    "Activity-Based Event",
  ],
  "Corporate Event": [
    "Company meeting",
    "Team-building",
    "Networking event",
    "Seminar/Workshop",
    "Trade Show",
    "Conference",
  ],
  "Community Event": [
    "Fundraiser",
    "Community Outreach",
    "Cultural Event",
  ],
  "Food and Drinks Event": ["Food festival", "Wine tasting"],
  Festival: ["Music festival", "Beer festival"],
  Performance: [
    "Theatre performance",
    "Dance performance",
    "Music performance",
    "Comedy performance",
  ],
  "Virtual Event": ["Webinar", "Virtual quiz", "Virtual conference"],
  "Outdoor Event": ["Guided tour", "Sports event", "Outdoor cinema"],
  "Kids Event": ["Fun festival", "Bootcamp", "Class"],
};

const EventFormModal = ({
  isOpen,
  onClose,
  formData,
  onSubmit,
  editingEventId,
  onTicketTypeChange,
}) => {
  const {
    control,
    register,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: formData,
  });

  const [selectedCategory, setSelectedCategory] = useState("");
  const [packageError, setPackageError] = useState("");
  
  // Agreement dialog state
  const [showAgreementDialog, setShowAgreementDialog] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [agreementData, setAgreementData] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  
  const cityValue = watch("city");
  const countryValue = watch("country");
  const ticketTypeValue = watch("ticketType") || "";
  const subCategoryValue = watch("subCategory") || "";
  const [coords, setCoords] = useState({
    lat: formData?.lat || null,
    lng: formData?.lng || null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  // Ticket packages state
  const [packages, setPackages] = useState(formData?.ticketPackages || []);
  const [newPackage, setNewPackage] = useState({
    name: '',
    type: 'general',
    price: '',
    slots: '',
    startDate: '',
    endDate: '',
    minQuantity: '',
    maxPerUser: '',
    description: '',
  });
  const [eventDates, setEventDates] = useState(formData?.eventDates || []);
  const [newEventDate, setNewEventDate] = useState({ date: '', startTime: '', endTime: '' });
  const [eventDateError, setEventDateError] = useState('');

 const RecenterMap = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 13);
    }
  }, [lat, lng, map]);

  return null;
};

  useEffect(() => {
    if (coords.lat && coords.lng) {
      setValue("lat", coords.lat);
      setValue("lng", coords.lng);
    }
  }, [coords, setValue]);

 useEffect(() => {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });

      setValue("lat", latitude);
      setValue("lng", longitude);
    },
    () => {
      console.warn("Location access denied");
    },
    { enableHighAccuracy: true }
  );
}, [setValue]);

useEffect(() => {
  const runGeocodeFallback = async () => {
    if (
      !coords.lat &&
      !coords.lng &&
      cityValue &&
      countryValue
    ) {
      const geo = await geocodeLocation(cityValue, countryValue);
      if (geo) {
        setCoords(geo);
        setValue("lat", geo.lat);
        setValue("lng", geo.lng);
      }
    }
  };

  runGeocodeFallback();
}, [cityValue, countryValue, coords, setValue]);

useEffect(() => {
    if (ticketTypeValue === "free") {
      setPackages([]);
      setPackageError("");

      setValue("regularPrice", undefined);
      setValue("vipPrice", undefined);
      setValue("vvipPrice", undefined);
      setValue("regularSlots", undefined);
      setValue("vipSlots", undefined);
      setValue("vvipSlots", undefined);
    } else {
      setPackageError("");
    }
  }, [ticketTypeValue, setValue]);

  useEffect(() => {
      if (formData?.image && !imagePreview) {
        setImagePreview(formData.image); // existing image URL
      }
    }, [formData, imagePreview]);

// When modal opens for editing or creating, set defaults
  useEffect(() => {
    if (formData) reset(formData);

    if (formData?.category) {
      setSelectedCategory(formData.category);
    }

    if (formData?.image) {
      setImagePreview(formData.image);
    }

    // Prefill packages when editing
    setPackages(formData?.ticketPackages || []);
    setEventDates(formData?.eventDates || []);
    setPackageError("");
  }, [formData, reset]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setValue("category", category);
    setValue("subCategory", "");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setValue("image", file);
  };


  const submitForm = (data) => {
    if (data.ticketType === "free") {
      delete data.regularPrice;
      delete data.vipPrice;
      delete data.vvipPrice;
      delete data.regularSlots;
      delete data.vipSlots;
      delete data.vvipSlots;
      delete data.ticketPackages;
    } else {
      if (!packages.length) {
        setPackageError("Please add at least one ticket package for paid events.");
        return;
      }
      data.ticketPackages = packages;
    }

    if (eventDates && eventDates.length) data.eventDates = eventDates;

    setPackageError("");

    // For new events (not editing), show agreement dialog
    if (!editingEventId) {
      setPendingFormData(data);
      setShowAgreementDialog(true);
    } else {
      onSubmit(data);
    }
  };

  const handleAddPackage = () => {
    if (!newPackage.name || !newPackage.price) return;
    setPackages((p) => [...p, { ...newPackage, price: Number(newPackage.price), slots: newPackage.slots ? Number(newPackage.slots) : undefined, minQuantity: newPackage.minQuantity ? Number(newPackage.minQuantity) : undefined, maxPerUser: newPackage.maxPerUser ? Number(newPackage.maxPerUser) : undefined }]);
    setNewPackage({ name: '', type: 'general', price: '', slots: '', startDate: '', endDate: '', minQuantity: '', maxPerUser: '', description: '' });
  };

  const handleRemovePackage = (index) => {
    setPackages((p) => p.filter((_, i) => i !== index));
  };

  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const handleAddEventDate = () => {
    setEventDateError("");

    if (!newEventDate.date || !newEventDate.startTime || !newEventDate.endTime) {
      setEventDateError("Please provide date, start time, and end time for the event date.");
      return;
    }

    const startMinutes = timeToMinutes(newEventDate.startTime);
    const endMinutes = timeToMinutes(newEventDate.endTime);
    if (startMinutes === null || endMinutes === null) {
      setEventDateError("Please enter a valid start and end time.");
      return;
    }
    if (startMinutes >= endMinutes) {
      setEventDateError("Event start time must be before end time.");
      return;
    }

    const newDate = new Date(newEventDate.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) {
      setEventDateError("Event date cannot be in the past.");
      return;
    }

    const conflictingEntry = eventDates.some((entry) => {
      if (entry.date !== newEventDate.date) return false;
      const existingStart = timeToMinutes(entry.startTime);
      const existingEnd = timeToMinutes(entry.endTime);
      return startMinutes < existingEnd && existingStart < endMinutes;
    });

    if (conflictingEntry) {
      setEventDateError("This event date conflicts with an existing schedule entry.");
      return;
    }

    setEventDates((prev) => [...prev, { ...newEventDate }]);
    setNewEventDate({ date: '', startTime: '', endTime: '' });
  };

  const handleRemoveEventDate = (index) => {
    setEventDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAgreementAccept = (agreementInfo) => {
    if (pendingFormData) {
      const finalData = {
        ...pendingFormData,
        ...agreementInfo,
      };
      setAgreementAccepted(true);
      setShowAgreementDialog(false);
      setPendingFormData(null);
      onSubmit(finalData);
    }
  };

 const geocodeLocation = async (city, country) => {
  try {
    const query = encodeURIComponent(`${city}, ${country}`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.json();

    if (data?.length) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.error("Geocoding failed", err);
  }
  return null;
};

const LocationPicker = ({ setCoords }) => {
  useMapEvents({
    click(e) {
      setCoords({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });
  return null;
};

return (
    <>
      <EventAgreementDialog
        isOpen={showAgreementDialog}
        onClose={() => setShowAgreementDialog(false)}
        onAccept={handleAgreementAccept}
      />
    
      <Dialog
        open={isOpen}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle>
          {editingEventId ? "Edit Event" : "Create Event"}
        </DialogTitle>

      <DialogContent dividers sx={{ maxHeight: "75vh" }}>
        <form id="event-form" onSubmit={handleSubmit(submitForm)}>
          <Grid container spacing={2}>
            {/* Ticket Type */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Ticket Type"
                value={ticketTypeValue}
                {...register("ticketType", { required: true })}
                onChange={(e) => {
                  setValue("ticketType", e.target.value);
                  if (onTicketTypeChange) onTicketTypeChange(e);
                }}
              >
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="free">Free</MenuItem>
              </TextField>
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title"
                {...register("title", { required: "Title is required" })}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </Grid>

            {/* City */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                {...register("city", { required:  "City is required" })}
              />
            </Grid>

            {/* Country */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                {...register("country", { required:  "Country is required" })}
              />
            </Grid>
            <input type="hidden" {...register("lat")} />
            <input type="hidden" {...register("lng")} />

            {coords.lat && coords.lng && (
              <Grid item xs={12}>
                <Typography fontWeight="bold" mb={1}>
                  Pick Event Location
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  Drag the marker or click on the map to choose the exact venue location.
                </Typography>

                <Box
                  sx={{
                    height: 320,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid #ddd",
                  }}
                >
                  <MapContainer
                    center={[coords.lat, coords.lng]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker
                      position={[coords.lat, coords.lng]}
                      draggable
                      eventHandlers={{
                        dragend: (e) => {
                          const pos = e.target.getLatLng();
                          setCoords({ lat: pos.lat, lng: pos.lng });
                        },
                      }}
                    />

                    <LocationPicker setCoords={setCoords} />
                  </MapContainer>
                </Box>
              </Grid>
            )}

            {/* Category */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={selectedCategory}
                {...register("category", { required: true })}
                onChange={handleCategoryChange}
              >
                <MenuItem value="">Select Category</MenuItem>
                {Object.keys(categoryData).map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* SubCategory */}
            {selectedCategory && (
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Sub-category"
                  value={subCategoryValue}
                  {...register("subCategory", { required: true })}
                >
                  <MenuItem value="">Select Sub-category</MenuItem>
                  {categoryData[selectedCategory].map((sub) => (
                    <MenuItem key={sub} value={sub}>
                      {sub}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {/* Image Upload */}
            <Grid item xs={12}>
              <Button variant="contained" component="label">
                Upload Image
                <input hidden type="file" {...register("image")} onChange={handleFileChange} />
              </Button>

              {imagePreview && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Preview:</Typography>
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{
                      width: "200px",
                      borderRadius: 8,
                      marginTop: 8,
                    }}
                  />
                </Box>
              )}
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Description"
                multiline
                minRows={3}
                {...register("description", { required:  "Event description is required" })}
              />
            </Grid>

            {/* Venue */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Venue"
                {...register("venue", { required:  "Venue is required" })}
              />
            </Grid>

            {/* Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                fullWidth
                {...register("date", { required: true })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Start & End Time */}
            <Grid item xs={12} sm={6}>
              <TextField
                type="time"
                fullWidth
                label="Start Time"
                {...register("startTime", { required: true })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="time"
                fullWidth
                label="End Time"
                {...register("endTime", { required: true })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Multiple dates */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2 }}>Event Schedule</Typography>
              {eventDates.length > 0 && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  {eventDates.map((entry, idx) => (
                    <Stack key={idx} direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={600}>{new Date(entry.date).toLocaleDateString()}</Typography>
                        <Typography variant="body2">{entry.startTime} - {entry.endTime}</Typography>
                      </Box>
                      <Button color="error" onClick={() => handleRemoveEventDate(idx)}>Remove</Button>
                    </Stack>
                  ))}
                </Box>
              )}

              <Grid container spacing={1} sx={{ mt: 1, mb: 1 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Date"
                    InputLabelProps={{ shrink: true }}
                    value={newEventDate.date}
                    onChange={(e) => setNewEventDate((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="time"
                    fullWidth
                    label="Start Time"
                    value={newEventDate.startTime}
                    onChange={(e) => setNewEventDate((prev) => ({ ...prev, startTime: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    type="time"
                    fullWidth
                    label="End Time"
                    value={newEventDate.endTime}
                    onChange={(e) => setNewEventDate((prev) => ({ ...prev, endTime: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {eventDateError && (
                  <Grid item xs={12}>
                    <Typography color="error" variant="body2">{eventDateError}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={4}>
                  <Button onClick={handleAddEventDate} variant="outlined" sx={{ height: '100%' }}>
                    Add Event Date
                  </Button>
                </Grid>
              </Grid>
            </Grid>


            {/* Free event slots */}
            {ticketTypeValue === "free" && (
              <Grid item xs={12}>
                <TextField
                  type="number"
                  fullWidth
                  label="Total Slots (Free Event)"
                  {...register("freeSlots", { required: true })}
                />
              </Grid>
            )}

            {/* Ticket Packages */}
            {ticketTypeValue === "paid" && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2 }}>Ticket Packages</Typography>
            {packageError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {packageError}
              </Typography>
            )}

                {packages.length > 0 && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  {packages.map((pkg, idx) => (
                    <Stack key={idx} direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={600}>{pkg.name} <Typography component="span" sx={{ fontWeight: 400 }}>({pkg.type})</Typography></Typography>
                        <Typography variant="body2">{pkg.description}</Typography>
                        <Typography variant="caption">Price: Ksh. {pkg.price} • Slots: {pkg.slots ?? '∞'}</Typography>
                      </Box>
                      <Button color="error" onClick={() => handleRemovePackage(idx)}>Remove</Button>
                    </Stack>
                  ))}
                </Box>
              )}

              <Grid container spacing={1} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Name" value={newPackage.name} onChange={(e) => setNewPackage(n => ({ ...n, name: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField select fullWidth label="Type" value={newPackage.type} onChange={(e) => setNewPackage(n => ({ ...n, type: e.target.value }))}>
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="early-bird">Early Bird</MenuItem>
                    <MenuItem value="advance">Advance</MenuItem>
                    <MenuItem value="group">Group</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField type="number" fullWidth label="Price" value={newPackage.price} onChange={(e) => setNewPackage(n => ({ ...n, price: e.target.value }))} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField type="number" fullWidth label="Slots" value={newPackage.slots} onChange={(e) => setNewPackage(n => ({ ...n, slots: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField type="date" fullWidth label="Start Date" InputLabelProps={{ shrink: true }} value={newPackage.startDate} onChange={(e) => setNewPackage(n => ({ ...n, startDate: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField type="date" fullWidth label="End Date" InputLabelProps={{ shrink: true }} value={newPackage.endDate} onChange={(e) => setNewPackage(n => ({ ...n, endDate: e.target.value }))} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField type="number" fullWidth label="Min Quantity" value={newPackage.minQuantity} onChange={(e) => setNewPackage(n => ({ ...n, minQuantity: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField type="number" fullWidth label="Max Per User" value={newPackage.maxPerUser} onChange={(e) => setNewPackage(n => ({ ...n, maxPerUser: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField fullWidth label="Description" value={newPackage.description} onChange={(e) => setNewPackage(n => ({ ...n, description: e.target.value }))} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button onClick={handleAddPackage} variant="outlined" sx={{ height: '100%' }}>Add Package</Button>
                </Grid>
              </Grid>
            </Grid>
          )}
          </Grid>
        </form>
      </DialogContent>

      <DialogActions>
      <Stack direction="row" spacing={2}  justifyContent= "center" width="100%">
        <Button type="submit" form="event-form" variant="contained">
          Save
        </Button>
        <Button onClick={onClose}> Cancel </Button>
        </Stack>
      </DialogActions>
      </Dialog>
    </>
  );
};

export default EventFormModal;
