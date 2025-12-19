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

import { useForm, Controller } from "react-hook-form";

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
  
  const ticketTypeValue = watch("ticketType") || "";
  const subCategoryValue = watch("subCategory") || "";

  const [imagePreview, setImagePreview] = useState(null);

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

    if (formData?.image instanceof File) {
      setImagePreview(URL.createObjectURL(formData.image));
    } else {
      setImagePreview(formData?.image || null);
    }
    setValue("image", file);
  };

  const toggleTicket = (type) => {
    setTicketOptions((prev) => {
      const updated = { ...prev, [type]: !prev[type] };
      return updated;
    });
  };

  const submitForm = (data) => {
    if (!ticketOptions.regular) {
      delete data.regularPrice;
      delete data.regularSlots;
    }
    if (!ticketOptions.vip) {
      delete data.vipPrice;
      delete data.vipSlots;
    }
    if (!ticketOptions.vvip) {
      delete data.vvipPrice;
      delete data.vvipSlots;
    }
    onSubmit(data);
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
            {formData?.ticketType === "paid" && (
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
            {formData?.ticketType === "free" && (
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
        <Stack direction="row" spacing={2} justifyContent="space-between">
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
