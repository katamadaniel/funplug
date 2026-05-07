import React, { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Box,
  Stack,
  TextField,
  Divider,
  Fade,
  Modal,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import ShareIcon from "@mui/icons-material/Share";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Facebook";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import VerifiedIcon from "@mui/icons-material/Verified";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { followUser } from "./services/followService";
import { fetchEventById } from "./services/eventService";
import { fetchVenueById } from "./services/venuesService";
import { fetchPerformanceById } from "./services/performanceService";
import { fetchServiceById } from "./services/serviceService";

const suppressResizeObserverError = () => {
  const originalError = console.error;

  console.error = (...args) => {
    if (
      args?.[0]?.toString?.().includes("ResizeObserver loop completed") ||
      args?.[0]?.toString?.().includes("ResizeObserver loop limit exceeded")
    ) {
      return;
    }
    originalError(...args);
  };

  return () => {
    console.error = originalError;
  };
};

const ListingDetailsModal = ({ open, type, data, onClose, onAction }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFollowOpen, setIsFollowOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailedData, setDetailedData] = useState(data);
  const [loadError, setLoadError] = useState(null);

  const [followName, setFollowName] = useState("");
  const [followEmail, setFollowEmail] = useState("");

  const [followerCount, setFollowerCount] = useState(
    data?.userSnapshot?.followersCount || 0
  );

  useEffect(() => {
    if (detailedData?.userSnapshot?.followersCount !== undefined) {
      setFollowerCount(detailedData.userSnapshot.followersCount);
    }
  }, [detailedData?.userSnapshot?.followersCount]);

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  const user = detailedData?.userSnapshot;
  const creatorId = detailedData?.userSnapshot?._id;

  useEffect(() => {
    if (!open) return;
    setCarouselIndex(0);
    setFullscreenIndex(0);
    setFullscreenOpen(false);
    setIsFollowOpen(false);
  }, [open]);

  // Fetch full details when modal opens
  useEffect(() => {
    if (!open || !data?._id) return;

    const fetchDetails = async () => {
      try {
        setIsLoadingDetails(true);
        setLoadError(null);

        let fullData;
        switch (type) {
          case "event":
            fullData = await fetchEventById(data._id);
            break;
          case "venue":
            fullData = await fetchVenueById(data._id);
            break;
          case "performance":
            fullData = await fetchPerformanceById(data._id);
            break;
          case "service":
            fullData = await fetchServiceById(data._id);
            break;
          default:
            return;
        }

        if (fullData) {
          setDetailedData(fullData);
        }
      } catch (error) {
        console.error("Error fetching detailed data:", error);
        setLoadError("Failed to load full details");
        // Keep the initial data if fetch fails
        setDetailedData(data);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [open, data?._id, type]);

  useEffect(() => {
    const restore = suppressResizeObserverError();
    return restore;
  }, []);

  const handleAvatarError = (e) => {
    e.target.src = process.env.REACT_APP_AVATAR_URL;
  };

  const media = useMemo(() => {
    if (!detailedData) return [];

    const normalized = [];

    // EVENT SINGLE IMAGE SUPPORT
    if (type === "event") {
      if (detailedData.image) {
        normalized.push({
          type: "image",
          url: typeof detailedData.image === "string" ? detailedData.image : detailedData.image?.url,
        });
      }
    }

    // STANDARD IMAGES ARRAY SUPPORT
    if (Array.isArray(detailedData.images)) {
      detailedData.images.forEach((img) => {
        if (!img) return;
        const url = typeof img === "string" ? img : img.url;
        if (url) normalized.push({ type: "image", url });
      });
    }

    // OPTIONAL VIDEOS ARRAY SUPPORT
    if (Array.isArray(detailedData.videos)) {
      detailedData.videos.forEach((vid) => {
        if (!vid) return;
        const url = typeof vid === "string" ? vid : vid.url;
        if (url) normalized.push({ type: "video", url });
      });
    }

    // remove duplicates
    const seen = new Set();
    return normalized.filter((m) => {
      if (!m?.url) return false;
      if (seen.has(m.url)) return false;
      seen.add(m.url);
      return true;
    });
  }, [detailedData, type]);

  const shareUrl = window.location.href;

  const shareText = useMemo(() => {
    if (!detailedData) return "Check this out on FunPlug!";

    if (type === "event") return `Check out this event: ${detailedData.title} at ${detailedData.venue}!`;
    if (type === "venue") return `Check out this venue: ${detailedData.name} (${detailedData.venueType})`;
    if (type === "service") return `Check out this service: ${detailedData.serviceType} by ${detailedData.name}`;
    if (type === "performance") return `Check out this performer: ${detailedData.name} (${detailedData.artType})`;

    return "Check this out on FunPlug!";
  }, [type, detailedData]);

  const whatsappShare = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    shareText
  )}%20${encodeURIComponent(shareUrl)}`;

  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;

  const twitterShare = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(shareUrl)}`;

  const handleFollowSubmit = async (e) => {
    e.preventDefault();

    if (!creatorId) {
      alert("Creator not found.");
      return;
    }

    try {
      const res = await followUser(creatorId, {
        name: followName,
        email: followEmail,
      });

      if (res?.followersCount !== undefined) {
        setFollowerCount(res.followersCount);
      } else {
        setFollowerCount((prev) => prev + 1);
      }

      setFollowName("");
      setFollowEmail("");
      setIsFollowOpen(false);

      alert(res?.message || "Successfully followed!");
    } catch (err) {
      alert("Subscription failed.");
    }
  };

  const getTitle = () => {
    if (!detailedData) return "";

    if (type === "event") return detailedData.title;
    if (type === "venue") return detailedData.venueType;
    if (type === "service") return detailedData.serviceType;
    if (type === "performance") return detailedData.artType;

    return "";
  };

  const getSubtitle = () => {
    if (!detailedData) return "";

    if (type === "event") return `${detailedData.city}, ${detailedData.country}`;
    if (type === "venue") return `${detailedData.city}, ${detailedData.country}`;
    if (type === "service") return `${detailedData.city}, ${detailedData.country}`;
    if (type === "performance") return `${detailedData.city}, ${detailedData.country}`;

    return "";
  };

  const getActionText = () => {
    if (type === "event") return "Buy Ticket";
    if (type === "venue") return "Book Venue";
    if (type === "service") return "Book Service";
    if (type === "performance") return "Book Performance";
    return "Proceed";
  };

  const isActionDisabled = useMemo(() => {
    if (!detailedData) return true;

    if (type === "event") {
      const isRegularSoldOut = detailedData.regularTicketsRemaining <= 0;
      const isVipSoldOut = detailedData.vipTicketsRemaining <= 0;
      const isVvipSoldOut = detailedData.vvipTicketsRemaining <= 0;
      const isFreeSoldOut = detailedData.freeTicketsRemaining <= 0;

      const allPaidOptionsSoldOut =
        detailedData.ticketType === "paid" &&
        (!detailedData.regularPrice || isRegularSoldOut) &&
        (!detailedData.vipPrice || isVipSoldOut) &&
        (!detailedData.vvipPrice || isVvipSoldOut);

      return (
        (detailedData.ticketType === "paid" && allPaidOptionsSoldOut) ||
        (detailedData.ticketType === "free" && isFreeSoldOut)
      );
    }

    if (type === "venue" || type === "service" || type === "performance") {
      return detailedData.bookingStatus === "closed";
    }

    return false;
  }, [detailedData, type]);

  const openFullscreen = () => {
    setFullscreenIndex(carouselIndex);
    setFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setFullscreenOpen(false);
  };

  const nextFullscreen = () => {
    setFullscreenIndex((prev) => (prev + 1) % media.length);
  };

  const prevFullscreen = () => {
    setFullscreenIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  if (!detailedData) return null;

  return (
    <>
      {/* SHARE MODAL */}
      <Modal open={isShareOpen} onClose={() => setIsShareOpen(false)}>
        <Fade in={isShareOpen}>
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              p: 3,
              width: 320,
              borderRadius: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Share
            </Typography>

            <Stack direction="row" spacing={3} justifyContent="center">
              <a href={whatsappShare} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon fontSize="large" color="success" />
              </a>

              <a href={facebookShare} target="_blank" rel="noopener noreferrer">
                <FacebookIcon fontSize="large" color="primary" />
              </a>

              <a href={twitterShare} target="_blank" rel="noopener noreferrer">
                <TwitterIcon fontSize="large" color="primary" />
              </a>
            </Stack>
          </Paper>
        </Fade>
      </Modal>

      {/* MAIN MODAL */}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between">
            {/* USER INFO */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={user?.avatar}
                sx={{ width: 60, height: 60 }}
                onError={handleAvatarError}
              />

              <Box>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user?.username || "Unknown User"}
                  </Typography>

                  {(user?.accountVerified ||
                    user?.verificationStatus === "verified") && (
                    <VerifiedIcon fontSize="small" color="primary" />
                  )}
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {followerCount} Followers
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => setIsFollowOpen(!isFollowOpen)}
              >
                {isFollowOpen ? "Cancel" : "Follow"}
              </Button>
            </Stack>

            {/* SHARE + CLOSE */}
            <Stack direction="row" spacing={1}>
              <Tooltip title="Share">
                <IconButton onClick={() => setIsShareOpen(true)}>
                  <ShareIcon />
                </IconButton>
              </Tooltip>

              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {/* LOADING INDICATOR */}
          {isLoadingDetails && (
            <Box display="flex" justifyContent="center" alignItems="center" py={3}>
              <CircularProgress size={40} />
            </Box>
          )}

          {/* ERROR MESSAGE */}
          {loadError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {loadError}
            </Typography>
          )}

          {/* FOLLOW FORM */}
          {isFollowOpen && (
            <Box component="form" onSubmit={handleFollowSubmit} sx={{ mb: 3 }}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={followName}
                  onChange={(e) => setFollowName(e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Email"
                  value={followEmail}
                  onChange={(e) => setFollowEmail(e.target.value)}
                  fullWidth
                  required
                />

                <Button type="submit" variant="contained">
                  Subscribe
                </Button>
              </Stack>

              <Divider sx={{ mt: 3 }} />
            </Box>
          )}

          {/* HEADER */}
          <Typography variant="h5" fontWeight={700}>
            {getTitle()}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {getSubtitle()}
          </Typography>

          {/* MEDIA */}
          <Box position="relative" sx={{ mb: 2 }}>
            {media.length > 0 ? (
              <Carousel
                selectedItem={carouselIndex}
                onChange={(index) => setCarouselIndex(index)}
                infiniteLoop
                showThumbs={false}
                showStatus={false}
                dynamicHeight={false}
                emulateTouch
                swipeable
                renderArrowPrev={(clickHandler, hasPrev) =>
                  hasPrev && (
                    <IconButton
                      onClick={clickHandler}
                      sx={{
                        position: "absolute",
                        zIndex: 2,
                        top: "50%",
                        left: 12,
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                        width: 42,
                        height: 42,
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.7)",
                        },
                      }}
                    >
                      <ArrowBackIosNewIcon sx={{ color: "white", fontSize: 18 }} />
                    </IconButton>
                  )
                }
                renderArrowNext={(clickHandler, hasNext) =>
                  hasNext && (
                    <IconButton
                      onClick={clickHandler}
                      sx={{
                        position: "absolute",
                        zIndex: 2,
                        top: "50%",
                        right: 12,
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                        width: 42,
                        height: 42,
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.7)",
                        },
                      }}
                    >
                      <ArrowForwardIosIcon sx={{ color: "white", fontSize: 18 }} />
                    </IconButton>
                  )
                }
              >
                {media.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: 350,
                      borderRadius: 2,
                      overflow: "hidden",
                      cursor: "default",
                    }}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={`media-${index}`}
                        style={{
                          width: "100%",
                          height: "350px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <video
                        src={item.url}
                        controls
                        preload="metadata"
                        style={{
                          width: "100%",
                          height: "350px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Carousel>
            ) : (
              <Box
                sx={{
                  height: 300,
                  borderRadius: 2,
                  bgcolor: "grey.200",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography color="text.secondary">No media uploaded</Typography>
              </Box>
            )}

            {/* FULLSCREEN BUTTON */}
            {media.length > 0 && (
              <IconButton
                onClick={openFullscreen}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 5,
                  bgcolor: "rgba(0,0,0,0.45)",
                  borderRadius: "50%",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.65)",
                  },
                }}
              >
                <FullscreenIcon sx={{ color: "white" }} />
              </IconButton>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <ListingDetailsBody type={type} data={detailedData} />
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center" }}>
          <Button variant="contained" disabled={isActionDisabled} onClick={onAction}>
            {type === "event" && isActionDisabled
              ? "Tickets Sold Out"
              : getActionText()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FULLSCREEN MEDIA VIEWER */}
      <Modal open={fullscreenOpen} onClose={closeFullscreen}>
        <Box
          sx={{
            height: "100vh",
            width: "100vw",
            bgcolor: "rgba(0,0,0,0.92)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* CLOSE */}
          <IconButton
            onClick={closeFullscreen}
            sx={{
              position: "absolute",
              top: 20,
              right: 20,
              zIndex: 20,
              color: "white",
              bgcolor: "rgba(0,0,0,0.5)",
              borderRadius: "50%",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.7)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* PREV */}
          {media.length > 1 && (
            <IconButton
              onClick={prevFullscreen}
              sx={{
                position: "absolute",
                top: "50%",
                left: 20,
                transform: "translateY(-50%)",
                zIndex: 20,
                bgcolor: "rgba(0,0,0,0.5)",
                borderRadius: "50%",
                width: 50,
                height: 50,
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              <ArrowBackIosNewIcon sx={{ color: "white" }} />
            </IconButton>
          )}

          {/* NEXT */}
          {media.length > 1 && (
            <IconButton
              onClick={nextFullscreen}
              sx={{
                position: "absolute",
                top: "50%",
                right: 20,
                transform: "translateY(-50%)",
                zIndex: 20,
                bgcolor: "rgba(0,0,0,0.5)",
                borderRadius: "50%",
                width: 50,
                height: 50,
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.7)",
                },
              }}
            >
              <ArrowForwardIosIcon sx={{ color: "white" }} />
            </IconButton>
          )}

          {/* MEDIA DISPLAY */}
          {media[fullscreenIndex]?.type === "image" ? (
            <img
              src={media[fullscreenIndex]?.url}
              alt="fullscreen"
              style={{
                maxHeight: "90%",
                maxWidth: "90%",
                objectFit: "contain",
                borderRadius: 10,
              }}
            />
          ) : (
            <video
              src={media[fullscreenIndex]?.url}
              controls
              autoPlay
              style={{
                maxHeight: "90%",
                maxWidth: "90%",
                borderRadius: 10,
              }}
            />
          )}
        </Box>
      </Modal>
    </>
  );
};

export default ListingDetailsModal;

/* ----------------------------
   DETAILS BODY (TYPE BASED)
----------------------------- */

const ListingDetailsBody = ({ type, data }) => {
  if (!data) return null;

  if (type === "event") return <EventDetailsBody event={data} />;
  if (type === "venue") return <VenueDetailsBody venue={data} />;
  if (type === "service") return <ServiceDetailsBody service={data} />;
  if (type === "performance") return <PerformanceDetailsBody performance={data} />;

  return null;
};

/* ----------------------------
   EVENT DETAILS
----------------------------- */

const EventDetailsBody = ({ event }) => {
  const isRegularSoldOut = event.regularTicketsRemaining <= 0;
  const isVipSoldOut = event.vipTicketsRemaining <= 0;
  const isVvipSoldOut = event.vvipTicketsRemaining <= 0;
  const isFreeSoldOut = event.freeTicketsRemaining <= 0;

  return (
    <Box>
      <Typography>
        <strong>Venue:</strong> {event.venue}
      </Typography>

      <Typography>
        <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
      </Typography>

      <Typography>
        <strong>Starts:</strong> {event.startTime}
      </Typography>

      <Typography>
        <strong>Ends:</strong> {event.endTime}
      </Typography>

      <Typography sx={{ mt: 2 }}>
        <strong>Description:</strong> {event.description}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight={600}>
        Tickets
      </Typography>

      <Box sx={{ mt: 1 }}>
        {event.ticketType === "paid" && (
          <Stack spacing={1}>
            {event.regularPrice && (
              <TicketRow label="Regular" soldOut={isRegularSoldOut} price={event.regularPrice} />
            )}

            {event.vipPrice && (
              <TicketRow label="VIP" soldOut={isVipSoldOut} price={event.vipPrice} />
            )}

            {event.vvipPrice && (
              <TicketRow label="VVIP" soldOut={isVvipSoldOut} price={event.vvipPrice} />
            )}
          </Stack>
        )}

        {event.ticketType === "free" && (
          <TicketRow label="Free Ticket" soldOut={isFreeSoldOut} price={"Free"} />
        )}
      </Box>
    </Box>
  );
};

const TicketRow = ({ label, soldOut, price }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    sx={{
      p: 1.2,
      borderRadius: 2,
      bgcolor: "grey.100",
    }}
  >
    <Typography>{label}</Typography>

    <Typography
      sx={{
        color: soldOut ? "red" : "green",
        fontWeight: 600,
      }}
    >
      {soldOut ? "Sold Out" : price === "Free" ? "Free" : `Ksh. ${price}`}
    </Typography>
  </Stack>
);

/* ----------------------------
   VENUE DETAILS
----------------------------- */

const VenueDetailsBody = ({ venue }) => {
  return (
    <Stack spacing={1}>
      <Typography>
        <strong>Venue Name:</strong> {venue.name}
      </Typography>

      <Typography>
        <strong>Size:</strong> {venue.size} sq ft
      </Typography>

      <Typography>
        <strong>Capacity:</strong> {venue.capacity} people
      </Typography>

      <Typography>
        <strong>Duration:</strong> {venue.duration} hours/day
      </Typography>

      <Typography>
        <strong>Charges:</strong> Ksh. {venue.charges}/hour
      </Typography>

      <Typography>
        <strong>Status:</strong>{" "}
        <Chip
          label={venue.bookingStatus}
          color={venue.bookingStatus === "closed" ? "error" : "primary"}
          sx={{ textTransform: "capitalize", ml: 1 }}
        />
      </Typography>
    </Stack>
  );
};

/* ----------------------------
   SERVICE DETAILS
----------------------------- */

const ServiceDetailsBody = ({ service }) => {
  return (
    <Stack spacing={1}>
      <Typography>
        <strong>Provider:</strong> {service.name}
      </Typography>

      <Typography>
        <strong>Description:</strong> {service.description}
      </Typography>

      <Typography>
        <strong>Duration:</strong> {service.duration} hours/day
      </Typography>

      <Typography>
        <strong>Charges:</strong> Ksh. {service.charges}/hour
      </Typography>

      <Typography>
        <strong>Status:</strong>{" "}
        <Chip
          label={service.bookingStatus}
          color={service.bookingStatus === "closed" ? "error" : "primary"}
          sx={{ textTransform: "capitalize", ml: 1 }}
        />
      </Typography>
    </Stack>
  );
};

/* ----------------------------
   PERFORMANCE DETAILS
----------------------------- */

const PerformanceDetailsBody = ({ performance }) => {
  return (
    <Stack spacing={1}>
      <Typography>
        <strong>Performer:</strong> {performance.name}
      </Typography>

      <Typography>
        <strong>Charges:</strong> Ksh. {performance.charges}/hour
      </Typography>

      <Typography>
        <strong>Status:</strong>{" "}
        <Chip
          label={performance.bookingStatus}
          color={performance.bookingStatus === "closed" ? "error" : "primary"}
          sx={{ textTransform: "capitalize", ml: 1 }}
        />
      </Typography>
    </Stack>
  );
};