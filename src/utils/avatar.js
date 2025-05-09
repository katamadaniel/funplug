const DEFAULT_AVATAR_URL = process.env.REACT_APP_AVATAR_URL;

export const getAvatarUrl = (profile) => {
  if (!profile) {
    return DEFAULT_AVATAR_URL;
  }

  // Cloudinary URLs are complete, so use as-is if present
  if (profile.avatar && profile.avatar.startsWith('http')) {
    return profile.avatar;
  }

  if (profile.avatarUrl && profile.avatarUrl.startsWith('http')) {
    return profile.avatarUrl;
  }

  // Fallback to default
  return DEFAULT_AVATAR_URL;
};
