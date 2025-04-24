const DEFAULT_AVATAR_URL = process.env.REACT_APP_AVATAR_URL;
const API_URL = process.env.REACT_APP_API_URL;

export const getAvatarUrl = (profile) => {
  if (!profile) {
    return DEFAULT_AVATAR_URL;
  }

  // Check for both user and admin avatar fields
  if (profile.avatar) {
    return `${API_URL}${profile.avatar}`;
  }

  if (profile.avatarUrl) {
    return `${API_URL}${profile.avatarUrl}`;
  }

  // Default fallback
  return DEFAULT_AVATAR_URL;
};
