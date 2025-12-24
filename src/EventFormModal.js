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
  const [ticketOptions, setTicketOptions] = useState({
    regular: !!formData?.regularPrice,
    vip: !!formData?.vipPrice,
    vvip: !!formData?.vvipPrice,
  });
  
  const cityValue = watch("city");
  const countryValue = watch("country");
  const ticketTypeValue = watch("ticketType") || "";
  const subCategoryValue = watch("subCategory") || "";
  const [coords, setCoords] = useState({
    lat: formData?.lat || null,
    lng: formData?.lng || null,
  });

  const [imagePreview, setImagePreview] = useState(null);

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
      setTicketOptions({
        regular: false,
        vip: false,
        vvip: false,
      });

      setValue("regularPrice", undefined);
      setValue("vipPrice", undefined);
      setValue("vvipPrice", undefined);
      setValue("regularSlots", undefined);
      setValue("vipSlots", undefined);
      setValue("vvipSlots", undefined);
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

    // Ticket options prefill if editing
    setTicketOptions({
      regular: !!formData?.regularPrice,
      vip: !!formData?.vipPrice,
      vvip: !!formData?.vvipPrice,
    });
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

  const toggleTicket = (type) => {
    setTicketOptions((prev) => {
      const updated = { ...prev, [type]: !prev[type] };
      return updated;
    });
  };

  const submitForm = (data) => {
    if (data.ticketType === "free") {
      delete data.regularPrice;
      delete data.vipPrice;
      delete data.vvipPrice;
      delete data.regularSlots;
      delete data.vipSlots;
      delete data.vvipSlots;
    }

    onSubmit(data);
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

            {/* Ticket Options */}
            {ticketTypeValue === "paid" && (
              <Grid item xs={12}>
                <Typography fontWeight="bold">Ticket Options</Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ticketOptions.regular}
                      onChange={() => toggleTicket("regular")}
                    />
                  }
                  label="Regular"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ticketOptions.vip}
                      onChange={() => toggleTicket("vip")}
                    />
                  }
                  label="VIP"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ticketOptions.vvip}
                      onChange={() => toggleTicket("vvip")}
                    />
                  }
                  label="VVIP"
                />
              </Grid>
            )}

            {/* Regular Inputs */}
            {ticketOptions.regular && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Regular Price"
                    {...register("regularPrice", { required: true })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="number"
                    fullWidth
                    label="Regular Slots"
                    {...register("regularSlots", { required: true })}
                  />
                </Grid>
              </>
            )}

            {/* VIP */}
            {ticketOptions.vip && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="number"
                    fullWidth
                    label="VIP Price"
                    {...register("vipPrice", { required: true })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="number"
                    fullWidth
                    label="VIP Slots"
                    {...register("vipSlots", { required: true })}
                  />
                </Grid>
              </>
            )}

            {/* VVIP */}
            {ticketOptions.vvip && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="number"
                    fullWidth
                    label="VVIP Price"
                    {...register("vvipPrice", { required: true })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    type="number"
                    fullWidth
                    label="VVIP Slots"
                    {...register("vvipSlots", { required: true })}
                  />
                </Grid>
              </>
            )}

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
  );
};

export default EventFormModal;
