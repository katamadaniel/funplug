import React from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Skeleton,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { getAvatarUrl } from "./utils/avatar";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PLACEHOLDERS = Array.from({ length: 6 });

const UserProfileCarousel = ({ users = [], loading = false }) => {
  const navigate = useNavigate();

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const settings = {
    arrows: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2500,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const renderSkeletonCard = (_, i) => (
    <Box key={i} px={1}>
      <Card
        sx={{
          textAlign: "center",
          py: 3,
          borderRadius: 3,
        }}
      >
        <Skeleton
          variant="circular"
          width={110}
          height={110}
          sx={{ mx: "auto", mb: 2 }}
        />
        <Skeleton width="60%" sx={{ mx: "auto" }} />
        <Skeleton width="40%" sx={{ mx: "auto", mt: 1 }} />
      </Card>
    </Box>
  );

  const renderUserCard = (user) => {
    const avatarSrc = getAvatarUrl(user);

    return (
      <Box key={user._id} px={1}>
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            transition: "0.3s",
            "&:hover": {
              transform: "translateY(-6px)",
              boxShadow: 6,
            },
          }}
        >
          <CardActionArea
            onClick={() => handleProfileClick(user._id)}
            sx={{ py: 3 }}
          >
            {/* AVATAR */}
            <Box display="flex" justifyContent="center" mb={2}>
              {avatarSrc ? (
                <Avatar
                  src={avatarSrc}
                  alt={user.username}
                  sx={{
                    width: 110,
                    height: 110,
                    boxShadow: 3,
                  }}
                />
              ) : (
                <Skeleton variant="circular" width={110} height={110} />
              )}
            </Box>

            {/* USERNAME */}
            <Typography
              variant="subtitle1"
              fontWeight={600}
              textAlign="center"
              noWrap
            >
              {user.username}
            </Typography>

            {/* CATEGORY */}
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              {user.category || "—"}
            </Typography>

            {/* ICON */}
            <Box display="flex" justifyContent="center" mt={1}>
              <KeyboardArrowDownIcon
                sx={{ color: "text.secondary", fontSize: 22 }}
              />
            </Box>
          </CardActionArea>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Slider {...settings}>
        {loading || !users.length
          ? PLACEHOLDERS.map(renderSkeletonCard)
          : users.slice(0, 12).map(renderUserCard)}
      </Slider>
    </Box>
  );
};

export default UserProfileCarousel;
