import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Grid,
  TextField,
  Button,
  Avatar,
  Typography,
  CircularProgress,
  Box,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Rating,
  Chip,
  Divider,
  Paper
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import LanguageIcon from "@mui/icons-material/Language";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import EmailIcon from "@mui/icons-material/Email";

import { fetchProfile, updateProfile, logoutUser } from "./services/userService";
import { getAvatarUrl } from "./utils/avatar";

const API_URL = process.env.REACT_APP_API_URL;
const Profile = ({ token }) => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [activeTab, setActiveTab] = useState("about");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    gender: "",
    category: "",
    biography: "",
    shortIntro: "",
    city: "",
    country: "",
    website: "",
    instagram: "",
    twitter: "",
    facebook: "",
    linkedin: "",
  });

  /** ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile(token);
        setUser(profile);

        setFormData({
          username: profile.username || "",
          email: profile.email || "",
          phone: profile.phone || "",
          gender: profile.gender || "",
          category: profile.category || "",
          biography: profile.biography || "",
          shortIntro: profile.shortIntro || "",
          city: profile.location?.city || "",
          country: profile.location?.country || "",
          website: profile.website || "",
          instagram: profile.socialLinks?.instagram || "",
          twitter: profile.socialLinks?.twitter || "",
          facebook: profile.socialLinks?.facebook || "",
          linkedin: profile.socialLinks?.linkedin || "",
        });

        if (profile.isBanned) {
          alert("Your account has been banned. Please contact support.");
          logoutUser();
        }
      } catch (err) {
        console.error("Profile load error:", err);
      }
    };

    loadProfile();
  }, [token]);

    const fetchUserReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await axios.get(`${API_URL}/api/reviews/user/${user._id}`);
      setReviews(res.data.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

    useEffect(() => {
    if (activeTab === "reviews") fetchUserReviews();
  }, [activeTab]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setAvatarUploading(true);

      const res = await axios.put(
        `${API_URL}/api/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data);
      setStatusMessage("Avatar updated successfully");
    } catch (err) {
      console.error(err);
      setStatusMessage("Avatar upload failed");
      setPreviewUrl(null);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("Saving changes...");

    const payload = new FormData();

    payload.append("username", formData.username);
    payload.append("email", formData.email);
    payload.append("phone", formData.phone);
    payload.append("gender", formData.gender);
    payload.append("category", formData.category);
    payload.append("biography", formData.biography);
    payload.append("shortIntro", formData.shortIntro);
    payload.append("website", formData.website);

    payload.append(
      "location",
      JSON.stringify({
        city: formData.city,
        country: formData.country,
      })
    );

    payload.append(
      "socialLinks",
      JSON.stringify({
        instagram: formData.instagram,
        twitter: formData.twitter,
        facebook: formData.facebook,
        linkedin: formData.linkedin,
      })
    );

    try {
      const updated = await updateProfile(payload, token);
      setUser(updated);
      setEditMode(false);
      setStatusMessage("Profile updated successfully");
    } catch (err) {
      setStatusMessage(
        err?.response?.data?.message || "Failed to update profile"
      );
    }
  };

  const requestVerification = async () => {
    try {
      await axios.post(
        `${API_URL}/api/users/request-verification`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser((u) => ({
        ...u,
        verificationStatus: "pending",
      }));
    } catch (err) {
      alert("Verification request failed");
    }
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  /** ---------------- RENDER ---------------- */
  return (
    <Box maxWidth={800} mx="auto" p={3}>
      {/* HEADER */}
      <Stack direction="row" spacing={3} alignItems="center">
              <input
                type="file"
                accept="image/*"
                hidden
                id="avatar-upload-input"
                onChange={handleAvatarChange}
              />
        <Box position="relative" display="inline-block">
          <Avatar
            src={previewUrl || getAvatarUrl(user) || "/default-avatar.png"}
            sx={{ width: 96, height: 96 }}
          />

          <IconButton
            component="label"
            htmlFor="avatar-upload-input"
            sx={{
              position: "absolute",
              bottom: -4,
              right: -4,
              bgcolor: "background.paper",
              boxShadow: 1,
            }}
            disabled={avatarUploading}
          >
            <PhotoCamera />
          </IconButton>

          {avatarUploading && (
            <CircularProgress
              size={24}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                mt: "-12px",
                ml: "-12px",
              }}
            />
          )}
        </Box>

        <Box flex={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h5">{user.username}</Typography>
            {user.isVerified && (
              <VerifiedIcon color="primary" titleAccess="Verified account" />
            )}
          </Stack>
          {!user.isVerified && user.verificationStatus !== "pending" && (
            <Chip
              label="Request verification"
              variant="outlined"
              onClick={requestVerification}
              sx={{ ml: 1 }}
            />
          )}

          {user.verificationStatus === "pending" && (
            <Chip label="Verification pending" color="warning" sx={{ ml: 1 }} />
          )}

          {user.shortIntro && (
            <Typography color="text.secondary">
              {user.shortIntro}
            </Typography>
          )}

          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <Rating
              value={user.averageRating || 0}
              precision={0.5}
              readOnly
            />
            <Typography variant="body2" color="text.secondary">
              ({user.reviewCount || 0} reviews)
            </Typography>
          </Stack>

          {(user.location?.city || user.location?.country) && (
            <Typography variant="body2" mt={0.5}>
              {user.location?.city}, {user.location?.country}
            </Typography>
          )}
        </Box>
      </Stack>

      <Stack direction="row" spacing={2} mt={3}>
        <Button
          variant={activeTab === "about" ? "contained" : "text"}
          onClick={() => setActiveTab("about")}
        >
          About
        </Button>
        <Button
          variant={activeTab === "reviews" ? "contained" : "text"}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </Button>
        <Button
          variant={activeTab === "analytics" ? "contained" : "text"}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </Button>
        <Button
          variant={activeTab === "followers" ? "contained" : "text"}
          onClick={() => setActiveTab("followers")}
        >
          Followers
        </Button>
      </Stack>

      {/* LINKS */}
      <Stack direction="row" spacing={1} mt={2}>
        {user.website && (
          <IconButton href={user.website} target="_blank">
            <LanguageIcon />
          </IconButton>
        )}
        {user.socialLinks?.instagram && (
          <IconButton href={user.socialLinks.instagram} target="_blank">
            <InstagramIcon />
          </IconButton>
        )}
        {user.socialLinks?.twitter && (
          <IconButton href={user.socialLinks.twitter} target="_blank">
            <TwitterIcon />
          </IconButton>
        )}
        {user.socialLinks?.facebook && (
          <IconButton href={user.socialLinks.facebook} target="_blank">
            <FacebookIcon />
          </IconButton>
        )}
        {user.socialLinks?.linkedin && (
          <IconButton href={user.socialLinks.linkedin} target="_blank">
            <LinkedInIcon />
          </IconButton>
        )}
      </Stack>

      <Divider sx={{ my: 3 }} />
      {activeTab === "about" && (
          <Grid>
            <Box mt={3}>
            {/* EDIT BUTTONS */}
              <Button variant="outlined" onClick={() => setEditMode(!editMode)}>
                  {editMode ? "Cancel" : "Edit Profile"}
              </Button>

            {/* EDIT FORMS */}
            {editMode && (
              <Box component="form" mt={3} onSubmit={handleSubmit}>
                <Grid container spacing={2}>

                  <Grid item xs={12}>
                    <TextField
                      label="Short Intro"
                      name="shortIntro"
                      value={formData.shortIntro}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  {["instagram", "twitter", "facebook", "linkedin"].map((s) => (
                    <Grid item xs={6} key={s}>
                      <TextField
                        label={s.charAt(0).toUpperCase() + s.slice(1)}
                        name={s}
                        value={formData[s]}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>
                  ))}

                  <Grid item xs={12}>
                    <TextField
                      label="Biography"
                      name="biography"
                      value={formData.biography}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={4}
                    />
                  </Grid>
                </Grid>

                <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                  Save Changes
                </Button>
              </Box>
            )}
            </Box>
          </Grid>
      )}
      {activeTab === "reviews" && (
        <Box mt={3}>
          {reviewsLoading ? (
            <CircularProgress />
          ) : reviews.length === 0 ? (
            <Typography color="text.secondary">
              No reviews yet.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {reviews.map((r) => (
                <Box
                  key={r._id}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={600}>
                      {r.authorName || "Anonymous"}
                    </Typography>
                    <Rating value={r.rating} size="small" readOnly />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Typography mt={1}>{r.text}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      )}
      {activeTab === "analytics" && (
        <Box mt={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  boxShadow: 1,
                }}
              >
                <Typography variant="h4">
                  {user.profileViews || 0}
                </Typography>
                <Typography color="text.secondary">
                  Profile Views
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h4">
                  {user.reviewCount || 0}
                </Typography>
                <Typography color="text.secondary">
                  Reviews
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h4">
                  {user.averageRating || 0}
                </Typography>
                <Typography color="text.secondary">
                  Avg Rating
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
      {activeTab === "followers" && (
        <Box mt={3}>
            <Grid item xs={12} sm={4}>
          {/* FOLLOWERS DIALOG */}
          <TableContainer component={Paper}>
            <Typography variant="h5" sx={{padding: 2}}> Followers ({user.followers.length || 0})</Typography>
            {user.followers && user.followers.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Followed Date</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {user.followers.map((follower, index) => (
                    <TableRow key={index}>
                      <TableCell>{follower.name}</TableCell>
                      <TableCell>{follower.email}</TableCell>
                      <TableCell>{new Date(follower.followedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <IconButton href={`mailto:${follower.email}`}>
                          <EmailIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography>No followers yet.</Typography>
            )}
            </TableContainer>
          </Grid>
        </Box>
      )}

      {statusMessage && (
        <Typography mt={2} color="secondary">
          {statusMessage}
        </Typography>
      )}
    </Box>
  );
};

export default Profile;
