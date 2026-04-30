import axios from "axios";
import React, { useCallback, useState, useEffect } from "react";
import {
  Grid, TextField, Button, Avatar, Typography, CircularProgress, Box,
  TableContainer,Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  Stack, Rating, Chip, Divider, Paper
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import LanguageIcon from "@mui/icons-material/Language";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PhotoCamera from "@mui/icons-material/PhotoCamera";

import { fetchProfile, updateProfile, logoutUser } from "./services/userService";
import { getAvatarUrl } from "./utils/avatar";
import {
  getFollowerAnalytics,
  getFollowerGrowth,
  getFollowers,
  sendBroadcastEmail
} from "./services/followService";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

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
  const [followers, setFollowers] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followersPage, setFollowersPage] = useState(0);
  const [followersTotal, setFollowersTotal] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");

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
        setUser({
          ...profile,
          followers: profile.followersCount || 0,
          profileViews: profile.stats?.profileViews || 0,
          });

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

  const loadFollowers = useCallback(async (page = 0) => {
    if (!user?._id) return;
    if (followersLoading) return;

    try {
      setFollowersLoading(true);

      const data = await getFollowers(user._id, page);

      setFollowers((prev) =>
        page === 0 ? data.followers || [] : [...prev, ...(data.followers || [])]
      );

      setFollowersTotal(data.total || 0);
      setFollowersPage(page);

    } catch (err) {
      console.error("Followers load error:", err);
    } finally {
      setFollowersLoading(false);
    }
  }, [user?._id]);

  const loadAnalytics = useCallback(async () => {
    try {
      const data = await getFollowerAnalytics(user._id);
      setAnalytics(data);

    } catch (err) {
      console.error(err);
    }
  }, [user?._id]);

  const loadGrowth = useCallback(async () => {
    try {
      const data = await getFollowerGrowth(user._id);
      setGrowthData(data);
    } catch (err) {
      console.error(err);
    }
  }, [user?._id]);

  const handleBroadcast = async () => {
    try {
      await sendBroadcastEmail(user._id, {
        subject: broadcastSubject,
        message: broadcastMessage,
      });

      setBroadcastSubject("");
      setBroadcastMessage("");
      setStatusMessage("Broadcast sent successfully");
    } catch (err) {
      setStatusMessage("Failed to send broadcast");
    }
  };

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
    if (!user?._id) return;

    if (activeTab === "reviews") fetchUserReviews();
    if (activeTab === "followers") loadFollowers(0);
    if (activeTab === "analytics") {
      loadAnalytics();
      loadGrowth();
    }
  }, [activeTab, user?._id]);

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
            {user.accountVerified && (
              <VerifiedIcon color="primary" titleAccess="Verified account" />
            )}
          </Stack>

          {/* Verification Status Logic */}
          {user.isVerified && (user.verificationStatus === "none" || user.verificationStatus === "rejected") && (
            <Chip
              label={user.verificationStatus === "rejected" ? "Request verification again" : "Request verification"}
              variant="outlined"
              onClick={requestVerification}
              sx={{ ml: 1, mt: 0.5 }}
            />
          )}

          {user.verificationStatus === "pending" && (
            <Chip label="Verification pending" color="warning" sx={{ ml: 1, mt: 0.5 }} />
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

          <Stack direction="row" spacing={3} mt={1}>
            <Box>
              <Typography fontWeight={600}>{ user.followers || 0}</Typography>
              <Typography variant="caption" color="text.secondary">
                Followers
              </Typography>
            </Box>

            <Box>
              <Typography fontWeight={600}>{user.profileViews || 0}</Typography>
              <Typography variant="caption" color="text.secondary">
                Profile Views
              </Typography>
            </Box>
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
      {activeTab === "analytics" && analytics && (
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

            <Grid item xs={12} sm={3}>
                <Box sx={{ p: 2, boxShadow: 1 }}>
                  <Typography variant="h4">
                    {analytics.totalFollowers}
                  </Typography>
                  <Typography color="text.secondary">
                    Total Followers
                  </Typography>
                </Box>[]
              </Grid>

              <Grid item xs={12} sm={3}>
                <Box sx={{ p: 2, boxShadow: 1 }}>
                  <Typography variant="h4">
                    {analytics.emailSubscribers}
                  </Typography>
                  <Typography color="text.secondary">
                    Email Subscribers
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Box sx={{ p: 2, boxShadow: 1 }}>
                  <Typography variant="h4">
                    {analytics.unsubscribed}
                  </Typography>
                  <Typography color="text.secondary">
                    Unsubscribed
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Box sx={{ p: 2, boxShadow: 1 }}>
                  <Typography variant="h4">
                    {analytics.last30Days}
                  </Typography>
                  <Typography color="text.secondary">
                    New (30 days)
                  </Typography>
                </Box>
              </Grid>
          </Grid>

          {/* GROWTH CHART */}
          <Box mt={4} height={300}>
            <Typography variant="h6">Follower Growth</Typography>

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1976d2" />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}
      {activeTab === "followers" && (
        <Box mt={3}>
          <TableContainer component={Paper}>
            <Typography variant="h5" sx={{ padding: 2 }}>
              Followers ({user.followers || 0})
            </Typography>

            {followers.length === 0 && followersLoading ? (
              <CircularProgress />
            ) : followers.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Followed Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {followers.map((f) => (
                    <TableRow key={f._id}>
                      <TableCell>{f.followerName}</TableCell>
                      <TableCell>{f.followerEmail}</TableCell>
                      <TableCell>
                        {new Date(f.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ p: 2 }}>No followers yet.</Typography>
            )}
            {followers.length < followersTotal && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => loadFollowers(followersPage + 1)}
                  disabled={followersLoading}
                >
                  {followersLoading ? "Loading..." : "Load More"}
                </Button>
              </Box>
            )}
          </TableContainer>

          {/* BROADCAST SECTION */}
          <Box mt={4}>
            <Typography variant="h6">Send Broadcast Email</Typography>

            <TextField
              label="Subject"
              fullWidth
              sx={{ mt: 2 }}
              value={broadcastSubject}
              onChange={(e) => setBroadcastSubject(e.target.value)}
            />

            <TextField
              label="Message"
              fullWidth
              multiline
              rows={4}
              sx={{ mt: 2 }}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
            />

            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleBroadcast}
            >
              Send Broadcast
            </Button>
          </Box>
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
